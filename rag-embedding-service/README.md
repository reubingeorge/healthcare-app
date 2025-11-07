# RAG Embedding Service

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2.4-green?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django%20REST%20Framework-3.14.0-red?logo=django&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-0.3.27-1C3C3C)
![OpenAI](https://img.shields.io/badge/OpenAI-Embeddings-412991?logo=openai&logoColor=white)
![pgvector](https://img.shields.io/badge/pgvector-0.4.1-336791)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-6.2.0-DC382D?logo=redis&logoColor=white)
![Channels](https://img.shields.io/badge/Channels-4.3.0-092E20)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-1.26.4-013243?logo=numpy&logoColor=white)

A Django-based RAG (Retrieval-Augmented Generation) service for the Healthcare Portal, providing intelligent document processing, vector embeddings with pgvector, semantic search, and AI-powered chatbot responses using LangChain and OpenAI.

## Overview

The RAG Embedding Service is an advanced AI-powered knowledge management system that processes medical documents, generates vector embeddings, stores them in PostgreSQL with pgvector, and provides intelligent question-answering capabilities. It uses LangChain for document processing and orchestration, OpenAI for embeddings and chat completions, and implements cancer type-specific knowledge filtering for personalized healthcare responses.

## Features

### Document Processing
- **Asynchronous Processing**: Redis-backed job queue for background processing
- **Document Download**: Retrieve documents from file-service
- **PDF Processing**: Extract text from PDF documents using PyPDFLoader
- **Text Chunking**: Intelligent text splitting with RecursiveCharacterTextSplitter
- **Configurable Chunk Size**: Default 1000 characters with 200 character overlap
- **Separators**: Multiple separation strategies (paragraphs, sentences, words)
- **Progress Tracking**: Real-time progress updates via WebSocket

### Embedding Generation
- **OpenAI Embeddings**: Generate embeddings using text-embedding-3-small
- **Vector Storage**: Store embeddings in PostgreSQL with pgvector extension
- **Batch Processing**: Process multiple chunks efficiently
- **Cancer Type Association**: Tag embeddings with cancer types for filtering
- **Metadata Storage**: Store filename, chunk index, and content
- **Retry Logic**: Automatic retry on failure (max 3 attempts)
- **Timeout Protection**: Configurable processing timeout (default 5 minutes)

### Vector Search
- **Semantic Search**: Cosine similarity search with pgvector
- **Cancer Type Filtering**: Filter results by cancer type for personalized responses
- **Configurable Results**: Retrieve top-k relevant documents
- **Fast Retrieval**: Indexed vector search for performance
- **Context Assembly**: Combine relevant chunks for LLM context

### AI-Powered Chat
- **RAG Queries**: Query knowledge base with natural language
- **LangChain Integration**: Orchestrated retrieval and generation
- **OpenAI Chat**: GPT models for response generation
- **Multi-Language Support**: Respond in patient's preferred language
- **Session Management**: Track chat history and context
- **Session Clearing**: Clear chat history on demand
- **Context-Aware Responses**: Use retrieved documents for accurate answers
- **NCCN Guidelines**: Medical knowledge based on treatment guidelines

### Job Management
- **Job Queue**: Redis-based job queue
- **Job Status Tracking**: Monitor processing status (pending, processing, completed, failed)
- **Queue Statistics**: View queue metrics (pending, processing, completed, failed counts)
- **Concurrent Processing**: Configurable concurrent job limits (default 3)
- **Job Metadata**: Store job details including user ID, timestamps
- **Cleanup**: Automatic temporary file cleanup after processing

### Real-Time Updates
- **WebSocket Support**: Real-time progress updates via Django Channels
- **Progress Notifications**: Phase, percentage, and status messages
- **Connection Management**: Automatic reconnection handling
- **Broadcasting**: Update all connected clients

### Security
- **JWT Authentication**: Required for all endpoints (except health check)
- **User Authorization**: User-specific access control
- **Event Logging**: Comprehensive audit trail
- **Secure File Handling**: Temporary file cleanup
- **Service Token**: Database service authentication

### Integration
- **Database Service**: Store embeddings, jobs, and chat sessions
- **File Service**: Download documents for processing
- **OpenAI API**: Embeddings and chat completions
- **Redis**: Job queue and WebSocket backend
- **PostgreSQL**: Vector storage with pgvector

## Architecture

### Technology Stack

**Backend**:
- Django 5.2.4
- Django REST Framework 3.14.0
- Django Channels 4.3.0 (WebSocket support)
- Daphne 4.2.1 (ASGI server)
- Python 3.11

**AI/ML Libraries**:
- LangChain 0.3.27 (orchestration framework)
- LangChain Community 0.3.27 (document loaders)
- LangChain OpenAI 0.3.28 (OpenAI integration)
- OpenAI API >=1.86.0 (embeddings and chat)
- NumPy 1.26.4 (vector operations)

**Document Processing**:
- PyPDF 5.9.0 (PDF processing)
- python-docx 1.1.2 (Word document processing)
- tiktoken 0.9.0 (token counting)

**Database & Storage**:
- PostgreSQL 14+ with pgvector 0.4.1
- Redis 6.2.0 (job queue and channels)
- psycopg2-binary 2.9.9 (PostgreSQL adapter)

**Dependencies**:
- channels-redis 4.3.0 (Channels Redis backend)
- django-cors-headers 4.3.1
- PyJWT 2.8.0 (JWT authentication)
- python-dotenv 1.0.1 (configuration management)
- requests 2.32.3 (HTTP client)
- python-magic 0.4.27 (file type detection)
- hiredis 2.4.0 (Redis performance)

### Document Processing Pipeline

#### Job Submission
1. Client submits document ID and cancer type ID
2. Service validates request with JWT authentication
3. Job created in Redis queue with metadata
4. Job ID returned with WebSocket URL for progress

#### Job Processing
1. Background worker picks job from queue
2. Document downloaded from file-service
3. PDF loaded and parsed with PyPDFLoader
4. Text split into chunks with RecursiveCharacterTextSplitter
5. For each chunk:
   - Generate embedding with OpenAI
   - Store in PostgreSQL with pgvector
   - Associate with cancer type and document
   - Send progress update via WebSocket
6. Mark job as completed
7. Cleanup temporary files

#### Progress Updates
1. Worker sends progress to WebSocket channel
2. Channel layer broadcasts to connected clients
3. Updates include phase, percentage, and messages
4. Clients receive real-time status

### RAG Query Pipeline

#### Query Processing
1. User submits natural language query
2. Optional cancer type ID for filtering
3. Query embedded with OpenAI
4. Vector similarity search in PostgreSQL
5. Top-k relevant chunks retrieved (filtered by cancer type)
6. Context assembled from retrieved chunks
7. LangChain constructs prompt with context
8. OpenAI generates response
9. Response returned in specified language

#### Session Management
1. Chat sessions tracked in database
2. Message history stored per session
3. Context maintained across conversation
4. Session can be cleared on demand

### LangChain Integration

**Components Used**:
- Document Loaders (PyPDFLoader)
- Text Splitters (RecursiveCharacterTextSplitter)
- Embeddings (OpenAIEmbeddings)
- Vector Stores (custom pgvector integration)
- Chat Models (ChatOpenAI)
- Chains (retrieval QA chains)

## Docker Deployment

### Build Docker Image

```bash
docker build -t rag-embedding-service .
```

### Run Docker Container

```bash
docker run -p 8007:8007 --env-file .env rag-embedding-service
```

### Run with Environment Variables

```bash
docker run -p 8007:8007 \
  -e SECRET_KEY=your-secret-key \
  -e JWT_SECRET_KEY=your-jwt-secret \
  -e DATABASE_SERVICE_URL=http://database-service:8004 \
  -e DATABASE_SERVICE_TOKEN=your-service-token \
  -e FILE_SERVICE_URL=http://file-service:8006 \
  -e OPENAI_API_KEY=your-openai-key \
  -e REDIS_URL=redis://redis:6379 \
  rag-embedding-service
```

### Docker Compose

```bash
# Start service with docker-compose
docker-compose up -d rag-embedding-service

# View logs
docker-compose logs -f rag-embedding-service

# Stop service
docker-compose down
```

### Health Check

```bash
# Check if service is running
curl http://localhost:8007/api/rag/health/
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key (required) | None |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1` |
| `JWT_SECRET_KEY` | JWT signing key (required) | None |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `DATABASE_SERVICE_URL` | Database service URL | `http://database-service:8004` |
| `DATABASE_SERVICE_TOKEN` | Database service auth token (required) | None |
| `FILE_SERVICE_URL` | File service URL | `http://file-service:8006` |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |
| `REDIS_DB` | Redis database number | `1` |
| `OPENAI_API_KEY` | OpenAI API key (required) | None |
| `OPENAI_EMBEDDING_MODEL` | OpenAI embedding model | `text-embedding-3-small` |
| `RAG_CHUNK_SIZE` | Text chunk size in characters | `1000` |
| `RAG_CHUNK_OVERLAP` | Chunk overlap in characters | `200` |
| `RAG_MAX_CONCURRENT_PROCESSING` | Max concurrent jobs | `3` |
| `RAG_PROCESSING_TIMEOUT` | Job timeout in seconds | `300` |
| `RAG_RETRY_MAX_ATTEMPTS` | Max retry attempts | `3` |
| `RAG_RETRY_DELAY` | Retry delay in seconds | `60` |

## API Endpoints

### Embedding Processing

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/rag/embeddings/process/` | POST | Required | Submit document for embedding processing |
| `/api/rag/embeddings/status/` | GET | Required | Get overall queue statistics |
| `/api/rag/embeddings/status/<job_id>/` | GET | Required | Get specific job status |
| `/api/rag/embeddings/queue/` | GET | Required | Get current queue state |

### Chat & Query

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/rag/chat/query/` | POST | Required | Query RAG system with natural language |
| `/api/rag/chat/clear-session/` | POST | Required | Clear chat session history |

### WebSocket

| Endpoint | Protocol | Authentication | Description |
|----------|----------|----------------|-------------|
| `/ws/rag/progress/<job_id>/` | WebSocket | Required | Real-time progress updates |

### Health Check

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rag/health/` | GET | Health check (no auth required) |

### Request Parameters

**Process Embedding** (`/api/rag/embeddings/process/`):
- Headers: `Authorization: Bearer <jwt_token>`
- Body (JSON):
  - `document_id`: File ID from file-service (required)
  - `cancer_type_id`: Cancer type ID for filtering (required)

**Query RAG** (`/api/rag/chat/query/`):
- Headers: `Authorization: Bearer <jwt_token>`
- Body (JSON):
  - `query`: Natural language query (required)
  - `cancer_type_id`: Filter by cancer type (optional)
  - `session_id`: Chat session ID (optional)
  - `language`: Response language (optional, default: English)

**Clear Session** (`/api/rag/chat/clear-session/`):
- Headers: `Authorization: Bearer <jwt_token>`
- Body (JSON):
  - `session_id`: Session ID to clear (required)

## Project Structure

```
rag-embedding-service/
├── rag_app/                    # Main application
│   ├── __init__.py
│   ├── auth.py                 # JWT authentication utilities
│   ├── decorators.py           # Custom decorators
│   ├── exceptions.py           # Custom exceptions
│   ├── views.py                # API views
│   ├── urls.py                 # API URL routing
│   ├── services.py             # Service orchestration
│   ├── document_processor.py   # Document processing engine
│   ├── langchain_integration.py # LangChain wrapper
│   ├── queue_manager.py        # Redis queue management
│   ├── utils.py                # Utility functions
│   ├── consumers.py            # WebSocket consumers
│   └── routing.py              # WebSocket routing
├── rag_service/                # Django project
│   ├── __init__.py
│   ├── settings.py             # Django settings
│   ├── urls.py                 # Root URL configuration
│   ├── wsgi.py                 # WSGI entry point
│   └── asgi.py                 # ASGI entry point (for Channels)
├── media/                      # Storage directory
│   └── temp_files/             # Temporary file storage
├── Dockerfile                  # Docker configuration
├── entrypoint.sh               # Docker entrypoint script
├── manage.py                   # Django management script
├── requirements.txt            # Python dependencies
└── .env                        # Environment configuration
```

## Key Components

### Document Processor (`rag_app/document_processor.py`)

**Document Loading**:
- Download files from file-service
- Parse PDFs with PyPDFLoader
- Extract text content

**Text Splitting**:
- RecursiveCharacterTextSplitter
- Configurable chunk size and overlap
- Multiple separation strategies

**Embedding Generation**:
- OpenAI text-embedding-3-small
- Batch processing for efficiency
- Error handling with retry logic

**Storage**:
- Store embeddings in PostgreSQL with pgvector
- Associate with document and cancer type
- Store metadata (filename, chunk index)

### LangChain Integration (`rag_app/langchain_integration.py`)

**RAG Chain**:
- Document retrieval from pgvector
- Prompt construction with context
- OpenAI chat completion
- Response generation

**Vector Store**:
- Custom pgvector integration
- Similarity search with cancer type filtering
- Efficient indexed queries

### Queue Manager (`rag_app/queue_manager.py`)

**Job Queue**:
- Redis-backed queue implementation
- Job submission and retrieval
- Status tracking
- Queue statistics

**Background Processing**:
- Dedicated processing thread
- Concurrent job handling
- Timeout protection
- Automatic retry

### Services (`rag_app/services.py`)

**EmbeddingService**:
- Document processing orchestration
- Job management
- Progress tracking
- Error handling

**ChatService**:
- RAG query processing
- Session management
- Context assembly
- Response generation

## Document Processing Flow

1. **Submission**: Client submits document ID and cancer type
2. **Validation**: JWT authentication and parameter validation
3. **Queue**: Job added to Redis queue
4. **Download**: Document retrieved from file-service
5. **Parse**: PDF loaded and text extracted
6. **Split**: Text divided into chunks with overlap
7. **Embed**: Each chunk embedded with OpenAI
8. **Store**: Embeddings saved to PostgreSQL with pgvector
9. **Progress**: WebSocket updates sent throughout
10. **Complete**: Job marked as completed
11. **Cleanup**: Temporary files removed

## RAG Query Flow

1. **Query**: User submits natural language question
2. **Embed**: Query embedded with OpenAI
3. **Search**: Vector similarity search in PostgreSQL
4. **Filter**: Results filtered by cancer type (if specified)
5. **Retrieve**: Top-k relevant chunks retrieved
6. **Assemble**: Context constructed from chunks
7. **Prompt**: LangChain builds prompt with context
8. **Generate**: OpenAI generates response
9. **Translate**: Response localized to specified language
10. **Return**: Response sent to client

## Security Considerations

### Authentication & Authorization
- JWT token required for all endpoints (except health check)
- User ID extracted from token
- Service token for database communication

### Data Privacy
- Temporary files cleaned up after processing
- Document access controlled by file-service
- Embeddings associated with cancer types for filtering

### API Security
- OpenAI API key securely stored
- Rate limiting on expensive operations
- Timeout protection for long-running jobs

### Production Settings
- Debug mode disabled
- CORS configured for specific origins
- Secure cookie settings
- CSRF protection enabled

## Error Handling

The service returns appropriate HTTP status codes:

- `200 OK`: Successful request
- `202 Accepted`: Job submitted successfully
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: Job or resource not found
- `500 Internal Server Error`: Processing error
- `503 Service Unavailable`: Health check failed

## Logging

The service logs to console (stdout) with configurable log levels. Logs include:
- Job submission and processing events
- Document processing steps
- Embedding generation
- Vector storage operations
- RAG queries
- WebSocket connections
- Errors and warnings

## Port

Default port: **8007**

## Health Check

The service provides a health check endpoint that validates:
- Redis connectivity
- Database service connectivity
- OpenAI API key configuration

## Performance Considerations

### Embedding Generation
- Batch processing for efficiency
- Concurrent job processing (configurable)
- OpenAI API rate limits
- Token counting for cost management

### Vector Search
- pgvector indexed similarity search
- Cancer type filtering at database level
- Configurable top-k results
- Query optimization

### Background Processing
- Redis-backed job queue
- Multiple concurrent workers
- Timeout protection
- Automatic retry on failure

### Caching
- Redis for job status
- Session state management
- WebSocket channel layers

## Best Practices

### Deployment
- Use Docker for consistent deployments
- Configure OpenAI API key securely
- Set appropriate chunk size for documents
- Monitor Redis memory usage
- Implement proper monitoring and alerting

### Performance
- Adjust concurrent processing based on resources
- Monitor OpenAI API usage and costs
- Optimize chunk size and overlap
- Use indexed vector search
- Batch operations when possible

### Security
- Always use strong, unique SECRET_KEY and JWT_SECRET_KEY values
- Never commit secrets to version control
- Use environment variables for all sensitive configuration
- Rotate API keys regularly
- Monitor access logs

### Database
- Regular pgvector index maintenance
- Monitor PostgreSQL performance
- Implement backup strategies
- Clean up old embeddings periodically

## Limitations

- OpenAI API dependency for embeddings and chat
- Token costs for embedding generation
- Processing time depends on document size
- PostgreSQL storage requirements for vectors
- Single-server deployment (horizontal scaling requires shared Redis and PostgreSQL)

## License

Copyright (c) 2025 Healthcare Portal. All rights reserved.
