import os
from typing import List, Dict
from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

def process_file_or_url(source: str, source_type: str, bot_id: int) -> List[Dict]:
    """
    Load a document from a file path or URL and split it into chunks.
    source_type can be 'pdf' or 'url'.
    """
    if source_type == 'pdf':
        loader = PyPDFLoader(source)
    elif source_type == 'url':
        loader = WebBaseLoader(source)
    else:
        raise ValueError("Unsupported source type")

    docs = loader.load()
    
    # 500 word chunks ~ roughly 2500 characters
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=2500,
        chunk_overlap=250,
        length_function=len,
        is_separator_regex=False,
    )
    
    chunks = text_splitter.split_documents(docs)
    
    formatted_chunks = []
    for chunk in chunks:
        formatted_chunks.append({
            "text": chunk.page_content,
            "metadata": {
                "source_type": source_type,
                "source_url": source if source_type == 'url' else os.path.basename(source),
                "bot_id": str(bot_id)
            }
        })
        
    return formatted_chunks
