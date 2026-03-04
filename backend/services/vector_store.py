import os
from typing import List, Dict
from pinecone import Pinecone
from langchain_community.embeddings import HuggingFaceEmbeddings
import uuid

# Initialize Pinecone
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY", "dummy_key"))
index_name = os.environ.get("PINECONE_INDEX_NAME", "rag-bots")

try:
    index = pc.Index(index_name)
except Exception:
    index = None

_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        from langchain_community.embeddings import HuggingFaceEmbeddings
        _embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return _embeddings

async def add_chunks_to_vector_db(chunks: List[Dict]):
    """Embed chunks and insert into Pinecone."""
    if not index:
        print("Vector store not configured properly.")
        return
        
    texts = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]
    
    # Generate vectors
    vectors = get_embeddings().embed_documents(texts)
    
    upsert_data = []
    for i, vector in enumerate(vectors):
        # Merge text into metadata
        meta = metadatas[i].copy()
        meta["text"] = texts[i]
        
        upsert_data.append({
            "id": str(uuid.uuid4()),
            "values": vector,
            "metadata": meta
        })
        
    # Upsert in batches of 100
    for i in range(0, len(upsert_data), 100):
        index.upsert(vectors=upsert_data[i:i+100])

async def search_vector_db(query: str, bot_id: int, top_k: int = 5) -> List[Dict]:
    """Search for relevant chunks."""
    if not index:
        return []
        
    query_vector = get_embeddings().embed_query(query)
    
    try:
        results = index.query(
            vector=query_vector,
            top_k=top_k,
            include_metadata=True,
            filter={
                "bot_id": {"$eq": str(bot_id)}
            }
        )
        return [match["metadata"] for match in results.get("matches", [])]
    except Exception as e:
        print(f"Error querying vector db: {e}")
        return []
