from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from services.limiter import limiter
from services.query import ask

router = APIRouter()


class ChatRequest(BaseModel):
    session_id: str
    question: str
    history: list[dict] = []


class ChatResponse(BaseModel):
    answer: str


@router.post("", response_model=ChatResponse)
@limiter.limit("5/day")
async def chat(request: Request, body: ChatRequest):
    try:
        answer = ask(
            question=body.question,
            session_id=body.session_id,
            history=body.history,
        )
        return ChatResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
