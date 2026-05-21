from db.database import SessionLocal
from services.embedder import embed_chunks
from sqlalchemy import text


def retrieve_chunks(question: str, session_id: str, top_k: int = 8) -> list[str]:
    question_embedding = embed_chunks([question])[0]

    with SessionLocal() as db:
        result = db.execute(
            text("""
                SELECT content
                FROM document_chunks
                WHERE session_id = :session_id
                ORDER BY embedding <=> CAST(:embedding AS vector)
                LIMIT :top_k
            """),
            {
                "session_id": session_id,
                "embedding": str(question_embedding),
                "top_k": top_k,
            },
        )
        return [row[0] for row in result]
