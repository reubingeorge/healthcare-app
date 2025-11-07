# Auth Service

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2.4-green?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django%20REST%20Framework-3.15.2-red?logo=django&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-2.10.1-000000?logo=json-web-tokens&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-6.2.0-DC382D?logo=redis&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-23.0.0-499848?logo=gunicorn&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-1.21.10-85EA2D?logo=swagger&logoColor=black)
![WhiteNoise](https://img.shields.io/badge/WhiteNoise-6.9.0-lightgrey)
![Rate Limiting](https://img.shields.io/badge/Rate%20Limiting-4.1.0-orange)

A Django-based authentication and authorization service for the Healthcare Portal, providing JWT-based authentication, user registration, login/logout, password management, and role-based access control.

## Overview

The Auth Service is the central authentication and authorization hub for the Healthcare Portal microservices architecture. It provides secure JWT token-based authentication, user session management, role-based access control, and automatic user profile creation for patients and clinicians.

## Features

### User Authentication
- **User Registration**: Create new accounts with email and password
  - Automatic profile creation for patients and clinicians
  - Password validation and hashing
  - Email uniqueness validation
  - Role assignment (Patient, Clinician, Admin)
- **User Login**: Authenticate users with email and password
  - JWT access token generation (configurable lifetime)
  - JWT refresh token generation (configurable lifetime)
  - Secure cookie management
  - Role-based redirection
  - Support for 'next' URL parameter
- **Token Management**:
  - Access token refresh
  - Activity-based token refresh (prevents constant regeneration)
  - Token verification
  - Refresh token validation and storage
  - Token invalidation on logout
- **Logout**:
  - Single device logout
  - Logout from all devices
  - Cookie clearing

### User Management
- **User Profile**: View and update user information
- **Password Management**: Change password with old password verification
- **User Details**: Retrieve user information by ID
- **Role-Based Access Control**: Verify user roles and permissions

### Security Features
- **JWT Authentication**: Stateless token-based authentication
- **Password Hashing**: Secure password storage using Django's password hashers
- **Rate Limiting**: Prevent brute force attacks on authentication endpoints
- **CSRF Protection**: Cross-Site Request Forgery protection
- **Secure Cookies**: HTTPOnly, SameSite, and Secure flags in production
- **XSS Protection**: Browser XSS filter enabled
- **Clickjacking Protection**: X-Frame-Options header
- **Token Expiration**: Automatic token expiry with configurable lifetimes
- **Token Blacklisting**: Invalidate tokens on logout and password change

### Web Interface
- **Login Page**: User-friendly login form with Tailwind CSS styling
- **Signup Page**: Registration form for new users
- **Logout Endpoint**: Server-side logout handling
- **Role-Based Redirection**: Automatic redirect based on user role

### Integration
- **Database Service**: Stateless architecture with database-service for data persistence
- **Redis Cache**: Token storage and session management
- **Automatic Profile Creation**:
  - Patient profiles created on PATIENT registration
  - Clinician profiles created on CLINICIAN registration
- **Service Authentication**: Token-based service-to-service communication

## Architecture

### Technology Stack

**Backend**:
- Django 5.2.4
- Django REST Framework 3.15.2
- PyJWT 2.10.1 (JWT authentication)
- Redis 6.2.0 (caching and sessions)
- django-redis 5.4.0 (Redis integration)
- Gunicorn 23.0.0 (WSGI server)
- Python 3.11

**Frontend**:
- Tailwind CSS (utility-first CSS framework)
- Vanilla JavaScript
- HTML templates (Django template engine)

**API Documentation**:
- drf-yasg 1.21.10 (Swagger/OpenAPI)

**Dependencies**:
- django-cors-headers 4.6.0
- django-ratelimit 4.1.0 (rate limiting)
- python-decouple 3.8 (configuration management)
- whitenoise 6.9.0 (static file serving)
- requests 2.32.4 (HTTP client)
- Node.js 20.x (for Tailwind CSS build)

**Database**:
- SQLite (in-memory for Django internals only)
- Stateless architecture - data managed by database-service
- Redis for sessions and token storage

### Authentication Flow

#### Registration Flow
1. User submits registration form with email, password, name, and role
2. Service validates email uniqueness and password strength
3. Password is hashed using Django's password hasher
4. User record created in database-service
5. Role-specific profile automatically created (Patient or Clinician)
6. JWT access and refresh tokens generated
7. Tokens stored in secure HTTPOnly cookies
8. User redirected to role-specific dashboard

#### Login Flow
1. User submits login credentials
2. Service retrieves user from database-service
3. Password verified against hashed password
4. User active status checked
5. JWT access and refresh tokens generated
6. Last login timestamp updated
7. Tokens stored in secure cookies
8. User redirected to role-specific dashboard or 'next' URL

#### Token Refresh Flow
1. Client sends refresh token
2. Service validates refresh token from database
3. User information retrieved
4. New access token generated
5. Access token returned to client

#### Activity-Based Refresh Flow
1. Client sends current access token
2. Service checks token age
3. If token is beyond threshold, new access token generated
4. If token is still fresh, no refresh performed

#### Logout Flow
1. User initiates logout
2. Refresh token invalidated in database
3. Access and refresh cookies cleared
4. User redirected to login page

### Middleware

**JWTAuthenticationMiddleware** (`authentication/middleware.py:11`):
- Authenticates template/web requests using JWT from cookies
- Skips API endpoints (handled by DRF authentication)
- Attaches user object to request
- Handles expired and invalid tokens gracefully
- Sets AnonymousUser for unauthenticated requests

### Authentication Classes

**JWTAuthentication** (`authentication/authentication.py:11`):
- DRF authentication class for API endpoints
- Validates Bearer tokens from Authorization header
- Verifies token signature and expiration
- Retrieves user data from database-service
- Checks user active status
- Creates authenticated user object for DRF

### Service Layer

**DatabaseService** (`authentication/services.py:9`):
- Centralized HTTP client for database-service communication
- User CRUD operations
- Refresh token management
- Patient and clinician profile operations
- Role management
- Service token authentication

## Docker Deployment

### Build Docker Image

```bash
docker build -t auth-service .
```

### Run Docker Container

```bash
docker run -p 8001:8001 --env-file .env auth-service
```

### Run with Environment Variables

```bash
docker run -p 8001:8001 \
  -e SECRET_KEY=your-secret-key \
  -e JWT_SECRET_KEY=your-jwt-secret \
  -e DATABASE_SERVICE_URL=http://database-service:8004 \
  -e REDIS_URL=redis://redis:6379/1 \
  -e DATABASE_SERVICE_TOKEN=your-service-token \
  auth-service
```

### Docker Compose

```bash
# Start service with docker-compose
docker-compose up -d auth-service

# View logs
docker-compose logs -f auth-service

# Stop service
docker-compose down
```

### Health Check

```bash
# Check if service is running
curl http://localhost:8001/health/
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
| `REDIS_URL` | Redis connection URL | `redis://redis:6379/1` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost,http://127.0.0.1` |
| `CSRF_TRUSTED_ORIGINS` | Comma-separated trusted origins | Empty |
| `USE_X_FORWARDED_HOST` | Trust X-Forwarded-Host header | `True` |
| `USE_X_FORWARDED_PORT` | Trust X-Forwarded-Port header | `True` |

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/auth/register/` | POST | None | Register new user |
| `/api/auth/login/` | POST | None | Login user |
| `/api/auth/logout/` | POST | Required | Logout current session |
| `/api/auth/logout-all/` | POST | Required | Logout from all devices |
| `/api/auth/refresh/` | POST | None | Refresh access token |
| `/api/auth/refresh-if-active/` | POST | None | Activity-based token refresh |
| `/api/auth/verify/` | GET | Required | Verify token validity |
| `/api/auth/change-password/` | POST | Required | Change user password |

### User Management Endpoints

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/auth/profile/` | GET, PATCH | Required | Get/update user profile |
| `/api/auth/users/<id>/` | GET, PATCH, DELETE | Required | Get/update/delete user by ID |

### Web Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/login/` | GET | Login page |
| `/signup/` | GET | Signup page |
| `/logout/` | POST | Logout endpoint |
| `/health/` | GET | Health check |

## Project Structure

```
auth-service/
├── authentication/             # Main application
│   ├── authentication.py       # DRF JWT authentication class
│   ├── middleware.py           # JWT middleware for templates
│   ├── permissions.py          # Custom permissions
│   ├── serializers.py          # DRF serializers
│   ├── services.py             # DatabaseService client
│   ├── utils.py                # JWT token utilities
│   ├── views.py                # API views
│   ├── template_views.py       # Web template views
│   ├── urls.py                 # API URL routing
│   └── health_urls.py          # Health check URLs
├── static/                     # Static assets
│   ├── css/                    # Stylesheets
│   └── js/                     # JavaScript files
├── staticfiles/                # Collected static files
├── templates/                  # HTML templates
│   ├── base.html               # Base template
│   ├── login.html              # Login page
│   └── signup.html             # Signup page
├── Dockerfile                  # Docker configuration
├── entrypoint.sh               # Docker entrypoint script
├── manage.py                   # Django management script
├── requirements.txt            # Python dependencies
├── package.json                # Node.js dependencies
├── tailwind.config.js          # Tailwind CSS configuration
├── settings.py                 # Django settings
├── urls.py                     # Root URL configuration
└── wsgi.py                     # WSGI entry point
```

## Key Components

### Views (`authentication/views.py`)
- User registration with automatic profile creation
- User login with JWT token generation
- Single and multi-device logout
- Token refresh and activity-based refresh
- Token verification
- Password change with validation
- User profile management
- User detail retrieval

### Serializers (`authentication/serializers.py`)
- User data serialization
- Registration validation and user creation
- Login credentials validation
- Token validation
- Password change validation
- Role data serialization

### Utilities (`authentication/utils.py`)
- JWT access token generation
- Refresh token creation and storage
- Token validation
- Token invalidation (single and bulk)

## Security Considerations

### Token Security
- Configurable token expiration times
- Tokens stored in HTTPOnly cookies (not accessible via JavaScript)
- Tokens invalidated on logout and password change
- Token blacklisting via database service
- Secure cookie flags in production (Secure, SameSite)

### Password Security
- Password hashing using Django's PBKDF2 algorithm
- Password validation (length, complexity, common passwords)
- Old password verification on password change
- No password storage in logs or responses

### Rate Limiting
- IP-based rate limiting on authentication endpoints
- Configurable rate limits
- Prevents brute force attacks

### CORS & CSRF
- Configurable CORS allowed origins
- CSRF protection enabled
- Trusted origins for cross-site requests
- Proper header validation

### Production Settings
- Force HTTPS in production
- Secure session cookies
- Secure CSRF cookies
- Clickjacking prevention
- XSS filter enabled

## Port

Default port: **8001**

## Health Check

The service provides a health check endpoint for monitoring and orchestration tools.

## API Documentation

Swagger/OpenAPI documentation is available via drf-yasg for interactive API exploration and testing.

## Error Handling

The service returns standard HTTP status codes with appropriate error messages for client debugging while avoiding exposure of sensitive system information.

## Logging

The service logs authentication events, errors, and security-related activities to console (stdout) for centralized log aggregation. Sensitive information is never logged.

## Best Practices

### Security
- Always use strong, unique SECRET_KEY and JWT_SECRET_KEY values in production
- Never commit secrets to version control
- Use environment variables for all sensitive configuration
- Enable HTTPS in production environments
- Regularly rotate JWT secret keys
- Monitor authentication logs for suspicious activity
- Keep dependencies up to date

### Performance
- Redis caching for session management
- Token validation without database queries
- Rate limiting to prevent abuse
- Stateless architecture for horizontal scaling

### Deployment
- Use Docker for consistent deployments
- Configure proper CORS and CSRF settings
- Set appropriate token lifetimes based on security requirements
- Use reverse proxy for SSL termination
- Implement proper monitoring and alerting

## License

Copyright (c) 2025 Healthcare Portal. All rights reserved.
