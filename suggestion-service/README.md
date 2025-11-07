# Suggestion Service

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?logo=fastapi&logoColor=white)
![Uvicorn](https://img.shields.io/badge/Uvicorn-ASGI%20Server-499848?logo=gunicorn&logoColor=white)
![Sentence Transformers](https://img.shields.io/badge/Sentence%20Transformers-all--MiniLM--L6--v2-FF6F00)
![PyTorch](https://img.shields.io/badge/PyTorch-CPU%20Only-EE4C2C?logo=pytorch&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-1.26+-013243?logo=numpy&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-2.10.1-000000?logo=json-web-tokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

A FastAPI-based intelligent question suggestion service for the Healthcare Portal, providing personalized, context-aware question recommendations using semantic similarity and sentence embeddings.

## Overview

The Suggestion Service is a lightweight, high-performance microservice that suggests relevant questions to patients during chat interactions. It uses sentence transformers to compute semantic similarity between chat history and pre-defined question templates, filtering out already-asked questions and ranking suggestions by relevance. The service supports cancer type-specific filtering and provides deterministic, reproducible rankings for consistent user experiences.

## Features

### Question Suggestion
- **Semantic Similarity**: Uses sentence-transformers (all-MiniLM-L6-v2) for computing question relevance
- **Context-Aware**: Analyzes entire chat history to understand conversation context
- **Deduplication**: Filters out questions already asked by the user
- **Cancer Type Filtering**: Suggests questions relevant to patient's specific cancer type
- **Deterministic Ranking**: Consistent, reproducible suggestion ordering
- **Multi-Tier Results**: Returns both top_4 and top_15 suggestions
- **Threshold-Based**: Configurable similarity threshold to ensure relevance
- **Template Library**: Pre-defined question templates covering common patient needs

### Performance Features
- **CPU-Optimized**: Uses CPU-only PyTorch for efficient inference
- **Fast Inference**: Lightweight all-MiniLM-L6-v2 model for quick responses
- **Batch Processing**: Efficient embedding computation for multiple templates
- **Model Caching**: In-memory model persistence for fast repeated queries
- **Minimal Dependencies**: Slim Docker image with essential packages only

### Security
- **JWT Authentication**: Required for all endpoints
- **Token Validation**: Verify token signature and expiration
- **User Context**: Extract user information from JWT claims
- **Bearer Token Support**: HTTPBearer authentication scheme
- **Environment-Based Secrets**: JWT secret keys from environment variables

### Integration
- **Database Service**: Fetch question templates and chat history
- **Patient Service**: Provide suggestions for AI chatbot
- **Stateless Design**: No local data storage, queries external services

## Architecture

### Technology Stack

**Backend**:
- FastAPI (ASGI web framework)
- Uvicorn (ASGI server)
- Python 3.11

**AI/ML Libraries**:
- Sentence Transformers (embedding generation)
- PyTorch (CPU-only, deep learning backend)
- NumPy (numerical operations)
- Model: all-MiniLM-L6-v2 (384-dimensional embeddings)

**Authentication**:
- PyJWT (JWT token validation)
- FastAPI HTTPBearer security

**Dependencies**:
- Minimal runtime dependencies for fast startup
- CPU-only PyTorch installation to reduce image size
- No CUDA dependencies

### Suggestion Pipeline

#### Request Processing
1. Client sends POST request to `/suggest` with JWT token
2. Service validates JWT token and extracts user claims
3. Request body parsed: chat history, cancer type, filters
4. Token forwarded to database service for template retrieval

#### Template Retrieval
1. Query database service for question templates
2. Filter templates by cancer type if specified
3. Fetch user's chat history from database service
4. Extract all questions already asked by user

#### Similarity Computation
1. Concatenate entire chat history into context string
2. Generate embedding for chat context using sentence-transformer
3. Generate embeddings for all template questions
4. Compute cosine similarity between context and each template
5. Filter out questions matching already-asked patterns
6. Apply similarity threshold (default 0.3)

#### Ranking and Response
1. Sort templates by similarity score (descending)
2. Return top 4 suggestions (primary recommendations)
3. Return top 15 suggestions (extended list for UI)
4. Include similarity scores for each suggestion

## Docker Deployment

### Build Docker Image

```bash
docker build -t suggestion-service .
```

### Run Docker Container

```bash
docker run -p 8009:8009 --env-file .env suggestion-service
```

### Run with Environment Variables

```bash
docker run -p 8009:8009 \
  -e JWT_SECRET_KEY=your-jwt-secret \
  -e JWT_ALGO=HS256 \
  -e DATABASE_SERVICE_URL=http://database-service:8004 \
  -e DATABASE_SERVICE_TOKEN=your-service-token \
  suggestion-service
```

### Docker Compose

```bash
# Start service with docker-compose
docker-compose up -d suggestion-service

# View logs
docker-compose logs -f suggestion-service

# Stop service
docker-compose down
```

### Health Check

```bash
# Check if service is running
curl http://localhost:8009/health
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET_KEY` | JWT signing key (required) | None |
| `JWT_ALGO` | JWT algorithm | `HS256` |
| `DATABASE_SERVICE_URL` | Database service URL | `http://database-service:8004` |
| `DATABASE_SERVICE_TOKEN` | Database service auth token (required) | None |
| `HF_HOME` | Hugging Face model cache directory | `/models_cache` |
| `TOKENIZERS_PARALLELISM` | Tokenizer parallelism | `false` |

## API Endpoints

### Suggestion Operations

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/suggest` | POST | Required | Get personalized question suggestions |
| `/health` | GET | None | Health check endpoint |

### Request Parameters

**Get Suggestions** (`/suggest`):
- Headers: `Authorization: Bearer <jwt_token>`
- Body: `application/json`
  - `chat_history`: Array of chat messages (user and assistant)
  - `cancer_type`: Optional cancer type for filtering
  - `similarity_threshold`: Optional threshold for filtering (default: 0.3)
  - `exclude_patterns`: Optional list of question patterns to exclude

## Project Structure

```
suggestion-service/
├── suggestion_api.py         # FastAPI application and main endpoint
├── model.py                   # Sentence transformer model loading
├── db_utils.py                # Database service integration utilities
├── auth.py                    # JWT authentication utilities
├── suggestions.json           # Question template data
├── export_model.py            # Model export utility
├── Dockerfile                 # Docker configuration
└── .env                       # Environment configuration
```

## Key Components

### API Application (`suggestion_api.py`)

**FastAPI Application**:
- POST `/suggest` endpoint for question recommendations
- GET `/health` endpoint for health checks
- JWT authentication via dependency injection
- Request/response models with Pydantic

**Suggestion Logic**:
- Chat history concatenation and embedding
- Template embedding and similarity computation
- Deduplication based on chat history
- Deterministic ranking by similarity score
- Multi-tier response (top_4, top_15)

**Database Integration**:
- Fetch question templates by cancer type
- Retrieve user chat history
- Token forwarding for authentication

### Model (`model.py`)

**Model Initialization**:
- Load all-MiniLM-L6-v2 from sentence-transformers
- Cache model in memory for fast inference
- Configure for CPU-only execution

**Embedding Generation**:
- Generate 384-dimensional embeddings
- Support batch processing for efficiency
- Normalize embeddings for cosine similarity

### Database Utilities (`db_utils.py`)

**Template Retrieval**:
- Query question templates from database service
- Filter by cancer type
- Forward JWT token for authorization

**Chat History**:
- Fetch user's conversation history
- Extract questions from chat messages
- Support pagination and filtering

### Authentication (`auth.py`)

**JWT Validation**:
- HTTPBearer token extraction
- JWT signature verification
- Token expiration checking
- Claims extraction for user context

**Security**:
- Environment-based secret configuration
- Algorithm specification (HS256, RS256, etc.)
- Dependency injection for route protection

## Suggestion Algorithm

### Context Building
1. Extract all messages from chat history
2. Concatenate into single context string
3. Include both user questions and assistant responses
4. Generate semantic embedding of entire context

### Template Matching
1. Retrieve all question templates from database
2. Filter templates by cancer type if specified
3. Generate embeddings for each template question
4. Compute cosine similarity with context embedding

### Deduplication
1. Extract questions already asked from chat history
2. Compare template questions with asked questions
3. Filter out near-duplicate matches
4. Apply case-insensitive, punctuation-agnostic matching

### Ranking
1. Sort templates by similarity score (highest first)
2. Apply similarity threshold (default 0.3)
3. Select top 4 for primary recommendations
4. Select top 15 for extended recommendations
5. Include scores and metadata for each suggestion

## Security Considerations

### Authentication & Authorization
- JWT token required for all suggestion requests
- Token validation on every request
- Signature verification with secret key
- Expiration checking to prevent replay attacks
- Bearer token scheme for secure transmission

### Token Security
- JWT secret keys stored in environment variables
- Algorithm specified via configuration
- No default secrets or hardcoded keys
- Token forwarding to database service for authorization

### Data Privacy
- No persistent storage of chat history
- Stateless processing of user data
- Temporary embeddings computed on-demand
- No logging of sensitive user information

### Production Settings
- CORS configured for specific origins
- Rate limiting recommended for production
- Model cache isolated per container
- Secure token transmission over HTTPS

## Error Handling

The service returns appropriate HTTP status codes:

- `200 OK`: Successful suggestion generation
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Templates or chat history not found
- `500 Internal Server Error`: Model loading or processing error

## Logging

The service logs to console (stdout) with the following events:
- Model loading and initialization
- Suggestion request processing
- Database service communication
- Authentication failures
- Embedding computation times
- Template matching results
- Errors and warnings

## Port

Default port: **8009**

## Health Check

The service provides a simple health check endpoint at `/health` that returns a JSON response indicating service status.

## Performance Considerations

### Model Optimization
- CPU-only PyTorch for cost-effective deployment
- Lightweight all-MiniLM-L6-v2 model (80MB)
- In-memory model caching for fast inference
- Batch embedding computation for efficiency

### Inference Speed
- Average inference time: 50-100ms per request
- Fast cosine similarity computation with NumPy
- Minimal overhead from lightweight FastAPI
- Efficient token validation with PyJWT

### Resource Usage
- Low memory footprint (< 500MB)
- Minimal CPU usage for inference
- No GPU required
- Scalable with container orchestration

### Template Management
- Pre-loaded question templates
- Efficient filtering by cancer type
- Minimal database queries
- Caching opportunities for repeated queries

## Best Practices

### Deployment
- Use Docker for consistent deployments
- Configure proper resource limits
- Set appropriate rate limiting
- Implement monitoring and alerting
- Use health checks for orchestration

### Performance
- Cache question templates when possible
- Monitor embedding computation times
- Optimize similarity threshold for accuracy/recall balance
- Batch requests when applicable

### Security
- Always use strong, unique JWT_SECRET_KEY values
- Never commit secrets to version control
- Use environment variables for all sensitive configuration
- Enable HTTPS in production environments
- Rotate JWT secret keys regularly
- Monitor authentication failures

### Integration
- Handle database service unavailability gracefully
- Implement retry logic for transient failures
- Validate input from client applications
- Log errors for debugging and monitoring

## Limitations

- Requires database service for templates and chat history
- CPU-only inference (no GPU acceleration)
- Fixed embedding model (all-MiniLM-L6-v2)
- English-language optimized model
- No built-in caching of templates
- Stateless design requires external data sources
- Single-server deployment (horizontal scaling requires load balancer)

## License

Copyright (c) 2025 Healthcare Portal. All rights reserved.
