from fastapi import APIRouter

from api.v1.endpoints import pdf, session

router = APIRouter()

router.include_router(pdf.router, prefix="/pdf", tags=["pdf"])
router.include_router(session.router, prefix="/chat", tags=["chat"])
