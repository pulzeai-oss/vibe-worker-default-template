# Docker Setup Guide

This guide explains how to run the FastAPI + Next.js full-stack application using Docker.

## Quick Start

### Development Environment

1. **Start all services:**
   ```bash
   ./scripts/docker-start.sh
   ```

2. **Or manually with Docker Compose:**
   ```bash
   docker-compose -f vibe.yaml up --build
   ```

3. **Access your application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:9000
   - API Docs: http://localhost:9000/docs
   - Database: localhost:5433

### Production Environment

1. **Set up environment variables:**
   ```bash
   cp env.production .env
   # Edit .env with your production values
   ```

2. **Start production services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

## Docker Services

### 1. PostgreSQL Database
- **Image:** postgres:15
- **Port:** 5433
- **Volume:** Persistent data storage
- **Health Check:** Automatic database readiness check

### 2. FastAPI Backend
- **Port:** 9000
- **Features:**
  - Automatic database migrations
  - Hot reload in development
  - JWT authentication
  - CORS configuration
- **Dependencies:** Waits for database to be healthy

### 3. Next.js Frontend
- **Port:** 3000
- **Features:**
  - Development mode with hot reload
  - Production build optimization
  - API integration
- **Dependencies:** Waits for backend to be ready

## Docker Compose Files

### `vibe.yaml`
- Development configuration
- Volume mounts for live code editing
- Hot reload enabled
- Debug-friendly settings

### `docker-compose.prod.yml`
- Production configuration
- Optimized builds
- Security hardening
- Environment variable support

### `docker-compose.db.yml`
- Database-only setup
- Useful for development without full stack

## Environment Variables

### Development
- Uses default values from `vibe.yaml`
- Database: postgres/postgres123
- JWT Secret: Default development key

### Production
- Set via `.env` file or environment
- Secure database credentials
- Custom JWT secret
- Domain-specific CORS and hosts

## Useful Commands

### Start Services
```bash
# Development
docker-compose -f vibe.yaml up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# Database only
docker-compose -f docker-compose.db.yml up -d
```

### Stop Services
```bash
# Stop and remove containers
docker-compose -f docker-compose.dev.yml down

# Stop and remove containers + volumes
docker-compose -f docker-compose.dev.yml down -v
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Rebuild Services
```bash
# Rebuild and restart
docker-compose -f vibe.yaml up --build -d

# Rebuild specific service
docker-compose -f vibe.yaml build backend
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Check if ports 3000, 8000, or 5433 are already in use
   - Stop conflicting services or change ports in docker-compose files

2. **Database connection issues:**
   - Ensure PostgreSQL container is healthy
   - Check database credentials in environment variables

3. **Build failures:**
   - Clear Docker cache: `docker system prune -a`
   - Check Dockerfile syntax and dependencies

4. **Permission issues:**
   - Ensure Docker has proper permissions
   - Check file ownership in mounted volumes

### Health Checks

All services include health checks:
- **Database:** `pg_isready` command
- **Backend:** HTTP health endpoint `/health`
- **Frontend:** HTTP response check

### Monitoring

Monitor service status:
```bash
# Service status
docker-compose -f vibe.yaml ps

# Resource usage
docker stats

# Container logs
docker-compose -f vibe.yaml logs -f
```

## Security Considerations

### Development
- Default passwords (change for production)
- CORS allows localhost
- Debug mode enabled

### Production
- Strong passwords required
- JWT secret must be changed
- CORS restricted to specific domains
- No debug mode
- Security hardening enabled

## Scaling

### Horizontal Scaling
```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale frontend services
docker-compose -f docker-compose.prod.yml up -d --scale frontend=2
```

### Load Balancing
- Use nginx or HAProxy for load balancing
- Configure health checks for backend services
- Implement sticky sessions if needed

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker exec fastapi_postgres pg_dump -U postgres fastapi_nextjs > backup.sql

# Restore backup
docker exec -i fastapi_postgres psql -U postgres fastapi_nextjs < backup.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v fastapi_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v fastapi_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```
