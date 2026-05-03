import voyageai
from config import settings

vo = voyageai.Client(api_key=settings.VOYAGE_API_KEY)  # type: ignore


def embed_chunks(chunks: list[str]) -> list[list[float]]:
    all_embeddings = []
    batch_size = 50

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        result = vo.embed(batch, model="voyage-finance-2", input_type="document")
        all_embeddings.extend(result.embeddings)

    return all_embeddings
