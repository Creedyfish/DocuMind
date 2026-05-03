import uuid
from io import BytesIO

from fastapi import APIRouter, HTTPException, Request, UploadFile
from pypdf import PdfReader
from services.chunker import chunk_text
from services.embedder import embed_chunks
from services.limiter import limiter
from services.storage import cleanup_old_chunks, delete_chunks_by_session, store_chunks

router = APIRouter()


@router.post("/upload")
@limiter.limit("10/hour")
async def upload_pdf(request: Request, file: UploadFile, session_id: str):
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

    cleanup_old_chunks()

    # Check 1 — what the browser claims
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Invalid file. Please upload a valid PDF under 10MB.",
        )

    # Step 1 — read file
    file_bytes: bytes = await file.read()

    # Check 2 — what the file actually is (magic bytes)
    if not file_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file. Please upload a valid PDF under 10MB.",
        )

    # Check 3 — file size
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Invalid file. Please upload a valid PDF under 10MB.",
        )

    # Step 2 — extract text
    pdf = PdfReader(BytesIO(file_bytes))

    text = ""
    for page in pdf.pages:
        text += page.extract_text()

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Invalid file. Please upload a valid PDF under 10MB.",
        )

    # Step 3 — chunk and embed
    chunks = chunk_text(text)
    embeddings = embed_chunks(chunks)

    # Step 4 — delete old chunks and store new ones
    doc_id = str(uuid.uuid4())

    delete_chunks_by_session(session_id)
    store_chunks(
        chunks, embeddings, user_id="anonymous", session_id=session_id, doc_id=doc_id
    )

    return {
        "message": "PDF uploaded successfully",
        "chunk_count": len(chunks),
        "doc_id": doc_id,
    }
