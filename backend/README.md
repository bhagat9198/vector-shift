# Integration Backend

This is the backend service for managing third-party integrations like HubSpot, Notion, and Airtable. It provides OAuth2 authentication and data access APIs.

## Features

- OAuth2 authentication for multiple services
- Token management and refresh
- Standardized data models for different services
- Redis-based session and token storage
- API documentation with Swagger UI

## Prerequisites

- Python 3.8+
- Redis server
- Python virtual environment
- Environment variables (see `.env.example`)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run Redis server**
   ```bash
   # On macOS
   brew services start redis
   
   # Or using Docker
   docker run --name redis -p 6379:6379 -d redis
   ```

## Running the Application

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Available Endpoints

### HubSpot Integration

- `POST /api/v1/hubspot/authorize` - Start OAuth flow
- `GET /api/v1/hubspot/oauth2callback` - OAuth callback
- `POST /api/v1/hubspot/credentials` - Get stored credentials
- `POST /api/v1/hubspot/load` - Load data from HubSpot

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|:--------:|:-------:|
| `ENV` | Application environment | No | `development` |
| `DEBUG` | Enable debug mode | No | `True` |
| `BASE_URL` | Base URL of the API | Yes | - |
| `FRONTEND_URL` | URL of the frontend application | Yes | - |
| `REDIS_URL` | Redis connection URL | No | `redis://localhost:6379` |
| `HUBSPOT_CLIENT_ID` | HubSpot OAuth client ID | Yes | - |
| `HUBSPOT_CLIENT_SECRET` | HubSpot OAuth client secret | Yes | - |

## Development

### Code Style

This project uses `black` for code formatting and `isort` for import sorting.

```bash
# Install development dependencies
pip install black isort

# Format code
black .


# Sort imports
isort .
```

### Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## Deployment

### Docker

```bash
docker build -t integration-backend .
docker run -p 8000:8000 --env-file .env integration-backend
```

### Production

For production deployment, consider using:

- Gunicorn with Uvicorn workers
- Nginx as a reverse proxy
- HTTPS with Let's Encrypt
- Process manager (PM2, systemd, etc.)

## License

[Your License Here]