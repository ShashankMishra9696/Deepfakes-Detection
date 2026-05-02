# Deepfake Detection API

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
1. Clone the repository:
   ```bash
   git clone https://github.com/ShashankMishra9696/Deepfakes-Detector.git
   cd Deepfakes-Detector
   ```

2. Install Git LFS and pull the model:
   ```bash
   git lfs install
   git lfs pull
   ```

3. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Set up Firebase (optional for full functionality):
   - Place your `firebase-service-account.json` in the `Backend/` directory.
   - Update Firebase config in the frontend if needed.

6. Run the backend:
   ```bash
   python -m uvicorn app:app --host 0.0.0.0 --port 8000
   ```

### Frontend Setup
1. Navigate to the Frontend directory:
   ```bash
   cd ../Frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Firebase config and backend URL:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   ```

4. Run the frontend:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

- **Backend**: Deploy to services like Render, Railway, or Heroku.
- **Frontend**: Deploy to Vercel or Netlify.
- Ensure environment variables are set for Firebase and backend URL.

## Contributing

1. Fork the repo.
2. Create a feature branch.
3. Commit changes.
4. Push and create a PR.

## License

MIT License