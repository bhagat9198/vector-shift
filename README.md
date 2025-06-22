# Vector Shift Integration Platform

A modern integration platform connecting various third-party services like HubSpot, Notion, and Airtable through a unified API and user interface.

## 📋 Project Structure

```
vector-shift/
├── backend/           # FastAPI backend service
│   ├── config/        # Configuration files
│   ├── integrations/  # Integration modules
│   ├── routers/       # API routes
│   ├── main.py        # FastAPI application entry point
│   └── requirements.txt
├── frontend/          # React frontend application
│   ├── public/
│   └── src/
└── README.md          # This file
```

## 🚀 Features

- **Multi-service Integration**: Connect with HubSpot, Notion, and Airtable
- **OAuth2 Authentication**: Secure token management
- **Modern UI**: Built with React and Material-UI
- **RESTful API**: Built with FastAPI
- **Scalable Architecture**: Designed for easy addition of new integrations

## 🛠️ Prerequisites

- Python 3.8+
- Node.js 16+
- Redis
- Python virtual environment
- npm or yarn

## 🏗️ Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run Redis:
   ```bash
   # On macOS
   brew services start redis
   
   # Or using Docker
   docker run --name redis -p 6379:6379 -d redis
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

## 🚦 Running the Application

### Start Backend

```bash
cd backend
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Start Frontend

```bash
cd frontend
npm start
# or
yarn start
```

The frontend will be available at `http://localhost:3000`

## 📚 API Documentation

Once the backend is running, you can access:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔒 Environment Variables

### Backend (`.env`)

| Variable | Description | Required | Default |
|----------|-------------|:--------:|:-------:|
| `ENV` | Environment | No | `development` |
| `DEBUG` | Debug mode | No | `True` |
| `BASE_URL` | API base URL | Yes | - |
| `FRONTEND_URL` | Frontend URL | Yes | - |
| `REDIS_URL` | Redis URL | No | `redis://localhost:6379` |
| `HUBSPOT_CLIENT_ID` | HubSpot OAuth ID | Yes | - |
| `HUBSPOT_CLIENT_SECRET` | HubSpot OAuth secret | Yes | - |

### Frontend (`.env`)

| Variable | Description | Required | Default |
|----------|-------------|:--------:|:-------:|
| `REACT_APP_API_URL` | Backend API URL | Yes | `http://localhost:8000` |


## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
# or
yarn test
```

## 🚀 Deployment

### Backend

```bash
# Build Docker image
docker build -t vector-shift-backend .

# Run container
docker run -p 8000:8000 --env-file .env vector-shift-backend
```

### Frontend

```bash
# Build for production
cd frontend
npm run build

# Serve static files
npx serve -s build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
