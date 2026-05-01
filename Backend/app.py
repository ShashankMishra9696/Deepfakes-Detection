import io
import os
import cv2
import torch
import numpy as np
from PIL import Image
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from torchvision import transforms
from transformers import ViTConfig, ViTForImageClassification
from safetensors.torch import load_file
from typing import Dict, List
import firebase_admin
from firebase_admin import credentials, firestore

# ----------------------------
# Firebase Initialization
# ----------------------------
try:
    # Initialize Firebase Admin SDK
    cred = credentials.Certificate("firebase-service-account.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Firebase Firestore connected successfully!")
except Exception as e:
    print(f"❌ Firebase initialization error: {e}")
    db = None

# ----------------------------
# App
# ----------------------------
app = FastAPI(title="Deepfake Image Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Device
# ----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# ----------------------------
# Model Config
# ----------------------------
config = ViTConfig(
    num_labels=2,
    image_size=224,
    hidden_size=768,
    num_hidden_layers=12,
    num_attention_heads=12,
    intermediate_size=3072,
)

model = None

def load_model():
    """Load the model only once (lazy loading)"""
    global model
    if model is None:
        print("Loading ViT model...")
        try:
            model = ViTForImageClassification(config)
            state_dict = load_file("model/model.safetensors")
            model.load_state_dict(state_dict)
            model.to(device)
            model.eval()
            print("✅ Model loaded successfully!")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise HTTPException(status_code=500, detail="Failed to load model")

# ----------------------------
# Face Detector
# ----------------------------
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

if face_cascade.empty():
    print("❌ Could not load face cascade classifier!")
else:
    print("✅ Face cascade classifier loaded")

# ----------------------------
# Transform
# ----------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5]*3, [0.5]*3),
])

# ----------------------------
# Firestore Helper Functions
# ----------------------------

def add_detection_to_firestore(user_id: str, detection_data: Dict):
    """Add a detection record to Firestore"""
    if not db:
        print("⚠️ Firestore not initialized, skipping save")
        return False
    
    try:
        # Add to detections collection
        db.collection('users').document(user_id).collection('detections').add({
            'prediction': detection_data['prediction'],
            'confidence': detection_data['confidence'],
            'timestamp': firestore.SERVER_TIMESTAMP,
            'filename': detection_data['filename'],
            'faces_detected': detection_data.get('faces_detected', 0),
            'real_probability': detection_data.get('real_probability', 0),
            'fake_probability': detection_data.get('fake_probability', 0),
        })
        
        # Update user stats
        update_user_stats(user_id, detection_data['prediction'])
        
        return True
    except Exception as e:
        print(f"❌ Error saving to Firestore: {e}")
        return False

def update_user_stats(user_id: str, prediction: str):
    """Update user statistics in Firestore"""
    if not db:
        return
    
    try:
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if user_doc.exists:
            stats = user_doc.to_dict().get('stats', {})
        else:
            stats = {
                'total_checks': 0,
                'fake_count': 0,
                'real_count': 0,
                'no_face_count': 0
            }
        
        # Update counts
        stats['total_checks'] = stats.get('total_checks', 0) + 1
        
        if 'no face' in prediction.lower():
            stats['no_face_count'] = stats.get('no_face_count', 0) + 1
        elif prediction.lower() == 'fake':
            stats['fake_count'] = stats.get('fake_count', 0) + 1
        elif prediction.lower() == 'real':
            stats['real_count'] = stats.get('real_count', 0) + 1
        
        # Save stats
        user_ref.set({
            'stats': stats,
            'last_updated': firestore.SERVER_TIMESTAMP
        }, merge=True)
        
    except Exception as e:
        print(f"❌ Error updating stats: {e}")

def get_user_stats_from_firestore(user_id: str) -> Dict:
    """Get user statistics from Firestore"""
    if not db:
        return {
            'total_checks': 0,
            'fake_count': 0,
            'real_count': 0,
            'no_face_count': 0,
            'avg_confidence': 0.0
        }
    
    try:
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return {
                'total_checks': 0,
                'fake_count': 0,
                'real_count': 0,
                'no_face_count': 0,
                'avg_confidence': 0.0
            }
        
        stats = user_doc.to_dict().get('stats', {})
        
        # Calculate average confidence
        detections = db.collection('users').document(user_id).collection('detections').stream()
        confidences = [d.to_dict()['confidence'] for d in detections if d.to_dict()['confidence'] > 0]
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
        
        return {
            'total_checks': stats.get('total_checks', 0),
            'fake_count': stats.get('fake_count', 0),
            'real_count': stats.get('real_count', 0),
            'no_face_count': stats.get('no_face_count', 0),
            'avg_confidence': round(avg_conf, 2)
        }
    except Exception as e:
        print(f"❌ Error fetching stats: {e}")
        return {
            'total_checks': 0,
            'fake_count': 0,
            'real_count': 0,
            'no_face_count': 0,
            'avg_confidence': 0.0
        }

def get_user_history_from_firestore(user_id: str, limit: int = 50) -> List[Dict]:
    """Get detection history from Firestore"""
    if not db:
        return []
    
    try:
        detections_ref = db.collection('users').document(user_id).collection('detections')
        detections = detections_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(limit).stream()
        
        history = []
        for doc in detections:
            data = doc.to_dict()
            # Convert Firestore timestamp to ISO string
            timestamp = data.get('timestamp')
            if timestamp:
                data['timestamp'] = timestamp.isoformat()
            history.append(data)
        
        return history
    except Exception as e:
        print(f"❌ Error fetching history: {e}")
        return []

# ----------------------------
# Routes
# ----------------------------

@app.get("/")
def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Deepfake Detection API",
        "version": "2.0",
        "device": str(device),
        "model_loaded": model is not None,
        "firestore_connected": db is not None
    }

@app.get("/health")
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_status": "loaded" if model is not None else "not_loaded",
        "device": str(device),
        "face_cascade_loaded": not face_cascade.empty(),
        "firestore_status": "connected" if db else "disconnected"
    }

# ----------------------------
# Main Prediction Endpoint
# ----------------------------
@app.post("/predict")
async def predict(file: UploadFile = File(...), user_id: str = "anonymous"):
    """
    Predict if an uploaded image is real or fake
    
    Args:
        file: Image file (JPEG, PNG, WebP)
        user_id: User identifier for tracking history
    
    Returns:
        prediction: "Real", "Fake", or "No Face Detected"
        confidence: Confidence percentage (0-100)
        timestamp: ISO timestamp
        filename: Original filename
    """
    try:
        # Load model if not already loaded
        load_model()

        # Read image
        image_bytes = await file.read()
        
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

        # Convert to numpy for face detection
        img_np = np.array(image)
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

        # Detect faces
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )

        # No face detected
        if len(faces) == 0:
            detection_data = {
                "prediction": "No Face Detected",
                "confidence": 0.0,
                "filename": file.filename,
                "faces_detected": 0,
                "real_probability": 0.0,
                "fake_probability": 0.0
            }
            
            # Save to Firestore
            add_detection_to_firestore(user_id, detection_data)
            
            return {
                "error": "No face detected in the image",
                "prediction": "No Face Detected",
                "confidence": 0.0,
                "timestamp": datetime.utcnow().isoformat(),
                "filename": file.filename,
                "faces_detected": 0
            }

        # Face detected - proceed with deepfake detection
        input_tensor = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            logits = model(pixel_values=input_tensor).logits
            probs = torch.softmax(logits, dim=1)[0]

        real_prob, fake_prob = probs.tolist()

        # Determine prediction
        if fake_prob > real_prob:
            prediction = "Fake"
            confidence = fake_prob * 100
        else:
            prediction = "Real"
            confidence = real_prob * 100

        # Create detection data
        detection_data = {
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "filename": file.filename,
            "faces_detected": len(faces),
            "real_probability": round(real_prob * 100, 2),
            "fake_probability": round(fake_prob * 100, 2)
        }
        
        # Save to Firestore
        add_detection_to_firestore(user_id, detection_data)

        return {
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "timestamp": datetime.utcnow().isoformat(),
            "filename": file.filename,
            "faces_detected": len(faces),
            "real_probability": round(real_prob * 100, 2),
            "fake_probability": round(fake_prob * 100, 2)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error during prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# ----------------------------
# Dashboard Stats Endpoint
# ----------------------------
@app.get("/stats/{user_id}")
def get_stats(user_id: str):
    """
    Get detection statistics for a user
    
    Args:
        user_id: User identifier
        
    Returns:
        Statistics including total checks, fake/real counts, avg confidence
    """
    stats = get_user_stats_from_firestore(user_id)
    
    return {
        "user_id": user_id,
        "stats": stats
    }

# ----------------------------
# History Endpoint
# ----------------------------
@app.get("/history/{user_id}")
def get_history(user_id: str, limit: int = 50):
    """
    Get detection history for a user
    
    Args:
        user_id: User identifier
        limit: Maximum number of records to return (default 50)
        
    Returns:
        List of detection records
    """
    history = get_user_history_from_firestore(user_id, limit)
    
    return {
        "user_id": user_id,
        "total_records": len(history),
        "returned_records": len(history),
        "history": history
    }

# ----------------------------
# Clear History Endpoint
# ----------------------------
@app.delete("/history/{user_id}")
def clear_history(user_id: str):
    """
    Clear detection history for a user
    
    Args:
        user_id: User identifier
    """
    if not db:
        raise HTTPException(status_code=503, detail="Firestore not available")
    
    try:
        # Delete all detections
        detections_ref = db.collection('users').document(user_id).collection('detections')
        detections = detections_ref.stream()
        
        count = 0
        for doc in detections:
            doc.reference.delete()
            count += 1
        
        # Reset stats
        db.collection('users').document(user_id).set({
            'stats': {
                'total_checks': 0,
                'fake_count': 0,
                'real_count': 0,
                'no_face_count': 0
            },
            'last_updated': firestore.SERVER_TIMESTAMP
        }, merge=True)
        
        return {
            "message": f"Deleted {count} records for user {user_id}",
            "deleted_count": count
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear history: {str(e)}")

# ----------------------------
# Model Info Endpoint
# ----------------------------
@app.get("/model/info")
def model_info():
    """Get information about the loaded model"""
    return {
        "model_name": "Vision Transformer (ViT)",
        "architecture": "ViT-B/16",
        "image_size": 224,
        "num_labels": 2,
        "labels": ["Real", "Fake"],
        "hidden_size": 768,
        "num_layers": 12,
        "num_attention_heads": 12,
        "device": str(device),
        "loaded": model is not None
    }

# ----------------------------
# Startup Event
# ----------------------------
@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    print("=" * 50)
    print("🚀 Starting Deepfake Detection API")
    print("=" * 50)
    print(f"📱 Device: {device}")
    print(f"🔥 Firestore: {'Connected' if db else 'Not Connected'}")
    print(f"🤖 Model: {'Ready to load' if not model else 'Loaded'}")
    print("=" * 50)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)