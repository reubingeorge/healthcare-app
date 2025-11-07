# OCR Service

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2.5-green?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django%20REST%20Framework-3.16.1-red?logo=django&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-2.8.0-EE4C2C?logo=pytorch&logoColor=white)
![Transformers](https://img.shields.io/badge/Transformers-4.54.1-FFD000?logo=huggingface&logoColor=black)
![TrOCR](https://img.shields.io/badge/TrOCR-Microsoft-0078D4?logo=microsoft&logoColor=white)
![Tesseract](https://img.shields.io/badge/Tesseract-OCR-008080)
![Channels](https://img.shields.io/badge/Channels-4.3.1-092E20)
![Redis](https://img.shields.io/badge/Redis-6.4.0-DC382D?logo=redis&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-4.12.0-5C3EE8?logo=opencv&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![GPU](https://img.shields.io/badge/GPU-Accelerated-76B900?logo=nvidia&logoColor=white)

An AI-powered OCR service for the Healthcare Portal, providing intelligent optical character recognition with automatic GPU detection, real-time progress tracking via WebSockets, and support for multiple file formats using TrOCR and Tesseract.

## Overview

The OCR Service is an advanced document processing microservice that extracts text from medical documents, images, and PDFs. It features automatic GPU detection and optimization, real-time processing progress via WebSockets, intelligent image preprocessing, and dual OCR engines (TrOCR for GPU, Tesseract for CPU). The service uses a Redis-backed job queue for asynchronous processing with support for cancellation and progress tracking.

## Features

### OCR Processing
- **Multi-Format Support**: Process PDFs, images, and text files
- **Supported Formats**: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.bmp`, `.tiff`, `.txt`, `.rtf`
- **Dual OCR Engines**:
  - TrOCR (Microsoft Transformer-based OCR) for GPU-accelerated processing
  - Tesseract OCR for CPU-based processing
- **Automatic Model Selection**: Chooses optimal model based on GPU availability
- **GPU Detection**: Automatic detection and utilization of CUDA-enabled GPUs
- **Image Preprocessing**: Grayscale conversion, thresholding, denoising for better accuracy
- **PDF Processing**: Multi-page PDF support with configurable DPI
- **Confidence Scoring**: Per-page and overall confidence scores
- **Page-by-Page Results**: Structured results with individual page text

### Job Management
- **Asynchronous Processing**: Redis-backed job queue
- **Job Submission**: Upload files for background processing
- **Job Status Tracking**: Check processing status (pending, processing, completed, failed, cancelled)
- **Job Results**: Retrieve extracted text and metadata
- **Job Cancellation**: Cancel pending or in-progress jobs
- **User Job History**: View all jobs submitted by user
- **Automatic Cleanup**: Temporary file cleanup after processing
- **Timeout Protection**: Configurable job timeout (default 5 minutes)

### Real-Time Updates
- **WebSocket Support**: Real-time progress tracking via Django Channels
- **Progress Notifications**: Percentage and status message updates
- **Page Progress**: Per-page progress for PDF documents
- **Connection Management**: Automatic reconnection handling

### Performance Features
- **GPU Acceleration**: Automatic CUDA GPU detection and utilization
- **Memory Management**: GPU memory threshold detection
- **Concurrent Processing**: Configurable concurrent job limits (default 3)
- **Queue Statistics**: Monitor queue size, processing jobs, completed jobs
- **Processing Thread**: Dedicated background processing thread
- **Model Caching**: In-memory model caching for faster repeated processing

### Security
- **JWT Authentication**: Required for all endpoints
- **User Authorization**: Users can only access their own jobs
- **File Validation**: Extension and size validation
- **Temporary Storage**: Secure temporary file handling
- **Access Control**: Per-job ownership verification

### System Information
- **GPU Status**: Check GPU availability, memory, and model name
- **Model Information**: View loaded models and device information
- **Queue Statistics**: Monitor processing queue health
- **Health Checks**: Redis connectivity and processing thread status

## Architecture

### Technology Stack

**Backend**:
- Django 5.2.5
- Django REST Framework 3.16.1
- Django Channels 4.3.1 (WebSocket support)
- Daphne 4.2.1 (ASGI server)
- Redis 6.4.0 (job queue and WebSocket backend)
- Python 3.11

**AI/ML Libraries**:
- PyTorch 2.8.0 (deep learning framework)
- Transformers 4.54.1 (Hugging Face transformers)
- TrOCR (Microsoft Transformer-based OCR)
- Tesseract OCR 0.3.13 (traditional OCR engine)

**Image Processing**:
- Pillow 11.3.0 (image handling)
- OpenCV 4.12.0 (image preprocessing)
- pdf2image 1.17.0 (PDF to image conversion)
- NumPy 2.2.3 (numerical operations)

**Dependencies**:
- channels-redis 4.3.0 (Channels Redis backend)
- django-cors-headers 4.7.0
- python-dotenv 1.1.1
- PyJWT 2.10.1
- requests 2.32.4
- gunicorn 23.0.0
- whitenoise 6.9.0

**System Dependencies**:
- Tesseract OCR
- Poppler (PDF utilities)
- CUDA (optional, for GPU acceleration)

### OCR Processing Pipeline

#### Job Submission
1. Client uploads file with JWT token
2. Service validates file extension and size
3. File saved to temporary storage
4. Job created in Redis queue
5. Job ID returned with WebSocket URL

#### Job Processing
1. Background thread picks job from queue
2. OCR processor initialized with GPU detection
3. File type determined (PDF, image, text)
4. Appropriate processing method selected
5. For PDFs: Convert to images at configured DPI
6. For images: Apply preprocessing (grayscale, threshold, denoise)
7. TrOCR or Tesseract performs text extraction
8. Confidence scores calculated
9. Results stored in Redis
10. Temporary file cleaned up
11. Job marked as completed

#### Real-Time Progress
1. Client connects to WebSocket endpoint
2. Processing sends progress updates via Channels
3. Updates include percentage and status message
4. Client receives real-time notifications

### GPU Detection

The service automatically detects and utilizes available GPUs:

1. Check CUDA availability via PyTorch
2. Query GPU memory and capabilities
3. Compare available memory to threshold (default 0.5 GB)
4. Select appropriate model:
   - GPU: `microsoft/trocr-large-printed`
   - CPU: `microsoft/trocr-base-printed`
5. Load model to appropriate device
6. Process with GPU acceleration when available

## Docker Deployment

### Build Docker Image

```bash
docker build -t ocr-service .
```

### Run Docker Container (CPU Only)

```bash
docker run -p 8008:8008 --env-file .env ocr-service
```

### Run with GPU Support

```bash
docker run -p 8008:8008 \
  --gpus all \
  -e SECRET_KEY=your-secret-key \
  -e JWT_SECRET_KEY=your-jwt-secret \
  -e REDIS_URL=redis://redis:6379 \
  -e DATABASE_SERVICE_URL=http://database-service:8004 \
  -e DATABASE_SERVICE_TOKEN=your-service-token \
  ocr-service
```

### Docker Compose

```bash
# Start service with docker-compose
docker-compose up -d ocr-service

# View logs
docker-compose logs -f ocr-service

# Stop service
docker-compose down
```

### Health Check

```bash
# Check if service is running
curl http://localhost:8008/api/ocr/health/
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
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |
| `OCR_REDIS_DB` | Redis database number | `2` |
| `DATABASE_SERVICE_URL` | Database service URL | `http://database-service:8004` |
| `DATABASE_SERVICE_TOKEN` | Database service auth token (required) | None |
| `FILE_SERVICE_URL` | File service URL | `http://file-service:8006` |
| `OCR_MAX_FILE_SIZE_MB` | Maximum file size in MB | `50` |
| `OCR_ALLOWED_EXTENSIONS` | Comma-separated file extensions | `.txt,.rtf,.pdf,.jpg,.jpeg,.png,.bmp,.tiff` |
| `OCR_GPU_THRESHOLD` | GPU memory threshold in GB | `0.5` |
| `OCR_MODEL_GPU` | TrOCR model for GPU | `microsoft/trocr-large-printed` |
| `OCR_MODEL_CPU` | TrOCR model for CPU | `microsoft/trocr-base-printed` |
| `OCR_MAX_CONCURRENT_JOBS` | Max concurrent processing jobs | `3` |
| `OCR_JOB_TIMEOUT` | Job timeout in seconds | `300` |
| `OCR_CLEANUP_DELAY` | Cleanup delay in seconds | `60` |
| `OCR_PDF_DPI` | PDF conversion DPI | `400` |
| `OCR_PDF_FORMAT` | PDF conversion format | `PNG` |

## API Endpoints

### OCR Job Management

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/ocr/submit/` | POST | Required | Submit file for OCR processing |
| `/api/ocr/job/<job_id>/status/` | GET | Required | Get job status |
| `/api/ocr/job/<job_id>/result/` | GET | Required | Get OCR result (extracted text) |
| `/api/ocr/job/<job_id>/cancel/` | POST | Required | Cancel pending or processing job |
| `/api/ocr/jobs/` | GET | Required | Get user's OCR jobs |

### Statistics & Information

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/ocr/stats/` | GET | Required | Get queue statistics |
| `/api/ocr/system/` | GET | Required | Get system info (GPU status, models) |

### WebSocket

| Endpoint | Protocol | Authentication | Description |
|----------|----------|----------------|-------------|
| `/ws/ocr/progress/<job_id>/` | WebSocket | Required | Real-time progress updates |

### Health Check

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ocr/health/` | GET | Health check (no auth required) |

### Request Parameters

**Submit OCR Job** (`/api/ocr/submit/`):
- Headers: `Authorization: Bearer <jwt_token>`
- Body: `multipart/form-data`
  - `file`: File to process

**Get User Jobs** (`/api/ocr/jobs/`):
- Headers: `Authorization: Bearer <jwt_token>`
- Query Parameters:
  - `limit`: Maximum number of jobs to return (default: 10, max: 100)

## Project Structure

```
ocr-service/
├── ocr_app/                    # Main application
│   ├── __init__.py
│   ├── auth.py                 # JWT authentication utilities
│   ├── decorators.py           # Custom decorators
│   ├── exceptions.py           # Custom exceptions
│   ├── gpu_detector.py         # GPU detection and model selection
│   ├── ocr_processor.py        # OCR processing engine
│   ├── queue_manager.py        # Redis queue management
│   ├── services.py             # OCR service orchestration
│   ├── views.py                # API views
│   ├── urls.py                 # API URL routing
│   ├── consumers.py            # WebSocket consumers
│   └── routing.py              # WebSocket routing
├── ocr_service/                # Django project
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

### OCR Processor (`ocr_app/ocr_processor.py`)

**Model Initialization**:
- Automatic GPU detection
- Model selection based on available resources
- Loading TrOCR processor and model
- Device configuration (CUDA/CPU)

**File Processing**:
- Text file reading
- PDF to image conversion with multi-page support
- Image preprocessing (grayscale, threshold, denoise)
- TrOCR or Tesseract text extraction
- Confidence score calculation

**Progress Updates**:
- WebSocket-based real-time updates
- Per-page progress for PDFs

### GPU Detector (`ocr_app/gpu_detector.py`)

**GPU Detection**:
- CUDA availability check
- GPU memory query
- GPU model identification
- Memory threshold comparison

**Model Selection**:
- Automatic selection based on GPU availability
- Fallback to CPU model if GPU insufficient
- Optimal model recommendation

### Queue Manager (`ocr_app/queue_manager.py`)

**Redis Queue Operations**:
- Job submission to queue
- Job status tracking
- Job result storage
- Queue statistics
- Job cancellation
- Automatic cleanup

### Service Orchestrator (`ocr_app/services.py`)

**Job Management**:
- Job submission and validation
- Background processing thread
- Job queue monitoring
- Status updates
- Result storage
- File cleanup

## Job Status Flow

1. **Pending**: Job submitted to queue, waiting for processing
2. **Processing**: Job picked up by processing thread
3. **Completed**: OCR processing finished successfully
4. **Failed**: Processing encountered an error
5. **Cancelled**: User cancelled the job

## WebSocket Progress Format

Progress updates are sent in real-time during processing with the following structure:
- `job_id`: Job identifier
- `progress`: Percentage (0-100)
- `message`: Status message
- `timestamp`: Unix timestamp

## OCR Result Format

Completed jobs return results with:
- `extracted_text`: Full extracted text
- `confidence_score`: Average confidence (0-1)
- `page_count`: Number of pages processed
- `processing_time`: Time taken in seconds
- `model_used`: Model identifier
- `gpu_used`: Boolean indicating GPU usage

## Security Considerations

### Authentication & Authorization
- JWT token required for all endpoints (except health check)
- User ownership verification for job access
- Token validation on every request

### File Security
- File extension whitelist
- File size limits enforced
- Temporary file isolation
- Automatic cleanup after processing
- Secure file paths

### Processing Security
- Job timeout protection
- Concurrent job limits
- Resource monitoring
- GPU memory management

### Production Settings
- Debug mode disabled
- CORS configured for specific origins
- Secure cookie settings
- CSRF protection enabled

## Error Handling

The service returns appropriate HTTP status codes:

- `200 OK`: Successful request
- `202 Accepted`: Job submitted successfully
- `400 Bad Request`: Invalid input or job not ready
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: No permission to access job
- `404 Not Found`: Job not found
- `500 Internal Server Error`: Processing error

## Logging

The service logs to console (stdout) with configurable log levels. Logs include:
- Job submission and processing events
- GPU detection and model initialization
- OCR processing progress
- WebSocket connections
- Errors and warnings
- Performance metrics

## Port

Default port: **8008**

## Health Check

The service provides a health check endpoint that validates:
- Redis connectivity
- Processing thread status
- GPU detection functionality

## Performance Considerations

### GPU Optimization
- Automatic GPU detection and utilization
- Memory threshold configuration
- Model caching in GPU memory
- Batch processing for multiple pages

### CPU Fallback
- Automatic fallback to smaller CPU model
- Tesseract OCR as backup
- Memory-efficient processing

### Queue Management
- Configurable concurrent job limits
- Job timeout protection
- Automatic retry logic
- Resource-aware scheduling

### Image Preprocessing
- Grayscale conversion
- Adaptive thresholding
- Noise reduction
- Resolution optimization

## Best Practices

### Deployment
- Use Docker for consistent deployments
- Configure appropriate GPU resources
- Set reasonable job timeouts
- Monitor Redis memory usage
- Implement proper monitoring and alerting

### Performance
- Configure DPI based on document quality
- Adjust concurrent job limits based on resources
- Use GPU when available for better performance
- Monitor queue statistics

### Security
- Always use strong, unique SECRET_KEY and JWT_SECRET_KEY values
- Never commit secrets to version control
- Use environment variables for all sensitive configuration
- Enable HTTPS in production environments
- Monitor access logs

### File Management
- Implement cleanup policies for old jobs
- Monitor temporary storage usage
- Set appropriate file size limits
- Validate file types strictly

## Limitations

- Maximum file size (configurable, default 50MB)
- GPU memory requirements for large models
- Processing time depends on file size and complexity
- Temporary storage required during processing
- Single-server deployment (horizontal scaling requires shared Redis)

## License

Copyright (c) 2025 Healthcare Portal. All rights reserved.
