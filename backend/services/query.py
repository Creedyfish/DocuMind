# services/query.py
from typing import cast

import anthropic
from anthropic.types import MessageParam, TextBlock
from config import settings
from fastapi import HTTPException
from services.retriever import retrieve_chunks

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def build_context(chunks: list[str]) -> str:
    """Format retrieved chunks into a readable context block."""
    formatted = []
    for i, chunk in enumerate(chunks):
        formatted.append(f"[Chunk {i + 1}]\n{chunk}")
    return "\n\n".join(formatted)


def ask(question: str, session_id: str, history: list[dict]) -> str:
    if len(question) > 1000:
        raise HTTPException(status_code=400, detail="Question too long")
    # Step 1 — retrieve relevant chunks
    chunks = retrieve_chunks(question, session_id)

    # Step 2 — build the context string from those chunks
    context = build_context(chunks)

    # Step 3 — build the system prompt
    system_prompt = f"""You are a financial document assistant. 
Answer the user's question using ONLY the document context provided below.
If the answer is not in the context, say "I couldn't find that in the document."
Do not hallucinate or use outside knowledge.

--- DOCUMENT CONTEXT ---
{context}
--- END CONTEXT ---"""

    # Step 4 — build the messages array (history + new question)
    messages: list[MessageParam] = cast(
        list[MessageParam], history + [{"role": "user", "content": question}]
    )

    # Step 5 — call Claude Haiku
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    )

    # Extract text from the first TextBlock in the response
    for block in response.content:
        if isinstance(block, TextBlock):
            return block.text

    return ""


if __name__ == "__main__":
    answer = ask(
        question="What is the total portfolio value?",
        session_id="test_session_001",
        history=[],
    )
    print(answer)
