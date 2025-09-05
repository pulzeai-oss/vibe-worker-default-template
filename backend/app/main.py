import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy import text
from passlib.context import CryptContext

from app.api.api_router import api_router, auth_router
from app.core.config import get_settings
from app.core.database_session import get_session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def create_default_admin():
    """Create default admin user if CREATE_DEFAULT_ADMIN is True and user doesn't exist"""
    settings = get_settings()
    
    if not settings.create_default_admin:
        return
    
    # Get a database session using the generator
    session_gen = get_session()
    session = next(session_gen)
    
    try:
        # Check if admin user already exists
        result = session.execute(
            text("SELECT COUNT(*) FROM user_account WHERE email = :email"),
            {"email": settings.admin.email}
        )
        user_exists = result.scalar() > 0
        
        if not user_exists:
            # Create admin user
            password_hash = pwd_context.hash(settings.admin.password)
            user_id = str(uuid.uuid4())
            
            session.execute(
                text("""
                    INSERT INTO user_account (user_id, email, hashed_password, is_admin, role, create_time, update_time)
                    VALUES (:user_id, :email, :password_hash, true, 'ADMIN', now(), now())
                """),
                {
                    "user_id": user_id,
                    "email": settings.admin.email,
                    "password_hash": password_hash
                }
            )
            session.commit()
            print(f"✅ Created default admin user: {settings.admin.email}")
    finally:
        # Close the session
        session.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await create_default_admin()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="FastAPI Backend",
    version="1.0.0",
    description="A modern FastAPI backend with SQLAlchemy and PostgreSQL",
    openapi_url="/openapi.json",
    docs_url="/docs",
    lifespan=lifespan,
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api/v1")

# Sets all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        str(origin).rstrip("/")
        for origin in get_settings().security.backend_cors_origins
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Guards against HTTP Host Header attacks
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=get_settings().security.allowed_hosts,
)

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Backend"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
