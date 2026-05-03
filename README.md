# DocuMind

> Ask questions about your financial documents in plain English
> and get accurate, grounded answers instantly.

## What It Does

DocuMind lets users upload financial documents like brokerage
statements and investor reports, then ask natural language questions
about them. Instead of manually scanning pages for numbers, users
just ask — and get precise answers pulled directly from their document.

## The Problem It Solves

Financial documents are long, dense, and hard to navigate. Finding
a specific figure across 50 pages wastes time. DocuMind solves this
by using RAG — retrieving only the relevant sections of a document
before generating an answer — so responses are fast, accurate, and
grounded in the actual document content, not AI guesswork.

## Security

Uploaded PDFs are deleted immediately after text extraction.
DocuMind stores only anonymized text chunks and vector embeddings
— never the original document. Input is validated via magic byte
checking and XML-delimited prompt injection mitigation. Rate limiting
is enforced at 5 chats/day and 3 uploads/day per device.

This app is intended for demo purposes. Do not upload documents
containing real personal data.

## Tech Stack

| Layer         | Tool                                |
| ------------- | ----------------------------------- |
| Frontend      | React + TypeScript + TanStack Query |
| Backend       | FastAPI + Python                    |
| Database      | Supabase PostgreSQL + pgvector      |
| Embeddings    | Voyage AI (voyage-finance-2)        |
| AI Generation | Claude Haiku                        |
| Hosting       | Vercel + Railway                    |

## Architecture

```
Upload Flow:
PDF Upload → Magic Byte Validation → Text Extraction → Chunking
(500 words, sliding window overlap) → Voyage AI Embedding →
Delete PDF → Store chunks + vectors in pgvector (Neon)

Query Flow:
User Question → Embed Question (Voyage AI) → Cosine Similarity
Search (<=> operator, top 8 chunks) → Build Prompt (XML delimiters
+ retrieved context + sliding window chat history) →
Claude Haiku → Streamed Answer
```

## How to Run Locally

```bash
# Backend
cd backend
cp .env.example .env        # fill in ANTHROPIC_API_KEY, VOYAGE_API_KEY,
                            # DATABASE_URL, ALLOWED_ORIGINS
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
cp .env.example .env        # set VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

## How the RAG Pipeline Works

1. **Chunking** — the uploaded PDF is split into 500-word chunks
   with overlap so no context is lost at boundaries.
2. **Embedding** — each chunk is converted to a vector using
   `voyage-finance-2`, a domain-specific model tuned for financial
   language.
3. **Storage** — chunks and their vectors are stored in Neon
   PostgreSQL via the pgvector extension, scoped to a session ID.
4. **Retrieval** — at query time, the question is embedded and the
   top 8 most semantically similar chunks are retrieved using
   cosine distance.
5. **Generation** — retrieved chunks are injected into the system
   prompt alongside a sliding window of recent chat history.
   Claude Haiku generates an answer grounded in that context.

## Evals

An automated eval suite runs 15 question/answer pairs sourced from
the Berkshire Hathaway 2025 shareholder letter against the full
pipeline. Each answer is scored by Claude Haiku on a 0–1 scale.

```bash
cd backend
python run_evals.py
```

Current score: **12/15 passing** (after top_k 5→8 fix).

Evals make prompt changes measurable — any tweak to chunking,
retrieval depth, or system prompt can be benchmarked against a
consistent baseline.

## What I Learned

- **RAG over fine-tuning** — for document Q&A, retrieving grounded
  context beats training a model on the data. Cheaper, faster, and
  auditable.
- **Domain-specific embeddings matter** — switching to
  `voyage-finance-2` improved retrieval quality on financial
  terminology compared to a general-purpose model.
- **top_k is a tunable lever** — increasing retrieved chunks from
  5 to 8 pushed eval scores from 9/15 to 12/15. Evals made this
  measurable instead of guesswork.
- **Security in AI apps has a new layer** — beyond standard input
  validation, prompt injection is a real attack surface. XML
  delimiters and explicit system prompt instructions mitigate it.
- **Rate limiting at the edge** — using `X-Forwarded-For` behind
  Railway's proxy with `--proxy-headers` gives accurate
  fingerprinting without trusting the client.
