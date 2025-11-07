# Patient Service

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2.4-green?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django%20REST%20Framework-3.15.2-red?logo=django&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT-412991?logo=openai&logoColor=white)
![Channels](https://img.shields.io/badge/Channels-4.3.1-092E20)
![Redis](https://img.shields.io/badge/Redis-Latest-DC382D?logo=redis&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-2.10.1-000000?logo=json-web-tokens&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-23.0.0-499848?logo=gunicorn&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-1.21.10-85EA2D?logo=swagger&logoColor=black)
![Multi-Language](https://img.shields.io/badge/Languages-6-blue)

A Django-based patient portal for the Healthcare Portal, providing patient profile management, appointment scheduling, medical record access, and an AI-powered chatbot with RAG and agent-based assistance in multiple languages.

## Overview

The Patient Service is a comprehensive web application for healthcare patients, featuring profile management, appointment scheduling, medical record viewing, prescription tracking, and an advanced AI-powered chatbot. The chatbot uses a hybrid approach with agent-based reasoning backed by RAG (Retrieval-Augmented Generation) for answering patient questions based on NCCN guidelines. The service supports 6 languages and provides real-time WebSocket-based chat functionality.

## Features

### Patient Profile Management
- **View Profile**: Access patient demographic information
- **Update Profile**: Modify patient details
- **Cancer Type Assignment**: Track cancer type and subtype assignments
- **Clinician Assignment**: View assigned clinicians
- **Preferred Language**: Set preferred language for communication
- **Emergency Contacts**: Manage emergency contact information

### Dashboard
- **Statistics Overview**: View patient summary data
- **Upcoming Appointments**: See next 5 appointments
- **Recent Medical Records**: Access recent documents (last 5)
- **Active Prescriptions**: View current medications
- **User Information**: Display name, email, and role

### Appointment Management
- **List Appointments**: View all appointments with filtering
- **Appointment Details**: View specific appointment information
- **Create Appointments**: Schedule new appointments
- **Update Appointments**: Modify existing appointments
- **Upcoming Appointments**: Quick view of upcoming appointments
- **Available Slots**: Check clinician availability
- **Status Tracking**: Monitor appointment status (scheduled, completed, cancelled)

### Medical Records
- **List Records**: View all medical records
- **Record Details**: Access specific medical documents
- **Record Types**: View available medical record categories
- **Patient Filtering**: Automatic filtering by patient
- **Access Control**: Authorization-based record access

### Prescriptions
- **List Prescriptions**: View all prescriptions
- **Prescription Details**: View specific prescription information
- **Active Prescriptions**: Filter for currently active medications
- **Patient Filtering**: Automatic filtering by patient

### AI-Powered Chatbot
- **Agent-Based System**: Intelligent agent with reasoning capabilities
- **RAG Fallback**: Retrieval-Augmented Generation backup
- **NCCN Guidelines**: Answers based on medical guidelines
- **Multi-Language Support**: Responds in patient's preferred language (6 languages)
- **Cancer Type Context**: Filters knowledge based on patient's cancer type
- **Chat Sessions**: Manage multiple conversation sessions
- **Chat History**: Retrieve past conversations
- **Session Deletion**: Remove conversation history
- **Auto-Titling**: Automatic conversation title generation
- **Token Management**: Automatic session splitting for long conversations
- **Status Updates**: Real-time processing status from agent
- **Context Awareness**: Understands patient's cancer type and language

### Multi-Language Support
- **6 Languages**: English, Arabic, Chinese, French, Hindi, Spanish
- **Dynamic Translation**: Custom translation template tags
- **User Language Preference**: Automatic language selection based on profile
- **Chatbot Localization**: AI responses in preferred language

### Web Interface
- **Tailwind CSS**: Modern, responsive UI
- **Template Views**: Server-side rendered pages
- **WebSocket Support**: Real-time chat via Django Channels
- **API Documentation**: Swagger/OpenAPI interface

### Security
- **JWT Authentication**: Token-based authentication for API and web requests
- **Role-Based Access Control**: PATIENT role required
- **User Authorization**: Users can only access their own data
- **Secure Cookies**: HTTPOnly and Secure flags in production
- **Access Logging**: Event logging for all actions

### Integration
- **Database Service**: Centralized data management
- **RAG Embedding Service**: Knowledge base queries
- **Translation Service**: Multi-language support
- **File Service**: Medical record file access

## Architecture

### Technology Stack

**Backend**:
- Django 5.2.4
- Django REST Framework 3.15.2
- Django Channels 4.3.1 (WebSocket support)
- Daphne 4.2.1 (ASGI server)
- Redis (WebSocket backend and translation cache)
- Python 3.11

**AI/ML**:
- OpenAI API (GPT models)
- RAG Service integration
- Agent-based reasoning system

**Frontend**:
- Tailwind CSS (utility-first CSS framework)
- Node.js 20.x (for Tailwind build)
- Vanilla JavaScript
- HTML templates (Django template engine)

**API Documentation**:
- drf-yasg 1.21.10 (Swagger/OpenAPI)

**Dependencies**:
- channels-redis 4.3.0 (Channels Redis backend)
- django-cors-headers 4.6.0
- PyJWT 2.10.1 (JWT authentication)
- python-decouple 3.8 (configuration management)
- requests 2.32.4 (HTTP client for microservices)
- gunicorn 23.0.0 (WSGI server)
- psycopg2-binary 2.9.10 (PostgreSQL adapter)

**Database**:
- SQLite (in-memory for Django internals only)
- Stateless architecture - data managed by database-service

**Supported Languages**:
- English (en)
- Arabic (ar)
- Chinese (zh)
- French (fr)
- Hindi (hi)
- Spanish (es)

### AI Chatbot Architecture

#### Agent-Based System (Primary)
1. User sends message in preferred language
2. Agent analyzes query and determines if personalized info needed
3. Agent retrieves patient data via tool calls
4. Agent performs RAG queries for medical knowledge
5. Agent reasons through multiple iterations (max 10)
6. Agent generates response in patient's language
7. Status updates sent to frontend during processing

#### RAG Fallback (Secondary)
1. If agent fails, system falls back to direct RAG
2. Query sent to RAG embedding service
3. Cancer type used to filter knowledge base
4. Context-aware response generated
5. Response returned in patient's language

#### Chat Session Management
1. Sessions stored in database service
2. Chat history maintained per session
3. Automatic session creation on first message
4. Session title auto-generated from first message
5. Token limit monitoring (3000 tokens per chunk)
6. Automatic session splitting for long conversations

### Multi-Language System

**Patient Language Detection**:
1. User's preferred language retrieved from patient profile
2. Language passed to chatbot for response generation
3. UI elements translated via custom template tags
4. Translation service integration for dynamic content

**Middleware**:
- `JWTAuthenticationMiddleware`: Validates JWT tokens and attaches user data
- `UserLanguageMiddleware`: Sets Django language based on patient preference

## Docker Deployment

### Build Docker Image

```bash
docker build -t patient-service .
```

### Run Docker Container

```bash
docker run -p 8002:8002 --env-file .env patient-service
```

### Run with Environment Variables

```bash
docker run -p 8002:8002 \
  -e SECRET_KEY=your-secret-key \
  -e JWT_SECRET_KEY=your-jwt-secret \
  -e DATABASE_SERVICE_URL=http://database-service:8004 \
  -e DATABASE_SERVICE_TOKEN=your-service-token \
  -e RAG_EMBEDDING_SERVICE_URL=http://rag-embedding-service:8007 \
  -e OPENAI_API_KEY=your-openai-key \
  -e REDIS_URL=redis://redis:6379 \
  patient-service
```

### Docker Compose

```bash
# Start service with docker-compose
docker-compose up -d patient-service

# View logs
docker-compose logs -f patient-service

# Stop service
docker-compose down
```

### Health Check

```bash
# Check if service is running
curl http://localhost:8002/api/health/
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
| `DATABASE_SERVICE_URL` | Database service URL | `http://database-service:8004` |
| `DATABASE_SERVICE_TOKEN` | Database service auth token (required) | None |
| `AUTH_SERVICE_URL` | Auth service URL | `http://auth-service:8001` |
| `RAG_EMBEDDING_SERVICE_URL` | RAG service URL | `http://rag-embedding-service:8007` |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |
| `TRANSLATION_REDIS_DB` | Redis database for translation | `3` |
| `OPENAI_API_KEY` | OpenAI API key (required) | None |
| `OPENAI_MAX_TOKENS_PER_CHUNK` | Max tokens per chat session | `3000` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost,http://127.0.0.1` |

## API Endpoints

### Patient Profile

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/patient/profiles/` | GET | Required | List patients (only own profile for patients) |
| `/api/patient/profiles/<id>/` | GET, PUT, PATCH | Required | Patient detail operations |
| `/api/patient/profiles/me/` | GET | Required | Get current patient's profile |
| `/api/patient/profiles/dashboard/` | GET | Required | Get patient dashboard data |

### Appointments

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/patient/appointments/` | GET, POST | Required | List/create appointments |
| `/api/patient/appointments/<id>/` | GET, PUT, PATCH | Required | Appointment detail operations |
| `/api/patient/appointments/upcoming/` | GET | Required | Get upcoming appointments |
| `/api/patient/appointments/available_slots/` | GET | Required | Get available appointment slots |

### Medical Records

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/patient/medical-records/` | GET | Required | List medical records |
| `/api/patient/medical-records/<id>/` | GET | Required | Get medical record details |
| `/api/patient/medical-records/record_types/` | GET | Required | Get available record types |

### Prescriptions

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/patient/prescriptions/` | GET | Required | List prescriptions |
| `/api/patient/prescriptions/<id>/` | GET | Required | Get prescription details |
| `/api/patient/prescriptions/active/` | GET | Required | Get active prescriptions |

### AI Chatbot

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/patient/chat/start/` | POST | Required | Start new chat session |
| `/api/patient/chat/sessions/` | GET | Required | List chat sessions |
| `/api/patient/chat/load/` | POST | Required | Load specific session |
| `/api/patient/chat/message/` | POST | Required | Send chat message |
| `/api/patient/chat/<id>/delete/` | DELETE | Required | Delete chat session |
| `/api/patient/chat/context/` | GET | Required | Get chat context (language, cancer type) |

### Languages

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/patient/languages/` | GET | Required | List available languages |
| `/api/patient/languages/<id>/` | GET | Required | Get language details |

### Web Templates

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/patient/dashboard/` | GET | Patient dashboard page |
| `/health/` | GET | Health check |

## Project Structure

```
patient-service/
├── patients/                   # Main application
│   ├── __init__.py
│   ├── middleware.py           # JWT authentication middleware
│   ├── middleware_language.py  # Language preference middleware
│   ├── auth.py                 # Authentication utilities
│   ├── serializers.py          # DRF serializers
│   ├── services.py             # DatabaseService client
│   ├── views.py                # API views
│   ├── template_views.py       # Web template views
│   ├── urls.py                 # API URL routing
│   ├── template_urls.py        # Template URL routing
│   ├── health_urls.py          # Health check URLs
│   ├── rag_service.py          # RAG service integration
│   ├── agent_service.py        # Agent-based chat system
│   ├── report_tools.py         # Medical report tools
│   ├── utils.py                # Utility functions
│   ├── consumers.py            # WebSocket consumers
│   ├── routing.py              # WebSocket routing
│   └── templatetags/           # Custom template tags
│       ├── __init__.py
│       └── ctrans.py           # Translation template tags
├── patient_service/            # Django project
│   ├── __init__.py
│   ├── settings.py             # Django settings
│   ├── urls.py                 # Root URL configuration
│   ├── wsgi.py                 # WSGI entry point
│   └── asgi.py                 # ASGI entry point (for Channels)
├── static/                     # Static assets
│   ├── css/                    # Stylesheets
│   │   ├── input.css           # Tailwind CSS input
│   │   └── main.css            # Compiled CSS
│   └── js/                     # JavaScript files
├── staticfiles/                # Collected static files
├── templates/                  # HTML templates
│   ├── base.html               # Base template
│   └── patient_dashboard.html  # Dashboard view
├── locale/                     # Translation files
│   ├── en/
│   ├── ar/
│   ├── zh/
│   ├── fr/
│   ├── hi/
│   └── es/
├── Dockerfile                  # Docker configuration
├── entrypoint.sh               # Docker entrypoint script
├── manage.py                   # Django management script
├── requirements.txt            # Python dependencies
├── package.json                # Node.js dependencies
├── tailwind.config.js          # Tailwind CSS configuration
└── .env                        # Environment configuration
```

## Key Components

### Views (`patients/views.py`)

**Patient Management**:
- Profile CRUD operations
- Dashboard data aggregation
- Authorization checks

**Appointment Management**:
- Appointment CRUD operations
- Upcoming appointments
- Available slot checking
- Status tracking

**Medical Records**:
- Record listing with filtering
- Record detail retrieval
- Record type enumeration

**Prescriptions**:
- Prescription listing
- Active prescription filtering

**AI Chatbot**:
- Chat session management
- Message processing with agent/RAG
- Multi-language support
- Context awareness
- Status updates

### RAG Service (`patients/rag_service.py`)

**Query Processing**:
- RAG embedding service integration
- Cancer type filtering
- Context-aware queries
- Language-specific responses

### Agent Service (`patients/agent_service.py`)

**Agent-Based Chat**:
- Intelligent reasoning system
- Tool-based data retrieval
- Multi-iteration processing
- RAG integration
- Error handling with fallback

### Middleware

**JWTAuthenticationMiddleware** (`patients/middleware.py`):
- JWT token validation
- User data attachment
- Role verification
- Exempts health check endpoints

**UserLanguageMiddleware** (`patients/middleware_language.py`):
- Sets Django language from patient preference
- Language persistence

## Chatbot Usage Flow

### Starting a Chat
1. Patient accesses chat interface
2. Frontend calls `/api/patient/chat/start/`
3. New session created in database
4. Session ID returned to frontend

### Sending Messages
1. Patient types message
2. Frontend sends message to `/api/patient/chat/message/`
3. Service determines agent vs RAG approach
4. Message processed with patient context (language, cancer type)
5. Response generated based on NCCN guidelines
6. Response returned in patient's preferred language
7. Both user and assistant messages saved to session

### Agent Processing
1. Agent receives user message and chat history
2. Agent analyzes if personalized data needed
3. Agent uses tools to retrieve patient information
4. Agent performs RAG queries for medical knowledge
5. Agent reasons through findings
6. Agent generates final response
7. Status updates sent during processing

### RAG Fallback
1. If agent fails, direct RAG query performed
2. Patient's cancer type used for filtering
3. Relevant documents retrieved
4. Response generated from context
5. Response localized to patient's language

## Security Considerations

### Authentication & Authorization
- JWT token required for all endpoints
- Role-based access control (PATIENT role)
- User can only access their own data
- Event logging for all actions

### Data Privacy
- Patient data isolated by user ID
- Access control on all endpoints
- Secure token management
- Encrypted communication

### AI Safety
- Token limits to prevent abuse
- Cancer type filtering for relevant info
- NCCN guidelines as knowledge base
- Error handling with graceful fallbacks

### Production Settings
- Debug mode disabled
- CORS configured for specific origins
- Secure cookies (HTTPOnly, Secure)
- CSRF protection enabled
- XSS filter enabled
- Clickjacking protection

## Error Handling

The service returns appropriate HTTP status codes:

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: No permission to access resource
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `501 Not Implemented`: Feature not implemented

## Logging

The service logs to console (stdout) with INFO level. Logs include:
- API requests and responses
- Authentication events
- Chat interactions
- Agent processing steps
- RAG queries
- Database operations
- Errors and warnings

## Port

Default port: **8002**

## Health Check

The service provides a health check endpoint for monitoring and orchestration tools.

## API Documentation

Swagger/OpenAPI documentation is available via drf-yasg for interactive API exploration and testing.

## Best Practices

### Deployment
- Use Docker for consistent deployments
- Configure OpenAI API key securely
- Set appropriate CORS settings
- Enable HTTPS in production
- Monitor API usage and costs

### Performance
- Redis caching for translations
- Session management for long conversations
- Token limit monitoring
- Efficient database queries

### Security
- Always use strong, unique SECRET_KEY and JWT_SECRET_KEY values
- Never commit secrets to version control
- Use environment variables for all sensitive configuration
- Rotate API keys regularly
- Monitor access logs

### AI/ML
- Monitor OpenAI API usage
- Implement rate limiting if needed
- Test agent responses regularly
- Maintain RAG knowledge base
- Update cancer type mappings

## Limitations

- OpenAI API dependency for chatbot
- Token limits per conversation
- Language model costs
- RAG knowledge base must be maintained
- Single-server deployment (horizontal scaling requires shared Redis)

## License

Copyright (c) 2025 Healthcare Portal. All rights reserved.
