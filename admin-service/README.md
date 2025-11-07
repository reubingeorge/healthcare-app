# Admin Service

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2.4-green?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django%20REST%20Framework-3.15.2-red?logo=django&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-2.10.1-000000?logo=json-web-tokens&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-23.0.0-499848?logo=gunicorn&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![WhiteNoise](https://img.shields.io/badge/WhiteNoise-6.9.0-lightgrey)
![CORS](https://img.shields.io/badge/CORS-4.6.0-orange)
![Requests](https://img.shields.io/badge/Requests-2.32.4-yellowgreen)

A Django-based administrative web interface for the Healthcare Portal, providing centralized management of users, cancer types, patient assignments, and RAG (Retrieval-Augmented Generation) documentation.

## Overview

The Admin Service serves as the central administrative hub for the Healthcare Portal microservices architecture. It provides authenticated administrators with a web-based dashboard to manage system resources, monitor service health, and configure cancer-related data for the AI-powered chatbot system.

## Features

### User Management
- **View All Users**: Browse and filter users by role (Patient, Clinician, Admin) and status (Active, Inactive)
- **User Details**: View detailed information for individual users
- **Toggle User Status**: Activate or deactivate user accounts
- **Patient Management**:
  - Update patient demographic information (date of birth, gender, phone, address)
  - Manage emergency contact details
  - Set preferred language
  - Assign patients to cancer subtypes
  - Assign patients to clinicians
  - Add assignment notes
- **Clinician Management**:
  - Update clinician contact information
  - Manage multiple specializations per clinician

### Cancer Type Management
- **CRUD Operations**: Create, Read, Update, and Delete cancer types and subtypes
- **Hierarchical Organization**: Support for parent cancer types with nested subtypes
- **Subtype Relationships**: Maintain parent-child relationships between cancer types

### RAG Document Management
- **Document Upload**: Upload medical documents for the RAG system
- **Cancer Type Association**: Link documents to specific cancer types
- **Automatic Processing**: Trigger embedding generation for uploaded documents
- **Document Listing**: View all RAG documents with pagination and filtering
- **Delete Documents**: Remove documents and their associated embeddings
- **Embedding Status Tracking**: Monitor document processing and embedding job status
- **Integration**: Seamless coordination with file-service and rag-embedding-service

### Dashboard & Monitoring
- **Statistics Overview**:
  - Total users count
  - Active patients count
  - Active clinicians count
  - Cancer types count
  - Inactive users count
  - New users (last 7 days)
  - Total administrators
- **Service Health Monitoring**: Real-time health checks for all microservices
  - auth-service
  - patient-service
  - clinician-service
  - database-service
  - file-service
  - rag-embedding-service
  - ocr-service
  - admin-service (self-check)
- **Response Time Monitoring**: Track API response times
- **Quick Actions**: Direct links to common administrative tasks

### Security
- **JWT Authentication**: Token-based authentication using JWT
- **Role-Based Access Control**: Restricted to users with ADMIN role
- **Automatic Redirects**: Unauthenticated users redirected to login
- **Token Validation**: Middleware validates JWT tokens on every request
- **Secure Headers**: XSS filter, clickjacking protection, content-type sniffing protection
- **CSRF Protection**: Cross-Site Request Forgery protection enabled
- **Session Management**: Secure cookie settings with HTTPOnly and SameSite attributes

## Architecture

### Technology Stack

**Backend**:
- Django 5.2.4
- Django REST Framework 3.15.2
- Gunicorn 23.0.0 (WSGI server)
- PyJWT 2.10.1 (JWT authentication)
- Requests 2.32.4 (HTTP client for microservices)
- Python 3.11

**Frontend**:
- Tailwind CSS (utility-first CSS framework)
- Vanilla JavaScript
- HTML templates (Django template engine)

**Dependencies**:
- django-cors-headers 4.6.0
- python-decouple 3.8 (configuration management)
- whitenoise 6.9.0 (static file serving)
- cryptography 45.0.5
- Node.js 20.x (for Tailwind CSS build)

**Database**:
- SQLite (for Django sessions only)
- Stateless architecture - data managed by database-service

### Service Communication

The Admin Service communicates with the following microservices:

1. **database-service**: Primary data source for all CRUD operations
2. **auth-service**: User authentication and authorization
3. **patient-service**: Patient-specific operations
4. **clinician-service**: Clinician-specific operations
5. **file-service**: Document storage and retrieval
6. **rag-embedding-service**: Document processing and embedding generation
7. **ocr-service**: OCR processing capabilities

### Middleware

**JWTAuthenticationMiddleware** (`admin_app/middleware.py:10`):
- Validates JWT tokens from cookies or Authorization header
- Ensures user has ADMIN role
- Attaches user data to request object
- Handles token expiration and invalid tokens
- Exempts static files and health check endpoints
- Redirects unauthenticated users to login page

### Service Layer

**DatabaseService** (`admin_app/services.py:8`):
- Centralized HTTP client for database-service communication
- Handles authentication with service tokens
- Provides methods for all data operations
- Error handling and logging
- Health check coordination for all microservices

## Docker Deployment

### Build Docker Image

```bash
docker build -t admin-service .
```

### Run Docker Container

```bash
docker run -p 8005:8005 --env-file .env admin-service
```

### Run with Environment Variables

```bash
docker run -p 8005:8005 \
  -e SECRET_KEY=your-secret-key \
  -e JWT_SECRET_KEY=your-jwt-secret \
  -e DATABASE_SERVICE_URL=http://database-service:8004 \
  -e AUTH_SERVICE_URL=http://auth-service:8001 \
  -e PATIENT_SERVICE_URL=http://patient-service:8002 \
  -e CLINICIAN_SERVICE_URL=http://clinician-service:8003 \
  -e FILE_SERVICE_URL=http://file-service:8006 \
  -e RAG_EMBEDDING_SERVICE_URL=http://rag-embedding-service:8007 \
  -e OCR_SERVICE_URL=http://ocr-service:8008 \
  admin-service
```

### Docker Compose

```bash
# Start service with docker-compose
docker-compose up -d admin-service

# View logs
docker-compose logs -f admin-service

# Stop service
docker-compose down
```

### Health Check

```bash
# Check if service is running
curl http://localhost:8005/health/
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Required |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | Required |
| `JWT_SECRET_KEY` | JWT signing key | Required |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `DATABASE_SERVICE_TOKEN` | Database service auth token | `db-service-secret-token` |
| `DATABASE_SERVICE_URL` | Database service URL | `http://database-service:8004` |
| `AUTH_SERVICE_URL` | Auth service URL | `http://auth-service:8001` |
| `PATIENT_SERVICE_URL` | Patient service URL | `http://patient-service:8002` |
| `CLINICIAN_SERVICE_URL` | Clinician service URL | `http://clinician-service:8003` |
| `FILE_SERVICE_URL` | File service URL | `http://file-service:8006` |
| `RAG_EMBEDDING_SERVICE_URL` | RAG embedding service URL | `http://rag-embedding-service:8007` |
| `OCR_SERVICE_URL` | OCR service URL | `http://ocr-service:8008` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost` |
| `CSRF_TRUSTED_ORIGINS` | Comma-separated trusted origins | Empty |
| `USE_X_FORWARDED_HOST` | Trust X-Forwarded-Host header | `False` |
| `USE_X_FORWARDED_PORT` | Trust X-Forwarded-Port header | `False` |
| `BEHIND_PROXY` | Service behind reverse proxy | `False` |

## API Endpoints

### Web Views

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/dashboard/` | GET | Main dashboard with statistics and health status |
| `/admin/cancer-types/` | GET | List all cancer types and subtypes |
| `/admin/cancer-types/create/` | GET, POST | Create new cancer type or subtype |
| `/admin/cancer-types/<id>/edit/` | GET, POST | Edit cancer type |
| `/admin/cancer-types/<id>/delete/` | POST | Delete cancer type |
| `/admin/users/` | GET | List all users with filters |
| `/admin/users/<id>/` | GET | View user details |
| `/admin/users/<id>/toggle-status/` | POST | Activate/deactivate user |
| `/admin/patients/<id>/update/` | POST | Update patient information |
| `/admin/patients/<id>/assignment/` | POST | Update patient assignment |
| `/admin/clinicians/<id>/update/` | POST | Update clinician information |
| `/admin/documents/upload/` | GET, POST | Upload RAG documents |

### JSON API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/api/cancer-types/` | GET | Get cancer types (JSON) |
| `/admin/api/rag-documents/` | GET | Get RAG documents with pagination |
| `/admin/api/rag-documents/<file_id>/delete/` | DELETE | Delete RAG document |
| `/admin/api/embedding-status/<document_id>/` | GET | Check embedding processing status |
| `/health/` | GET | Health check endpoint |

### Query Parameters

**Users List** (`/admin/users/`):
- `role`: Filter by role (PATIENT, CLINICIAN, ADMIN)
- `status`: Filter by status (active, inactive)

**RAG Documents API** (`/admin/api/rag-documents/`):
- `page`: Page number for pagination
- `page_size`: Number of results per page
- `cancer_type_id`: Filter by cancer type

## Project Structure

```
admin-service/
├── admin_app/                  # Main application
│   ├── middleware.py           # JWT authentication middleware
│   ├── services.py             # DatabaseService for API communication
│   ├── urls.py                 # URL routing
│   └── views.py                # View functions
├── admin_service/              # Django project settings
│   ├── settings.py             # Django configuration
│   ├── urls.py                 # Root URL configuration
│   └── wsgi.py                 # WSGI application
├── static/                     # Static assets
│   ├── css/                    # Stylesheets
│   ├── js/                     # JavaScript files
│   └── img/                    # Images
├── staticfiles/                # Collected static files
├── templates/                  # HTML templates
│   ├── base.html               # Base template
│   ├── admin_dashboard.html    # Dashboard view
│   ├── cancer_types_list.html  # Cancer types list
│   ├── cancer_type_form.html   # Cancer type form
│   ├── users_list.html         # Users list
│   ├── user_detail.html        # User details
│   └── document_upload.html    # Document upload
├── Dockerfile                  # Docker configuration
├── entrypoint.sh               # Docker entrypoint script
├── requirements.txt            # Python dependencies
├── package.json                # Node.js dependencies
├── tailwind.config.js          # Tailwind CSS configuration
└── wsgi.py                     # WSGI entry point
```

## Key Components

### Views (`admin_app/views.py`)
- Dashboard with statistics and health monitoring
- Cancer type CRUD operations
- User management and filtering
- Patient information and assignment management
- Clinician information and specialization management
- RAG document upload and management
- Embedding status tracking
- JSON API endpoints

### Database Service (`admin_app/services.py`)
- Cancer type operations
- User management operations
- Patient data operations
- Clinician data operations
- Patient assignment operations
- RAG document operations
- Microservices health checks

## Authentication Flow

1. User authenticates via auth-service and receives JWT token
2. Token is stored in cookies or provided in Authorization header
3. JWTAuthenticationMiddleware validates token on each request
4. Middleware verifies ADMIN role
5. User data is attached to request object
6. Views use request.user_data to access user information
7. Failed authentication redirects to login page

## RAG Document Upload Flow

1. Admin uploads document(s) via web interface
2. Document is uploaded to file-service with JWT token
3. File-service returns file_id
4. Admin-service creates RAGDocument association in database-service
5. Admin-service triggers embedding process in rag-embedding-service
6. Embedding job is queued for processing
7. Admin can check embedding status via API
8. Processed documents are available for RAG retrieval

## Security Considerations

- All endpoints require valid JWT token with ADMIN role
- Service-to-service communication uses service tokens
- CSRF protection enabled for POST/PUT/DELETE operations
- Secure cookie settings (HTTPOnly, Secure, SameSite)
- Input validation on all forms
- SQL injection protection via Django ORM
- XSS protection via template auto-escaping
- Clickjacking protection via X-Frame-Options header

## Port

Default port: **8005**

## Health Check Endpoint

```
GET /health/

Response:
{
  "status": "healthy",
  "service": "admin-service"
}
```

## Logging

The service logs to console (stdout) with INFO level by default. Logs include:
- Request errors and exceptions
- Service communication failures
- Authentication failures
- Database operation errors
- Health check results

## License

Copyright (c) 2025 Healthcare Portal. All rights reserved.
