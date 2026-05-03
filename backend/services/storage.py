from config import settings
from supabase import Client, create_client


def get_supabase_client() -> Client:
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY
    return create_client(url, key)


def delete_chunks_by_session(session_id: str) -> None:
    supabase = get_supabase_client()
    supabase.table("document_chunks").delete().eq("session_id", session_id).execute()


def cleanup_old_chunks() -> None:
    supabase = get_supabase_client()
    from datetime import datetime, timedelta, timezone

    cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    supabase.table("document_chunks").delete().lt("created_at", cutoff).execute()


def store_chunks(
    chunks: list[str],
    embeddings: list[list[float]] | list[list[int]],
    user_id: str,
    session_id: str,
    doc_id: str,
):

    supabase = get_supabase_client()

    rows = [
        {
            "user_id": user_id,
            "session_id": session_id,
            "doc_id": doc_id,
            "content": chunk,
            "embedding": embedding,
        }
        for chunk, embedding in zip(chunks, embeddings)
    ]
    result = supabase.table("document_chunks").insert(rows).execute()
    return len(result.data)


if __name__ == "__main__":
    from services.chunker import chunk_text
    from services.embedder import embed_chunks

    sample_text = "Apple revenue grew 12% in Q3. iPhone sales led the gains. Services also hit a record high."

    chunks = chunk_text(sample_text)
    embeddings = embed_chunks(chunks)
    count = store_chunks(
        chunks,
        embeddings,
        user_id="test_user",
        session_id="test_session_001",
        doc_id="apple_q3_report",
    )

    print(f"✅ Inserted {count} chunks")
