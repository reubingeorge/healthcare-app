# Database Service

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2.4-green?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django%20REST%20Framework-3.15.2-red?logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql&logoColor=white)
![pgvector](https://img.shields.io/badge/pgvector-0.4.1-336791)
![Redis](https://img.shields.io/badge/Redis-6.2.0-DC382D?logo=redis&logoColor=white)
![Celery](https://img.shields.io/badge/Celery-5.5.3-37814A?logo=celery&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-23.0.0-499848?logo=gunicorn&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-1.21.10-85EA2D?logo=swagger&logoColor=black)
![NumPy](https://img.shields.io/badge/NumPy-1.26.4-013243?logo=numpy&logoColor=white)

A Django-based centralized database service for the Healthcare Portal, providing PostgreSQL data management, pgvector-powered RAG embeddings, user authentication, medical records, and chatbot functionality.

## Overview

The Database Service is the central data layer for the Healthcare Portal microservices architecture. It manages all persistent data including users, patients, clinicians, medical records, cancer types, RAG documents with vector embeddings, chatbot sessions, and access control. Built on PostgreSQL with pgvector extension for AI-powered semantic search.

## Features

### User Management
- **User CRUD**: Create, read, update, and delete users
- **Role Management**: Support for Patient, Clinician, and Admin roles
- **User Search**: Find users by email, role, or status
- **User Statistics**: Dashboard statistics for admins
- **Password Management**: Secure password hashing with Django's password system
- **User Encryption Keys**: Per-user encryption keys for secure file storage

### Patient Management
- **Patient Profiles**: Demographics, contact information, emergency contacts
- **Patient Assignments**: Link patients to cancer subtypes and clinicians
- **Patient by Clinician**: Retrieve all patients assigned to a clinician
- **Preferred Language**: Multi-language support for patient communication

### Clinician Management
- **Clinician Profiles**: Professional information and availability
- **Multiple Specializations**: Many-to-many relationship with cancer types
- **Availability Tracking**: Track clinician availability status
- **Specialization Queries**: Find clinicians by specialization

### Cancer Type Management
- **Hierarchical Structure**: Parent cancer types with subtypes
- **CRUD Operations**: Full cancer type management
- **Top-Level and Subtype Queries**: Filter by hierarchy level
- **Search Functionality**: Find cancer types by name

### File Management
- **File Metadata**: Track all uploaded files with metadata
- **File Hashing**: Deduplication through file hash checking
- **Encryption Support**: Track encrypted file storage
- **Access Logging**: Comprehensive file access audit trail
- **Soft Deletion**: Mark files as deleted without removing data

### Medical Record Management
- **Medical Record Types**: Predefined categories for medical documents
- **Patient-Record Association**: Link files to patients with record types
- **Access Control**: Grant and revoke access to medical records
- **Search and Filtering**: Find records by patient, type, or date range
- **Fuzzy Matching**: Intelligent report type matching
- **Access Expiry**: Time-limited access grants

### RAG (Retrieval-Augmented Generation) System
- **RAG Documents**: Associate medical documents with cancer types
- **Vector Embeddings**: Store document embeddings using pgvector
- **Semantic Search**: Vector similarity search with cosine distance
- **Bulk Embedding Creation**: Efficient batch embedding storage
- **Embedding Jobs**: Track document processing status
- **Cancer Type Filtering**: Search within specific cancer type documents
- **Chunk Management**: Store and retrieve document chunks with metadata

### Chatbot Support
- **Chat Sessions**: Manage patient chatbot conversations
- **Chat Messages**: Store user and assistant messages
- **Session History**: Retrieve past conversations
- **Suggestion Templates**: Pre-seeded questions by cancer type
- **Suggestion Embeddings**: Vector embeddings for suggestion matching
- **Suggestion History**: Track suggested questions to avoid repeats
- **Session Renaming**: Custom titles for chat sessions

### Authentication & Security
- **Service Authentication**: Token-based service-to-service authentication
- **Refresh Token Management**: Store and validate JWT refresh tokens
- **Token Invalidation**: Single and bulk token revocation
- **Event Logging**: Audit trail for all system events
- **Access Control**: Role-based and record-specific permissions

### Caching & Performance
- **Redis Caching**: Cache frequently accessed data
- **Query Optimization**: Select_related and prefetch_related for efficient queries
- **Pagination**: Configurable pagination for large datasets
- **Database Connection Pooling**: Efficient connection management

### Background Tasks
- **Celery Integration**: Async task processing
- **Embedding Job Queue**: Background document processing
- **Token Cleanup**: Automated expired token removal

## Architecture

### Technology Stack

**Backend**:
- Django 5.2.4
- Django REST Framework 3.15.2
- PostgreSQL 14+ (primary database)
- pgvector 0.4.1 (vector similarity search)
- Redis 6.2.0 (caching and task queue)
- Celery 5.5.3 (background tasks)
- Gunicorn 23.0.0 (WSGI server)
- Python 3.11

**API Documentation**:
- drf-yasg 1.21.10 (Swagger/OpenAPI)

**Dependencies**:
- django-filter 24.3 (query filtering)
- django-cors-headers 4.6.0
- django-redis 6.0.0 (Redis cache backend)
- dj-database-url 3.0.1 (database configuration)
- python-decouple 3.8 (configuration management)
- cryptography 45.0.5 (encryption utilities)
- PyJWT 2.10.1 (JWT utilities)
- NumPy 1.26.4 (vector operations)
- psycopg2-binary 2.9.10 (PostgreSQL adapter)

### Database Schema

**Core Tables**:
- `users`: User accounts with role-based access
- `roles`: System roles (Patient, Clinician, Admin)
- `patients`: Patient profiles and demographics
- `clinicians`: Clinician profiles and availability
- `clinician_specializations`: Many-to-many clinician-cancer type relationships
- `patient_assignments`: Patient-cancer subtype-clinician assignments
- `cancer_types`: Hierarchical cancer type catalog
- `languages`: Supported languages for localization

**File Management Tables**:
- `file_metadata`: File information and storage paths
- `file_access_logs`: Comprehensive file access audit trail
- `user_encryption_keys`: Per-user encryption keys

**Medical Record Tables**:
- `medical_record_types`: Predefined medical document categories
- `medical_records`: Links files to patients with types
- `medical_record_access`: Access control for medical records

**RAG System Tables**:
- `rag_documents`: Associates files with cancer types
- `rag_embeddings`: Vector embeddings with pgvector support
- `rag_embedding_jobs`: Track embedding processing status

**Chatbot Tables**:
- `chat_sessions`: Patient chatbot conversations
- `chat_messages`: Individual messages in conversations
- `suggestion_templates`: Pre-seeded questions by cancer type
- `suggested_history`: Track suggested questions per session

**Authentication Tables**:
- `refresh_tokens`: JWT refresh token storage
- `event_logs`: System event audit trail

### Service Authentication

**ServiceAuthentication** (`data_management/authentication.py`):
- Token-based authentication for microservice communication
- Validates X-Service-Token header
- Provides read/write access to all services
- Bypass for health check endpoint

## Docker Deployment

### Build Docker Image

```bash
docker build -t database-service .
```

### Run Docker Container

```bash
docker run -p 8004:8004 --env-file .env database-service
```

### Run with Environment Variables

```bash
docker run -p 8004:8004 \
  -e SECRET_KEY=your-secret-key \
  -e DATABASE_URL=postgresql://user:pass@postgres:5432/healthcare_db \
  -e REDIS_URL=redis://redis:6379/0 \
  -e DATABASE_SERVICE_TOKEN=your-service-token \
  database-service
```

### Docker Compose

```bash
# Start service with docker-compose
docker-compose up -d database-service

# Run migrations
docker-compose exec database-service python manage.py migrate

# Create admin user
docker-compose exec database-service python manage.py create_admin_user

# Enable pgvector extension
docker-compose exec database-service python manage.py enable_pgvector

# Import cancer types
docker-compose exec database-service python manage.py import_cancer_types

# View logs
docker-compose logs -f database-service

# Stop service
docker-compose down
```

### Health Check

```bash
# Check if service is running
curl http://localhost:8004/api/health/
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key (required) | None |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `*` |
| `DATABASE_URL` | PostgreSQL connection string (required) | `postgresql://user:pass@postgres:5432/healthcare_db` |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379/0` |
| `DATABASE_SERVICE_TOKEN` | Service authentication token (required) | None |
| `JWT_SECRET_KEY` | JWT signing key (required) | None |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost,http://127.0.0.1` |
| `CACHE_TTL` | Cache time-to-live (seconds) | `900` |

## API Endpoints

### User Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/` | GET, POST | List/create users |
| `/api/users/<id>/` | GET, PUT, PATCH, DELETE | User detail operations |
| `/api/users/by_email/` | GET | Get user by email |
| `/api/users/statistics/` | GET | User statistics |
| `/api/roles/` | GET, POST | List/create roles |
| `/api/languages/` | GET | List languages |

### Patient Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients/` | GET, POST | List/create patients |
| `/api/patients/<id>/` | GET, PUT, PATCH, DELETE | Patient detail operations |
| `/api/patients/by_user/` | GET | Get patient by user ID |
| `/api/patients/by_clinician/` | GET | Get patients by clinician |
| `/api/patient-assignments/` | GET, POST | List/create assignments |
| `/api/patient-assignments/<id>/` | GET, PUT, PATCH, DELETE | Assignment operations |
| `/api/patient-assignments/by_patient/` | GET | Get assignment by patient |
| `/api/patient-assignments/check_assignment/` | GET | Check clinician-patient assignment |

### Clinician Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/clinicians/` | GET, POST | List/create clinicians |
| `/api/clinicians/<id>/` | GET, PUT, PATCH, DELETE | Clinician detail operations |
| `/api/clinicians/by_user/` | GET | Get clinician by user ID |
| `/api/clinicians/available/` | GET | Get available clinicians |
| `/api/clinicians/by_specialization/` | GET | Get clinicians by specialization |

### Cancer Type Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cancer-types/` | GET, POST | List/create cancer types |
| `/api/cancer-types/<id>/` | GET, PUT, PATCH, DELETE | Cancer type operations |
| `/api/cancer-types/top_level/` | GET | Get top-level cancer types |
| `/api/cancer-types/<id>/subtypes/` | GET | Get subtypes |

### File Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/files/` | GET, POST | List/create file metadata |
| `/api/files/<id>/` | GET, PUT, PATCH, DELETE | File metadata operations |
| `/api/files/check_duplicate/` | POST | Check file hash for duplicates |
| `/api/files/create_metadata/` | POST | Create file metadata record |
| `/api/files/user_files/` | GET | Get user's files |
| `/api/files/<id>/mark_deleted/` | POST | Soft delete file |
| `/api/files/<id>/log_access/` | POST | Log file access |

### Medical Record Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/medical-record-types/` | GET | List medical record types |
| `/api/medical-record-types/match_type/` | GET | Fuzzy match record type |
| `/api/medical-records/` | GET, POST | List/create medical records |
| `/api/medical-records/<id>/` | GET, PUT, PATCH, DELETE | Medical record operations |
| `/api/medical-records/by_patient/` | GET | Get patient's records |
| `/api/medical-records/search_reports/` | GET | Search with fuzzy matching |
| `/api/medical-records/<id>/get_with_access_check/` | GET | Get record with access check |
| `/api/medical-record-access/` | GET, POST | List/create access grants |
| `/api/medical-record-access/<id>/revoke/` | POST | Revoke access |

### RAG System

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rag-documents/` | GET, POST | List/create RAG documents |
| `/api/rag/embeddings/` | GET, POST | List/create embeddings |
| `/api/rag/embeddings/create_embedding/` | POST | Create single embedding |
| `/api/rag/embeddings/bulk_create/` | POST | Bulk create embeddings |
| `/api/rag/embeddings/search/` | POST | Vector similarity search |
| `/api/rag/embeddings/has_embeddings/` | GET | Check if document has embeddings |
| `/api/rag/embedding-jobs/` | GET, POST | List/create embedding jobs |
| `/api/rag/embedding-jobs/<id>/update_status/` | PUT | Update job status |
| `/api/rag/embedding-jobs/statistics/` | GET | Embedding job statistics |

### Chatbot

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/sessions/` | GET | List chat sessions |
| `/api/chat/start/` | POST | Start new chat session |
| `/api/chat/load/` | GET | Load specific session |
| `/api/chat/messages/` | GET | Get session messages |
| `/api/chat/message/` | POST | Add message to session |
| `/api/chat/rename_session/` | POST | Rename session |
| `/api/chat/<id>/delete/` | DELETE | Delete session |
| `/api/chat/suggestions/` | POST | Store suggestions |
| `/api/chat/internal/sessions/last-messages/` | GET | Get recent messages |
| `/api/chat/internal/suggestions/templates/` | GET | Get suggestion templates |
| `/api/chat/internal/suggestions/history/` | GET, POST | Manage suggestion history |
| `/api/chat/internal/suggestions/upsert-embeddings/` | POST | Update suggestion embeddings |

### Authentication & Utilities

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/refresh-tokens/create_token/` | POST | Create refresh token |
| `/api/refresh-tokens/validate_token/` | GET | Validate refresh token |
| `/api/refresh-tokens/invalidate_token/` | POST | Invalidate token |
| `/api/refresh-tokens/invalidate_user_tokens/` | POST | Invalidate all user tokens |
| `/api/refresh-tokens/cleanup_expired/` | DELETE | Delete expired tokens |
| `/api/encryption-keys/get_or_create_key/` | GET | Get or create user encryption key |
| `/api/events/` | POST | Log system event |
| `/api/statistics/` | GET | Database statistics |
| `/api/health/` | GET | Health check |

## Project Structure

```
database-service/
├── data_management/            # Main application
│   ├── models.py               # Database models
│   ├── views.py                # API views and viewsets
│   ├── serializers.py          # DRF serializers
│   ├── urls.py                 # URL routing
│   ├── authentication.py       # Service authentication
│   ├── admin.py                # Django admin configuration
│   ├── management/             # Django management commands
│   │   └── commands/
│   │       ├── create_admin_user.py
│   │       ├── enable_pgvector.py
│   │       ├── import_cancer_types.py
│   │       └── import_suggestions.py
│   └── migrations/             # Database migrations
├── Dockerfile                  # Docker configuration
├── entrypoint.sh               # Docker entrypoint script
├── manage.py                   # Django management script
├── requirements.txt            # Python dependencies
├── settings.py                 # Django settings
├── urls.py                     # Root URL configuration
└── wsgi.py                     # WSGI entry point
```

## Key Components

### Models (`data_management/models.py`)
- User, Role, Patient, Clinician models
- Cancer type hierarchy
- File metadata and access logs
- Medical records with access control
- RAG documents and embeddings with pgvector
- Chat sessions and messages
- Suggestion templates
- Refresh tokens

### ViewSets (`data_management/views.py`)
- RESTful API for all models
- Custom actions for complex queries
- Pagination support
- Filtering and search
- Access control enforcement
- Vector similarity search

### Authentication (`data_management/authentication.py`)
- Service-to-service token authentication
- Permission classes for service access
- Health check bypass

## Security Considerations

### Authentication & Authorization
- Service token required for all API access
- Token validation on every request
- Health check endpoint bypasses authentication
- Role-based access control through user roles

### Data Protection
- Per-user encryption keys for file storage
- Medical record access control with expiration
- Access audit logs for all file operations
- Password hashing using Django's PBKDF2 algorithm
- Soft deletion for files (no permanent data loss)

### Production Settings
- Force HTTPS in production
- Secure session cookies
- Secure CSRF cookies
- XSS filter enabled
- Frame options deny
- Content-type sniffing protection

### Database Security
- Connection pooling with max connections
- SQL injection protection via ORM
- Parameterized queries for raw SQL
- Input validation on all endpoints

## Vector Search with pgvector

The service uses pgvector for efficient vector similarity search:
- Embeddings stored as PostgreSQL vectors
- Cosine distance for similarity
- Indexed for fast search
- Supports filtering by cancer type
- Configurable result limits

## Management Commands

```bash
# Create admin user
python manage.py create_admin_user

# Enable pgvector extension
python manage.py enable_pgvector

# Import cancer types from JSON
python manage.py import_cancer_types

# Import suggestion templates
python manage.py import_suggestions
```

## Port

Default port: **8004**

## Health Check

The service provides a health check endpoint that validates database and cache connectivity.

## Caching Strategy

- User queries cached for 15 minutes
- Database statistics cached for 1 hour
- Configurable TTL via environment variables
- Redis-backed caching for reliability

## API Documentation

Swagger/OpenAPI documentation is available via drf-yasg for interactive API exploration and testing.

## Best Practices

### Security
- Always use strong, unique SECRET_KEY and DATABASE_SERVICE_TOKEN values
- Never commit secrets to version control
- Use environment variables for all sensitive configuration
- Enable HTTPS in production environments
- Regularly rotate service tokens
- Monitor access logs for suspicious activity

### Performance
- Redis caching for frequently accessed data
- Database connection pooling
- Select_related and prefetch_related for query optimization
- Pagination for large result sets
- Indexed columns for common queries

### Deployment
- Use Docker for consistent deployments
- Configure proper CORS settings
- Set appropriate cache TTL values
- Use reverse proxy for SSL termination
- Implement proper monitoring and alerting
- Regular database backups

### Database Maintenance
- Run migrations on deployment
- Monitor database size and performance
- Clean up expired tokens regularly
- Archive old event logs periodically
- Monitor pgvector index performance

## License

Copyright (c) 2025 Healthcare Portal. All rights reserved.
