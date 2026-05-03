# services/retriever.py
from services.embedder import embed_chunks
from services.storage import get_supabase_client


def retrieve_chunks(question: str, session_id: str, top_k: int = 8) -> list[str]:
    # Step 1 — embed the question
    question_embedding = embed_chunks([question])[0]

    # Step 2 — search for similar chunks in the database
    supabase = get_supabase_client()

    result = supabase.rpc(
        "match_chunks",
        {
            "query_embedding": question_embedding,
            "match_session_id": session_id,
            "match_count": top_k,
        },
    ).execute()

    # Step 3 — return just the text content
    return [row["content"] for row in result.data]  # type: ignore


if __name__ == "__main__":
    question = "What was Apple's revenue in Q3?"
    chunks = retrieve_chunks(question, session_id="test_session_001")

    print(f"Found {len(chunks)} chunks:\n")
    for i, chunk in enumerate(chunks):
        print(f"[{i + 1}] {chunk}\n")
