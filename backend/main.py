from api.v1.router import router
from config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

is_prod = settings.ENVIRONMENT == "production"

app = FastAPI(
    docs_url=None if is_prod else "/docs",
    redoc_url=None if is_prod else "/redoc",
    openapi_url=None if is_prod else "/openapi.json",
)


app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/")
def root():
    is_prod = settings.ENVIRONMENT == "production"
    if is_prod:
        return {"status": "ok"}
    return {"status": "ok", "environment": "development"}
