from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_text(text: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=200,
    )
    return splitter.split_text(text)
