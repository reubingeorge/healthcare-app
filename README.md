# Healthcare Portal

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2+-green?logo=django&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-6+-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?logo=openai&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-0.3+-1C3C3C?logo=chainlink&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=json-web-tokens&logoColor=white)

A comprehensive AI-powered healthcare microservices platform with intelligent medical record management, multi-language support, RAG-based knowledge retrieval, OCR processing, and role-based access control for Patients, Clinicians, and Administrators.

## Overview

The Healthcare Portal is a modern, scalable microservices architecture designed for healthcare providers to deliver intelligent, secure, and efficient patient care. The platform features AI-powered chatbots with agent-based reasoning, encrypted medical record storage, automated OCR for document processing, semantic search with vector embeddings, and intelligent question suggestions. Built with security and compliance in mind, all services use JWT authentication, encrypted file storage, and comprehensive audit logging.

## Architecture Overview

The system consists of 9 specialized microservices communicating via RESTful APIs and WebSocket connections:

### Core Services

1. **[Auth Service](./auth-service/README.md)** (Port 8001)
   - User authentication and JWT token management
   - User registration, login, logout, and token refresh
   - Role-based access control (Patients, Clinicians, Admins)
   - Password reset and email verification
   - Secure session management with Redis

2. **[Database Service](./database-service/README.md)** (Port 8004)
   - Centralized PostgreSQL database with pgvector extension
   - 60+ API endpoints for all data operations
   - Redis caching for performance optimization
   - Celery for asynchronous task processing
   - Comprehensive data models for users, medical records, appointments, chat history

3. **[Admin Service](./admin-service/README.md)** (Port 8005)
   - Administrative dashboard and system monitoring
   - User management (patients, clinicians, admins)
   - Cancer type and medical record type configuration
   - RAG document management for knowledge base
   - System statistics and analytics

### User Services

4. **[Patient Service](./patient-service/README.md)** (Port 8002)
   - Patient profile and appointment management
   - AI chatbot with agent-based reasoning and RAG integration
   - Multi-language support (6 languages)
   - Medical record viewing and document download
   - Personalized health information retrieval

5. **[Clinician Service](./clinician-service/README.md)** (Port 8003)
   - Clinician dashboard and patient management
   - Patient assignment and medical record management
   - Medical record upload with automatic OCR analysis
   - Appointment scheduling and management
   - Integrated OCR and file services

### File and Document Services

6. **[File Service](./file-service/README.md)** (Port 8006)
   - Encrypted file storage with Fernet encryption
   - Hybrid encryption for medical records (multi-user access)
   - Per-user encryption keys for data isolation
   - SHA-256 file hashing and deduplication
   - Comprehensive access logging and audit trails

7. **[OCR Service](./ocr-service/README.md)** (Port 8008)
   - AI-powered optical character recognition
   - Dual OCR engines: TrOCR (GPU) and Tesseract (CPU)
   - Automatic GPU detection and optimization
   - Real-time progress tracking via WebSockets
   - Multi-page PDF processing with confidence scoring
   - Redis-backed job queue for asynchronous processing

### AI and Intelligence Services

8. **[RAG Embedding Service](./rag-embedding-service/README.md)** (Port 8007)
   - LangChain-based document processing and chunking
   - OpenAI text-embedding-3-small for vector embeddings
   - PostgreSQL pgvector for semantic search
   - Cancer type-specific knowledge base filtering
   - Session-based query history and management
   - Recursive character text splitting for optimal chunks

9. **[Suggestion Service](./suggestion-service/README.md)** (Port 8009)
   - Intelligent question suggestion using sentence transformers
   - Semantic similarity with all-MiniLM-L6-v2 model
   - Context-aware recommendations based on chat history
   - Cancer type-specific question filtering
   - Deduplication of already-asked questions
   - FastAPI-based lightweight service

## Technology Stack

### Backend Frameworks
- **Django 5.2+**: Core web framework for most services
- **Django REST Framework 3.15+**: RESTful API development
- **FastAPI**: High-performance API for suggestion service
- **Django Channels 4.3+**: WebSocket support for real-time features
- **Celery 5.4+**: Asynchronous task processing

### Databases and Caching
- **PostgreSQL 16**: Primary relational database with pgvector extension
- **Redis 6+**: Caching, session management, job queues, WebSocket backend
- **pgvector**: Vector similarity search for semantic embeddings

### AI and Machine Learning
- **OpenAI GPT-4**: Conversational AI and agent reasoning
- **LangChain 0.3+**: RAG orchestration and document processing
- **Sentence Transformers**: Question suggestion embeddings
- **PyTorch 2.8+**: Deep learning framework
- **TrOCR**: Microsoft Transformer-based OCR for GPU
- **Tesseract OCR**: Traditional OCR engine for CPU
- **OpenAI Embeddings**: text-embedding-3-small for semantic search

### Security and Authentication
- **JWT (PyJWT 2.10+)**: Token-based authentication across all services
- **Cryptography 45+**: Fernet encryption for file storage
- **CORS**: Properly configured cross-origin resource sharing
- **HTTPS**: Enforced in production environments

### Infrastructure
- **Docker**: Containerized deployment for all services
- **Docker Compose**: Multi-container orchestration
- **Gunicorn**: WSGI server for Django applications
- **Uvicorn**: ASGI server for FastAPI and Channels
- **Daphne**: ASGI server for Django Channels
- **Nginx**: Reverse proxy and load balancing (optional)

### Additional Libraries
- **Pillow, OpenCV**: Image processing for OCR
- **pdf2image**: PDF to image conversion
- **NumPy**: Numerical operations
- **python-dotenv**: Environment configuration
- **channels-redis**: Redis backend for Channels
- **psycopg2**: PostgreSQL adapter

## Key Features

### For Patients
- **AI Chatbot**: Intelligent conversational AI with agent-based reasoning and RAG-powered knowledge retrieval
- **Multi-Language Support**: Interface and chatbot available in 6 languages
- **Medical Record Access**: View and download encrypted medical records securely
- **Appointment Management**: Schedule and manage appointments with clinicians
- **Personalized Suggestions**: Context-aware question recommendations during chat interactions

### For Clinicians
- **Patient Management**: Assign and manage patient relationships
- **Medical Record Upload**: Upload documents with automatic OCR text extraction
- **Appointment Scheduling**: Manage patient appointments and schedules
- **Integrated Document Processing**: Automatic file encryption and OCR analysis
- **Patient Health Monitoring**: Track patient information and history

### For Administrators
- **User Management**: Create and manage patients, clinicians, and admins
- **System Configuration**: Configure cancer types and medical record types
- **Knowledge Base Management**: Upload and manage RAG documents
- **System Monitoring**: View statistics and system health
- **Audit Trails**: Comprehensive logging of all system operations

### Security Features
- **End-to-End Encryption**: Fernet encryption for all stored files
- **Hybrid Encryption**: Medical records encrypted with unique keys per user
- **JWT Authentication**: Secure token-based authentication across all services
- **Role-Based Access Control**: Granular permissions for patients, clinicians, and admins
- **Audit Logging**: Complete access logs for all file and data operations
- **Secure Key Management**: Per-user encryption keys stored securely

### AI and Intelligence
- **Agent-Based Reasoning**: Multi-step reasoning for complex health queries
- **RAG Integration**: Semantic search through medical knowledge base
- **Vector Embeddings**: pgvector-powered similarity search
- **OCR Processing**: Automatic text extraction from medical documents
- **Smart Suggestions**: Context-aware question recommendations
- **Cancer Type Filtering**: Specialized knowledge retrieval per cancer type

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.11+
- PostgreSQL 16+ (with pgvector extension)
- Redis 6+
- OpenAI API key (for GPT-4 and embeddings)

### Local Development

**Clone the repository:**
```bash
git clone <repository-url>
cd healthcare-app
```

**Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration including OpenAI API key
```

**Start all services:**
```bash
docker-compose up -d
```

**Run database migrations:**
```bash
docker-compose exec database-service python manage.py migrate
```

**Access the services:**
- Auth Service: http://localhost:8001
- Patient Service: http://localhost:8002
- Clinician Service: http://localhost:8003
- Database Service: http://localhost:8004
- Admin Service: http://localhost:8005
- File Service: http://localhost:8006
- RAG Embedding Service: http://localhost:8007
- OCR Service: http://localhost:8008
- Suggestion Service: http://localhost:8009

### Service-Specific Setup

For detailed setup instructions for each service, refer to their individual README files:
- [Auth Service Setup](./auth-service/README.md)
- [Database Service Setup](./database-service/README.md)
- [Patient Service Setup](./patient-service/README.md)
- [Clinician Service Setup](./clinician-service/README.md)
- [Admin Service Setup](./admin-service/README.md)
- [File Service Setup](./file-service/README.md)
- [RAG Embedding Service Setup](./rag-embedding-service/README.md)
- [OCR Service Setup](./ocr-service/README.md)
- [Suggestion Service Setup](./suggestion-service/README.md)

## User Roles

### Patient
- View and manage personal profile
- Chat with AI assistant for health information
- View and download medical records
- Schedule and manage appointments
- Access multi-language interface

### Clinician
- Manage assigned patients
- Upload medical records with OCR processing
- Schedule patient appointments
- Access patient medical history
- Manage treatment plans

### Administrator
- Full system access and configuration
- User management (patients, clinicians, admins)
- System configuration and monitoring
- RAG document management
- Access system statistics and analytics

## Deployment

### Docker Deployment

**Build all services:**
```bash
docker-compose build
```

**Start all services:**
```bash
docker-compose up -d
```

**View logs:**
```bash
docker-compose logs -f
```

**Stop all services:**
```bash
docker-compose down
```

### Individual Service Deployment

Each service can be deployed independently. See individual service README files for specific deployment instructions.

### Cloud Deployment

The platform supports deployment on:
- **Render.com**: Using render.yaml configuration
- **AWS**: Using ECS/EKS for container orchestration
- **Azure**: Using Azure Container Instances or AKS
- **Google Cloud**: Using Cloud Run or GKE
- **Self-Hosted**: Using Docker Swarm or Kubernetes

### Environment Configuration

Key environment variables required across services:

**Authentication:**
- `JWT_SECRET_KEY`: JWT signing key (required, no default)
- `SECRET_KEY`: Django secret key (required, no default)

**Database:**
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string

**AI Services:**
- `OPENAI_API_KEY`: OpenAI API key for GPT-4 and embeddings (required)

**Service Communication:**
- `DATABASE_SERVICE_URL`: Database service endpoint
- `DATABASE_SERVICE_TOKEN`: Service authentication token
- `FILE_SERVICE_URL`: File service endpoint
- `OCR_SERVICE_URL`: OCR service endpoint
- `RAG_SERVICE_URL`: RAG embedding service endpoint
- `SUGGESTION_SERVICE_URL`: Suggestion service endpoint

See individual service README files for complete environment variable documentation.

## System Architecture

### Microservices Communication

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ├─────────-───────┬──────────────┬─────────────┬──────────────┐
       │                 │              │             │              │
┌──────▼──────┐  ┌───────▼─────┐  ┌─────▼────┐  ┌─────▼─────┐  ┌─────▼───┐
│ Auth Service│  │Patient Svc  │  │Clinician │  │  Admin    │  │  File   │
│   (8001)    │  │   (8002)    │  │   Svc    │  │  Service  │  │ Service │
└──────┬──────┘  └──────┬──────┘  │  (8003)  │  │  (8005)   │  │ (8006)  │
       │                │         └────┬─────┘  └─────┬─────┘  └────┬────┘
       │                │              │              │              │
       └────────────────┼──────────────┴──────────────┴──────────────┘
                        │
                ┌───────▼────────┐
                │  Database Svc  │◄─────────────────────────┐
                │    (8004)      │                          │
                │   PostgreSQL   │                          │
                │    + Redis     │                          │
                └───────┬────────┘                          │
                        │                                   │
       ┌────────────────┼───────────────────┬───────────────┤
       │                │                   │               │
┌──────▼──────┐  ┌──────▼─────┐  ┌──────────▼────┐  ┌───────▼──────┐
│ OCR Service │  │ RAG Embed  │  │  Suggestion   │  │    Redis     │
│   (8008)    │  │  Service   │  │   Service     │  │   (Cache)    │
│ TrOCR+Tess  │  │  (8007)    │  │   (8009)      │  └──────────────┘
└─────────────┘  │ LangChain  │  │  Sentence     │
                 │  +pgvector │  │ Transformers  │
                 └────────────┘  └───────────────┘
```

### Data Flow Examples

**Patient Chat with AI:**
1. Patient sends message → Patient Service
2. Patient Service → Suggestion Service (get question suggestions)
3. Patient Service → Agent Service (reasoning)
4. Agent Service → RAG Embedding Service (knowledge retrieval)
5. RAG Embedding Service → Database Service (query embeddings)
6. Response flows back through chain to Patient

**Medical Record Upload:**
1. Clinician uploads file → Clinician Service
2. Clinician Service → File Service (encrypt and store)
3. Clinician Service → OCR Service (extract text)
4. OCR Service → File Service (retrieve encrypted file)
5. OCR Service processes → Database Service (store results)
6. Results returned to Clinician

## Health Checks

Each service provides health check endpoints:

- Auth Service: `http://localhost:8001/api/health/`
- Patient Service: `http://localhost:8002/api/health/`
- Clinician Service: `http://localhost:8003/api/health/`
- Database Service: `http://localhost:8004/api/health/`
- Admin Service: `http://localhost:8005/api/health/`
- File Service: `http://localhost:8006/api/health/`
- RAG Embedding Service: `http://localhost:8007/health/`
- OCR Service: `http://localhost:8008/api/ocr/health/`
- Suggestion Service: `http://localhost:8009/health`

## Development Workflow

**Make changes to service code:**
```bash
# Edit files in the service directory
```

**Rebuild affected service:**
```bash
docker-compose build <service-name>
```

**Restart service:**
```bash
docker-compose restart <service-name>
```

**View service logs:**
```bash
docker-compose logs -f <service-name>
```

**Run tests:**
```bash
docker-compose exec <service-name> python manage.py test
```

## Service Ports

| Service | Port | Protocol |
|---------|------|----------|
| Auth Service | 8001 | HTTP |
| Patient Service | 8002 | HTTP/WebSocket |
| Clinician Service | 8003 | HTTP |
| Database Service | 8004 | HTTP |
| Admin Service | 8005 | HTTP |
| File Service | 8006 | HTTP |
| RAG Embedding Service | 8007 | HTTP |
| OCR Service | 8008 | HTTP/WebSocket |
| Suggestion Service | 8009 | HTTP |

## Best Practices

### Security
- Always use strong, unique secrets for JWT and encryption keys
- Never commit secrets to version control
- Use environment variables for all configuration
- Enable HTTPS in production
- Regularly rotate JWT secret keys
- Monitor access logs for suspicious activity
- Keep dependencies updated with security patches

### Performance
- Use Redis caching where appropriate
- Monitor database query performance
- Implement connection pooling
- Configure appropriate resource limits in Docker
- Use CDN for static assets in production
- Monitor and optimize AI model inference times

### Monitoring
- Implement comprehensive logging across services
- Use health check endpoints for orchestration
- Monitor service-to-service communication
- Track API response times and error rates
- Monitor database and Redis performance
- Set up alerts for critical failures

### Scaling
- Services are designed for horizontal scaling
- Use load balancers for distributing traffic
- Consider Redis clustering for high availability
- Use PostgreSQL read replicas for read-heavy workloads
- Scale AI services based on usage patterns
- Implement rate limiting to prevent abuse

## Troubleshooting

### Common Issues

**Service won't start:**
- Check environment variables are properly set
- Verify database connectivity
- Ensure Redis is running
- Check port availability

**Authentication failures:**
- Verify JWT_SECRET_KEY matches across services
- Check token expiration settings
- Ensure database service is accessible

**AI services not responding:**
- Verify OpenAI API key is valid
- Check API rate limits
- Monitor service logs for errors
- Ensure proper model initialization

**File upload/download issues:**
- Verify file service is running
- Check encryption keys are properly configured
- Ensure adequate disk space
- Verify file permissions

## Documentation

For detailed documentation on each service, refer to:
- [Auth Service Documentation](./auth-service/README.md)
- [Patient Service Documentation](./patient-service/README.md)
- [Clinician Service Documentation](./clinician-service/README.md)
- [Database Service Documentation](./database-service/README.md)
- [Admin Service Documentation](./admin-service/README.md)
- [File Service Documentation](./file-service/README.md)
- [RAG Embedding Service Documentation](./rag-embedding-service/README.md)
- [OCR Service Documentation](./ocr-service/README.md)
- [Suggestion Service Documentation](./suggestion-service/README.md)

## Contributing

When contributing to individual services:
1. Follow the coding standards established in each service
2. Write tests for new features
3. Update service README with any new functionality
4. Ensure Docker builds succeed
5. Test integration with dependent services

## License

Copyright (c) 2025 Healthcare Portal. All rights reserved.