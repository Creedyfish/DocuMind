from datetime import datetime, timedelta, timezone

from db.database import SessionLocal
from models.document_chunk import DocumentChunk


def delete_chunks_by_session(session_id: str) -> None:
    with SessionLocal() as db:
        db.query(DocumentChunk).filter(DocumentChunk.session_id == session_id).delete()
        db.commit()


def cleanup_old_chunks() -> None:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    with SessionLocal() as db:
        db.query(DocumentChunk).filter(DocumentChunk.created_at < cutoff).delete()
        db.commit()


def store_chunks(
    chunks: list[str],
    embeddings: list[list[float]] | list[list[int]],
    user_id: str,
    session_id: str,
    doc_id: str,
) -> int:
    rows = [
        DocumentChunk(
            user_id=user_id,
            session_id=session_id,
            doc_id=doc_id,
            content=chunk,
            embedding=embedding,
        )
        for chunk, embedding in zip(chunks, embeddings)
    ]
    with SessionLocal() as db:
        db.add_all(rows)
        db.commit()
    return len(rows)
