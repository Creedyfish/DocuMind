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
— never the original document. This app is intended for demo
purposes. Do not upload documents containing real personal data.

## Tech Stack

| Layer         | Tool                                |
| ------------- | ----------------------------------- |
| Frontend      | React + TypeScript + TanStack Query |
| Backend       | FastAPI + Python                    |
| Database      | Neon PostgreSQL + pgvector          |
| Embeddings    | Voyage AI                           |
| AI Generation | Claude Haiku                        |
| Hosting       | Vercel + Railway                    |

## Architecture

## How to run it locally

## How the RAG pipeline works

## Evals

## What I learned
