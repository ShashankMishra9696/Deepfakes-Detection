# Deepfake Detection 

A full-stack web application for detecting deepfake images using a Vision Transformer (ViT) model. The backend is built with FastAPI and PyTorch, while the frontend uses Next.js with Firebase for authentication and data storage.


## Features

- **Image Upload & Prediction**: Upload images to detect if they are real or fake.
- **Face Detection**: Uses OpenCV to detect faces before running the model.
- **User Authentication**: Firebase Auth for login/signup.
- **History & Stats**: Track detection history and statistics per user.
- **Responsive UI**: Modern, mobile-friendly interface.

## Tech Stack

- **Backend**: FastAPI, PyTorch, Transformers, OpenCV
- **Frontend**: Next.js, React, Tailwind CSS, Firebase
- **Database**: Firebase Firestore
- **Model**: ViT (Vision Transformer) for image classification

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- Git LFS (for the model file)

### Backend Setup
1. Navigate to the Backend directory.
2. Install Python dependencies: `pip install -r requirements.txt`
3. Set up Firebase (optional for full functionality).
4. Run the backend: `python -m uvicorn app:app --host 0.0.0.0 --port 8000`

### Frontend Setup
1. Navigate to the Frontend directory.
2. Install Node.js dependencies: `npm install`
3. Create a `.env.local` file with your Firebase config and backend URL.
4. Run the frontend: `npm run dev`
5. Open in browser.

## API Endpoints

- `GET /`: Health check
- `GET /health`: Detailed health check
- `POST /predict`: Upload an image for prediction (requires `user_id`)
- `GET /stats/{user_id}`: Get user statistics
- `GET /history/{user_id}`: Get user detection history
- `DELETE /history/{user_id}`: Clear user history

## Model Details

- **Model File**: `Backend/model/model.safetensors` (343MB, tracked with Git LFS)
- **Architecture**: ViT-Base with 12 layers, 768 hidden size
- **Input**: 224x224 RGB images
- **Output**: Binary classification (Real/Fake)

The model is loaded lazily on the first prediction request.

## Usage

1. Sign up/login on the frontend.
2. Upload an image on the "Detect" page.
3. View results, confidence scores, and history.

## Deployment

- **Backend**: Deploy to cloud services.
- **Frontend**: Deploy to hosting platforms.
- Ensure environment variables are set.

## License

MIT License