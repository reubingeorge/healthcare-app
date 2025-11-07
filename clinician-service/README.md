# Clinician Service

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2.4-green?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django%20REST%20Framework-3.15.2-red?logo=django&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-2.10.1-000000?logo=json-web-tokens&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-6.4.0-DC382D?logo=redis&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-23.0.0-499848?logo=gunicorn&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-1.21.10-85EA2D?logo=swagger&logoColor=black)
![WhiteNoise](https://img.shields.io/badge/WhiteNoise-6.8.2-lightgrey)

A Django-based clinician portal for the Healthcare Portal, providing clinician authentication, patient management, medical record operations, and AI-powered document analysis capabilities.

## Overview

The Clinician Service is a comprehensive web application for healthcare clinicians, enabling them to manage patients, view and upload medical records, perform AI-powered OCR analysis on documents, and track patient information. It integrates with multiple microservices for authentication, file storage, and AI processing.

## Features

### Authentication & Authorization
- **Clinician Registration**: Create new clinician accounts
- **Clinician Login**: Secure JWT-based authentication
- **Token Management**:
  - Access token generation with configurable expiration
  - Refresh token management
  - Activity-based token refresh
- **Logout**: Single and multi-device logout
- **Session Management**: Secure cookie-based session handling

### Profile Management
- **View Profile**: Access clinician profile information
- **Update Profile**: Modify clinician details
- **Specialization Management**: Track clinician specializations
- **Contact Information**: Manage phone numbers and contact details

### Dashboard
- **Statistics Overview**: View patient counts and appointment metrics
- **Upcoming Appointments**: See scheduled appointments
- **Recent Patients**: Quick access to recently viewed patients
- **Notifications**: System notifications and alerts

### Patient Management
- **View Assigned Patients**: List all patients assigned to the clinician
- **Patient Details**: View comprehensive patient information
- **Access Control**: Authorization checks ensure clinicians only access assigned patients
- **Patient Dashboard**: Dedicated view for each patient's medical information

### Medical Record Management
- **Upload Medical Records**: Add new medical documents for patients
- **Download Records**: Retrieve encrypted medical documents
- **View Records**: In-browser preview using temporary decrypted files
- **Delete Records**: Remove medical documents (with proper authorization)
- **Record Types**: Support for various medical document types

### AI-Powered Analysis
- **OCR Processing**: Submit medical records for optical character recognition
- **Real-Time Progress**: WebSocket-based progress tracking
- **Job Management**: Track OCR job status and results
- **Result Retrieval**: Access extracted text and analysis data
- **GPU Acceleration**: Leverage GPU for faster OCR processing

### Security
- **JWT Authentication**: Token-based authentication for API and web requests
- **Access Control**: Role-based and assignment-based authorization
- **Encrypted Files**: Integration with encrypted file storage
- **Temporary Files**: Secure temporary file handling with automatic cleanup
- **Audit Logging**: Event logging for all clinician actions
- **Secure Cookies**: HTTPOnly and Secure flags in production

### Integration
- **Database Service**: Stateless architecture with centralized data management
- **File Service**: Encrypted medical record storage and retrieval
- **OCR Service**: AI-powered document analysis
- **Auth Service**: User authentication coordination
- **Redis**: Temporary file tracking and session management

## Architecture

### Technology Stack

**Backend**:
- Django 5.2.4
- Django REST Framework 3.15.2
- PyJWT 2.10.1 (JWT authentication)
- Redis 6.4.0 (caching and temporary file tracking)
- Gunicorn 23.0.0 (WSGI server)
- Python 3.11

**API Documentation**:
- drf-yasg 1.21.10 (Swagger/OpenAPI)

**Dependencies**:
- django-cors-headers 4.6.0
- python-decouple 3.8 (configuration management)
- whitenoise 6.8.2 (static file serving)
- requests 2.32.4 (HTTP client for microservices)

**Database**:
- SQLite (in-memory for Django internals only)
- Stateless architecture - data managed by database-service

### Service Communication

The Clinician Service communicates with:

1. **database-service**: User, clinician, patient, and medical record data
2. **auth-service**: Authentication coordination
3. **file-service**: Encrypted medical record storage and retrieval
4. **ocr-service**: AI-powered OCR and document analysis
5. **redis**: Temporary file tracking and caching

### Middleware

**JWTAuthenticationMiddleware** (`clinicians/middleware.py`):
- Validates JWT tokens from cookies or Authorization headers
- Ensures user has CLINICIAN role
- Attaches user data to request object
- Handles token expiration gracefully
- Exempts health check and static file endpoints

### Service Layer

**DatabaseService** (`clinicians/services.py:9`):
- Centralized HTTP client for database-service communication
- User authentication and management
- Clinician profile operations
- Patient data retrieval
- Medical record metadata operations
- Event logging
- Refresh token management

## Docker Deployment

### Build Docker Image

```bash
docker build -t clinician-service .
```

### Run Docker Container

```bash
docker run -p 8003:8003 --env-file .env clinician-service
```

### Run with Environment Variables

```bash
docker run -p 8003:8003 \
  -e SECRET_KEY=your-secret-key \
  -e JWT_SECRET_KEY=your-jwt-secret \
  -e DATABASE_SERVICE_URL=http://database-service:8004 \
  -e FILE_SERVICE_URL=http://file-service:8006 \
  -e OCR_SERVICE_URL=http://ocr-service:8008 \
  -e REDIS_URL=redis://redis:6379 \
  -e DATABASE_SERVICE_TOKEN=your-service-token \
  clinician-service
```

### Docker Compose

```bash
# Start service with docker-compose
docker-compose up -d clinician-service

# View logs
docker-compose logs -f clinician-service

# Stop service
docker-compose down
```

### Health Check

```bash
# Check if service is running
curl http://localhost:8003/health/
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key (required) | None |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `*` |
| `JWT_SECRET_KEY` | JWT signing key (required) | Same as SECRET_KEY |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_ACCESS_TOKEN_LIFETIME` | Access token lifetime (minutes) | `15` |
| `JWT_REFRESH_TOKEN_LIFETIME` | Refresh token lifetime (minutes) | `1440` |
| `DATABASE_SERVICE_URL` | Database service URL | `http://database-service:8004` |
| `DATABASE_SERVICE_TOKEN` | Database service auth token (required) | None |
| `AUTH_SERVICE_URL` | Auth service URL | `http://auth-service:8001` |
| `FILE_SERVICE_URL` | File service URL | `http://file-service:8006` |
| `OCR_SERVICE_URL` | OCR service URL | `http://ocr-service:8008` |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost,http://127.0.0.1` |

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/clinician/auth/signup/` | POST | None | Register new clinician |
| `/api/clinician/auth/login/` | POST | None | Login clinician |
| `/api/clinician/auth/logout/` | POST | Required | Logout current session |
| `/api/clinician/auth/refresh/` | POST | None | Refresh access token |
| `/api/clinician/auth/refresh-if-active/` | POST | None | Activity-based token refresh |

### Profile & Dashboard Endpoints

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/clinician/auth/profile/` | GET, PUT | Required | Get/update clinician profile |
| `/api/clinician/dashboard/` | GET | Required | Get dashboard data |

### Patient Management Endpoints

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/clinician/patients/` | GET | Required | List assigned patients |
| `/api/clinician/patients/<id>/` | GET | Required | Get patient details |
| `/api/clinician/patients/<id>/dashboard/` | GET | Required | View patient dashboard |

### Medical Record Endpoints

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/files/medical-records/<file_id>/download/` | GET | Required | Download medical record |
| `/api/files/medical-records/<file_id>/view/` | POST | Required | Create temporary view |
| `/api/files/medical-records/<file_id>/delete/` | DELETE | Required | Delete medical record |
| `/api/files/medical-records/<file_id>/analyze/` | POST | Required | Submit for OCR analysis |
| `/api/files/temp/cleanup/` | POST | Required | Cleanup temporary file |

### OCR Endpoints

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/clinician/ocr/job/<job_id>/result/` | GET | Required | Get OCR analysis result |

### Web Template Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/clinician/dashboard/` | GET | Clinician dashboard page |
| `/clinician/patients/<id>/dashboard/` | GET | Patient dashboard page |
| `/clinician/patients/<id>/add-record/` | GET, POST | Add medical record page |
| `/health/` | GET | Health check |

## Project Structure

```
clinician-service/
├── clinicians/                 # Main application
│   ├── __init__.py
│   ├── middleware.py           # JWT authentication middleware
│   ├── serializers.py          # DRF serializers
│   ├── services.py             # DatabaseService client
│   ├── views.py                # API views
│   ├── template_views.py       # Web template views
│   ├── urls.py                 # API URL routing
│   ├── template_urls.py        # Template URL routing
│   ├── health_urls.py          # Health check URLs
│   └── templatetags/           # Custom template tags
│       └── patient_extras.py   # Patient template filters
├── static/                     # Static assets
│   ├── css/                    # Stylesheets
│   └── js/                     # JavaScript files
├── staticfiles/                # Collected static files
├── templates/                  # HTML templates
│   ├── base.html               # Base template
│   ├── clinician_dashboard.html # Clinician dashboard
│   ├── patient_dashboard.html  # Patient dashboard
│   └── add_medical_record.html # Add record form
├── media/                      # Media files (temporary records)
├── Dockerfile                  # Docker configuration
├── entrypoint.sh               # Docker entrypoint script
├── manage.py                   # Django management script
├── requirements.txt            # Python dependencies
├── settings.py                 # Django settings
├── urls.py                     # Root URL configuration
└── wsgi.py                     # WSGI entry point
```

## Key Components

### Views (`clinicians/views.py`)
- Clinician authentication (signup, login, logout, refresh)
- Profile management
- Dashboard data aggregation
- Patient list and detail views
- Medical record operations (upload, download, delete, view)
- AI/OCR analysis submission
- OCR result retrieval
- Temporary file management

### Template Views (`clinicians/template_views.py`)
- Clinician dashboard rendering
- Patient dashboard rendering
- Medical record upload form
- Authorization checks for patient access

### Serializers (`clinicians/serializers.py`)
- Clinician registration and login validation
- Profile update validation
- Dashboard data serialization
- Patient list serialization
- Token management

## Security Considerations

### Authentication & Authorization
- JWT-based authentication for all endpoints
- Role-based access control (CLINICIAN role required)
- Assignment-based authorization (clinicians can only access assigned patients)
- Event logging for all clinician actions
- Secure password hashing

### Medical Record Security
- Files retrieved from encrypted storage
- Temporary files created with unique identifiers
- Automatic cleanup of temporary files after 1 hour
- Redis tracking for temporary file lifecycle
- Download authorization checks

### Token Security
- Configurable token expiration times
- Tokens stored in HTTPOnly cookies
- Refresh token invalidation on logout
- Activity-based refresh to prevent constant regeneration

### Production Settings
- Force HTTPS in production
- Secure session cookies
- Secure CSRF cookies
- XSS filter enabled
- Clickjacking protection

## Medical Record Workflow

### Upload Flow
1. Clinician selects patient and record type
2. File uploaded to file-service
3. File encrypted and stored
4. Medical record metadata created in database
5. Clinician receives confirmation

### View Flow
1. Clinician requests to view record
2. File downloaded from file-service (decrypted)
3. Temporary file created with unique ID
4. Temporary file info stored in Redis with 1-hour expiry
5. Clinician views file in browser
6. Automatic cleanup after 1 hour or manual cleanup on modal close

### AI Analysis Flow
1. Clinician submits medical record for OCR analysis
2. File downloaded from file-service (decrypted)
3. Temporary file created locally
4. File submitted to OCR service
5. OCR job created and tracked
6. Real-time progress via WebSocket (if supported)
7. Results retrieved and displayed to clinician
8. Temporary file cleaned up

## Logging

The service logs to console (stdout) with configurable log levels. Logs include:
- Authentication events (login, logout, registration)
- Patient access events
- Medical record operations
- OCR job submissions and results
- Service communication errors
- Temporary file management

## Port

Default port: **8003**

## Health Check

The service provides a health check endpoint for monitoring and orchestration tools.

## API Documentation

Swagger/OpenAPI documentation is available via drf-yasg for interactive API exploration and testing.

## Best Practices

### Security
- Always use strong, unique SECRET_KEY and JWT_SECRET_KEY values in production
- Never commit secrets to version control
- Use environment variables for all sensitive configuration
- Enable HTTPS in production environments
- Regularly rotate JWT secret keys
- Monitor audit logs for suspicious activity
- Implement proper file access controls

### Performance
- Redis for temporary file tracking
- Stateless architecture for horizontal scaling
- Efficient database service communication
- Temporary file cleanup to prevent storage bloat

### Deployment
- Use Docker for consistent deployments
- Configure proper CORS settings
- Set appropriate token lifetimes
- Use reverse proxy for SSL termination
- Implement proper monitoring and alerting
- Regular cleanup of temporary files

## License

Copyright (c) 2025 Healthcare Portal. All rights reserved.
