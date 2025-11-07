# File Service

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2.4-green?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django%20REST%20Framework-3.15.2-red?logo=django&logoColor=white)
![Cryptography](https://img.shields.io/badge/Cryptography-45.0.5-orange?logo=letsencrypt&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-2.10.1-000000?logo=json-web-tokens&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-23.0.0-499848?logo=gunicorn&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![CORS](https://img.shields.io/badge/CORS-4.6.0-orange)
![Requests](https://img.shields.io/badge/Requests-2.32.4-yellowgreen)

A Django-based encrypted file storage service for the Healthcare Portal, providing secure file upload, download, and deletion with Fernet encryption and hybrid encryption for medical records.

## Overview

The File Service is a secure file storage microservice that handles all file operations for the Healthcare Portal. It provides encrypted file storage with per-user encryption keys, file deduplication through hash checking, hybrid encryption for medical records, and comprehensive access logging. All files are encrypted at rest using Fernet symmetric encryption.

## Features

### General File Operations
- **Secure Upload**: Upload files with automatic encryption
- **File Deduplication**: Hash-based duplicate detection before upload
- **Encrypted Storage**: All files encrypted at rest using Fernet encryption
- **Per-User Encryption**: Each user has a unique encryption key
- **File Download**: Decrypt and download files with authentication
- **File Listing**: List all files for authenticated user
- **Soft Deletion**: Mark files as deleted with metadata preservation
- **Physical Deletion**: Remove encrypted files from storage
- **File Size Limits**: Configurable maximum file size (default 100MB)
- **MIME Type Detection**: Automatic content type detection

### Medical Record Operations
- **Hybrid Encryption**: Files encrypted with unique keys, keys encrypted per user
- **Multi-User Access**: Share medical records securely with multiple users
- **Access Control**: Grant and manage access to medical records
- **Clinician Authorization**: Verify clinician-patient assignments before upload
- **Patient Access**: Automatic access grant to record owner (patient)
- **Clinician Access**: Automatic access grant to uploader (clinician)
- **Encrypted Access Keys**: Record encryption keys wrapped with user keys
- **Inline Viewing**: Support for viewing files in browser (PDFs, images)
- **Download Mode**: Option for file download vs inline viewing
- **Comprehensive Deletion**: Clean up all related data on record deletion

### Security Features
- **JWT Authentication**: Token-based authentication for all endpoints
- **User Authorization**: Verify user ownership before file access
- **Encryption at Rest**: Fernet symmetric encryption for all files
- **Per-User Keys**: Unique encryption keys for each user
- **Hybrid Encryption**: Medical records use unique keys wrapped per user
- **SHA-256 Hashing**: File integrity verification
- **Access Logging**: Track all file operations (upload, download, delete, view)
- **IP and User Agent Tracking**: Comprehensive audit trail
- **Assignment Verification**: Check clinician-patient assignments
- **Secure Key Management**: Integration with database-service for key storage

### Integration
- **Database Service**: File metadata, encryption keys, and access logs
- **Database Service**: User authentication and authorization
- **Database Service**: Medical record and access management
- **Database Service**: Patient assignment verification
- **File System**: Local encrypted file storage

## Architecture

### Technology Stack

**Backend**:
- Django 5.2.4
- Django REST Framework 3.15.2
- Cryptography 45.0.5 (Fernet encryption)
- PyJWT 2.10.1 (JWT authentication)
- Gunicorn 23.0.0 (WSGI server)
- Python 3.11

**Dependencies**:
- django-cors-headers 4.6.0
- python-dotenv 1.1.1 (environment configuration)
- requests 2.32.4 (HTTP client for microservices)
- psycopg2-binary 2.9.10 (PostgreSQL adapter)
- redis 6.2.0

**Storage**:
- Local file system with directory-based organization
- Encrypted files stored under user directories
- Medical records stored under patient directories

### Encryption Architecture

#### Standard File Encryption
1. User uploads file
2. Service retrieves user's encryption key from database-service
3. File encrypted with user's key using Fernet
4. Encrypted file saved to user-specific directory
5. Metadata stored in database-service

#### Hybrid Medical Record Encryption
1. Clinician uploads medical record for patient
2. Service generates unique encryption key for this record
3. File encrypted with record-specific key using Fernet
4. Record key encrypted with patient's key
5. Record key encrypted with clinician's key
6. Encrypted file saved to patient-specific medical records directory
7. Access grants created for both patient and clinician

#### File Download/Decryption
1. User requests file
2. Service verifies ownership or access grant
3. User's encryption key retrieved from database-service
4. For medical records: Record key decrypted using user's key
5. File decrypted using appropriate key
6. Decrypted file returned to user

### Storage Structure

```
media/encrypted_files/
├── <user_id>/
│   ├── <file_uuid>.pdf
│   ├── <file_uuid>.jpg
│   └── ...
└── medical_records/
    └── <patient_id>/
        ├── <file_uuid>.pdf
        ├── <file_uuid>.docx
        └── ...
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t file-service .
```

### Run Docker Container

```bash
docker run -p 8006:8006 --env-file .env file-service
```

### Run with Environment Variables

```bash
docker run -p 8006:8006 \
  -e SECRET_KEY=your-secret-key \
  -e JWT_SECRET_KEY=your-jwt-secret \
  -e DATABASE_SERVICE_URL=http://database-service:8004 \
  -e DATABASE_SERVICE_TOKEN=your-service-token \
  -e MAX_FILE_SIZE_MB=100 \
  -v /path/to/storage:/app/media \
  file-service
```

### Docker Compose

```bash
# Start service with docker-compose
docker-compose up -d file-service

# View logs
docker-compose logs -f file-service

# Stop service
docker-compose down
```

### Health Check

```bash
# Check if service is running
curl http://localhost:8006/api/health/
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key (required) | None |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1` |
| `JWT_SECRET_KEY` | JWT signing key (required) | None |
| `DATABASE_SERVICE_URL` | Database service URL | `http://database-service:8004` |
| `DATABASE_SERVICE_TOKEN` | Database service auth token (required) | None |
| `FILE_STORAGE_PATH` | Path for encrypted files | `media/encrypted_files` |
| `MAX_FILE_SIZE_MB` | Maximum file size in MB | `100` |

## API Endpoints

### General File Operations

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/files/upload` | POST | Required | Upload and encrypt file |
| `/api/files/user` | GET | Required | List user's files |
| `/api/files/<file_id>` | GET | Required | Download and decrypt file |
| `/api/files/<file_id>/delete` | DELETE | Required | Delete file |

### Medical Record Operations

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/files/upload/medical-record` | POST | Required | Upload medical record with hybrid encryption |
| `/api/files/medical-records/<file_id>/download` | GET | Required | Download medical record |
| `/api/files/medical-records/<file_id>/delete` | DELETE | Required | Delete medical record and access grants |

### Health Check

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health/` | GET | Health check |

### Request Parameters

**File Upload** (`/api/files/upload`):
- Headers: `Authorization: Bearer <jwt_token>`
- Body: `multipart/form-data`
  - `file`: File to upload

**Medical Record Upload** (`/api/files/upload/medical-record`):
- Headers: `Authorization: Bearer <jwt_token>`
- Body: `multipart/form-data`
  - `file`: File to upload
  - `patient_id`: Patient ID
  - `medical_record_type_id`: Medical record type ID

**Medical Record Download** (`/api/files/medical-records/<file_id>/download`):
- Headers: `Authorization: Bearer <jwt_token>`
- Query Parameters:
  - `view`: Set to `true` for inline viewing (default: download)

## Project Structure

```
file-service/
├── file_app/                   # Main application
│   ├── __init__.py
│   ├── models.py               # Models (minimal, stateless)
│   ├── utils.py                # Encryption utilities
│   ├── views.py                # API views
│   └── urls.py                 # API URL routing
├── file_service/               # Django project
│   ├── __init__.py
│   ├── settings.py             # Django settings
│   ├── urls.py                 # Root URL configuration
│   └── wsgi.py                 # WSGI entry point
├── media/                      # Storage directory
│   └── encrypted_files/        # Encrypted file storage
│       ├── <user_id>/          # User files
│       └── medical_records/    # Medical records
│           └── <patient_id>/   # Patient records
├── Dockerfile                  # Docker configuration
├── manage.py                   # Django management script
├── requirements.txt            # Python dependencies
└── .env                        # Environment configuration
```

## Key Components

### Views (`file_app/views.py`)

**Authentication & Authorization**:
- JWT token validation
- Ownership verification for file access
- Clinician-patient assignment verification

**General File Operations**:
- File upload with encryption and deduplication
- File download with decryption
- List user's files
- Soft and physical file deletion

**Medical Record Operations**:
- Hybrid encryption upload
- Access-controlled download
- Comprehensive deletion with cleanup

**Utilities**:
- User encryption key retrieval
- Database service authentication

### Utilities (`file_app/utils.py`)

**Hashing**:
- SHA-256 file hash calculation

**Encryption**:
- Fernet encryption
- Fernet decryption

**File Operations**:
- Save to filesystem
- Read from filesystem
- Delete from filesystem

## File Upload Flow

### Standard File Upload
1. Client sends file with JWT token
2. Service validates token and extracts user ID
3. File size checked against limit
4. SHA-256 hash calculated
5. Database service checks for duplicate
6. User encryption key retrieved
7. File encrypted with user's key
8. Encrypted file saved to storage
9. Metadata created in database service
10. Access logged
11. File ID returned to client

### Medical Record Upload
1. Client sends file with JWT token, patient ID, and record type
2. Service validates token and extracts clinician user ID
3. File size checked against limit
4. Clinician-patient assignment verified
5. Unique record encryption key generated
6. File encrypted with record key
7. SHA-256 hash calculated
8. Encrypted file saved to patient's medical records directory
9. File metadata created in database service
10. Medical record entry created
11. Patient's encryption key retrieved
12. Record key encrypted with patient's key
13. Access grant created for patient
14. Clinician's encryption key retrieved
15. Record key encrypted with clinician's key
16. Access grant created for clinician
17. Upload logged
18. Record ID returned to client

## File Download Flow

### Standard File Download
1. Client requests file with JWT token
2. Service validates token and extracts user ID
3. File metadata retrieved from database service
4. Ownership verified
5. Deletion status checked
6. User encryption key retrieved
7. Encrypted file read from storage
8. File decrypted with user's key
9. Download logged
10. Decrypted file returned to client

### Medical Record Download
1. Client requests medical record with JWT token
2. Service validates token and extracts user ID
3. Access grants checked for user
4. User encryption key retrieved
5. Encrypted access key (record key) decrypted
6. File metadata retrieved
7. Deletion status checked
8. Encrypted file read from storage
9. File decrypted with record key
10. Access logged
11. Decrypted file returned with appropriate disposition

## Security Considerations

### Encryption
- Fernet symmetric encryption (AES 128-bit in CBC mode with HMAC)
- Per-user encryption keys stored in database service
- Hybrid encryption for medical records
- Keys never exposed to clients
- All files encrypted at rest

### Authentication & Authorization
- JWT token required for all file operations
- Token validation on every request
- User ownership verification
- Medical record access control through grants
- Clinician-patient assignment verification

### File Security
- SHA-256 hash for integrity verification
- Deduplication to prevent storage waste
- Soft deletion preserves audit trail
- Physical deletion removes encrypted files
- Secure file paths prevent directory traversal

### Access Logging
- All file operations logged
- IP address and user agent tracking
- Success/failure status
- Timestamp tracking
- Integration with database service audit logs

### Production Settings
- Debug mode disabled
- CORS configured for specific origins
- File size limits enforced
- Secure cookie settings
- CSRF protection enabled

## Error Handling

The service returns appropriate HTTP status codes:

- `200 OK`: Successful request
- `201 Created`: File uploaded successfully
- `400 Bad Request`: Invalid input, file too large, or missing parameters
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: No permission to access file
- `404 Not Found`: File not found or deleted
- `409 Conflict`: Duplicate file detected
- `500 Internal Server Error`: Server error during operation

## Logging

The service logs to console (stdout) with configurable log levels. Logs include:
- File upload, download, and deletion events
- Encryption and decryption operations
- Database service communication
- Authentication failures
- File system errors
- Access control violations

## Port

Default port: **8006**

## Health Check

The service provides a health check endpoint for monitoring and orchestration tools.

## Best Practices

### Security
- Always use strong, unique SECRET_KEY and JWT_SECRET_KEY values
- Never commit secrets to version control
- Use environment variables for all sensitive configuration
- Enable HTTPS in production environments
- Regularly rotate JWT secret keys
- Monitor access logs for suspicious activity
- Implement proper key rotation procedures
- Use volume mounts for persistent storage in Docker

### Performance
- Configure appropriate file size limits
- Use SSD storage for encrypted files
- Monitor disk space usage
- Implement file cleanup policies for deleted files
- Consider object storage for scalability

### Deployment
- Use Docker for consistent deployments
- Mount persistent volumes for file storage
- Configure proper file permissions
- Set appropriate CORS settings
- Implement proper monitoring and alerting
- Regular backups of encrypted files
- Test disaster recovery procedures

### File Management
- Implement cleanup jobs for soft-deleted files
- Monitor storage usage
- Archive old files to cold storage
- Maintain file metadata in database service
- Regular integrity checks on encrypted files

## Limitations

- Files stored on local filesystem (not distributed)
- No built-in file versioning
- No automatic cleanup of soft-deleted files
- Maximum file size limit (configurable)
- Single-server deployment (horizontal scaling requires shared storage)

## License

Copyright (c) 2025 Healthcare Portal. All rights reserved.
