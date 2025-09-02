# FastAPI + Next.js Full-Stack Template

A modern, production-ready full-stack application template with FastAPI backend and Next.js frontend, all containerized with Docker.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Start the Application
```bash
# Clone the repository
git clone <your-repo-url>
cd full-stack-fastapi-template

# Start all services
./scripts/docker-start.sh
```

### Access Your Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:9000
- **API Documentation**: http://localhost:9000/docs
- **Database**: PostgreSQL on port 5433

## 🏗️ Architecture

- **Backend**: FastAPI with SQLAlchemy, PostgreSQL, JWT authentication
- **Frontend**: Next.js with Tailwind CSS and Radix UI components
- **Database**: PostgreSQL with Alembic migrations
- **Containerization**: Docker Compose for easy development and deployment

## 📁 Project Structure

```
├── backend/                 # FastAPI backend application
│   ├── app/                # Application code
│   ├── alembic/            # Database migrations
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js frontend application
│   ├── src/                # Source code
│   └── package.json        # Node.js dependencies
├── scripts/                 # Utility scripts
├── vibe.yaml   # Development environment
├── docker-compose.db.yml    # Database service
└── DOCKER.md               # Docker documentation
```

## 🛠️ Development

### Start Development Environment
```bash
docker-compose -f vibe.yaml up -d
```

### Stop Services
```bash
docker-compose -f vibe.yaml down
```

### View Logs
```bash
docker-compose -f vibe.yaml logs -f
```

## 📚 Documentation

- [Docker Setup](DOCKER.md) - Detailed Docker configuration and usage
- [Security](SECURITY.md) - Security considerations and best practices

## 🔧 Configuration

The application uses environment variables for configuration. Key settings:

- Database connection details
- JWT secret keys
- CORS origins
- API endpoints

## 📝 License

This project is licensed under the Apache-2.0 license.
