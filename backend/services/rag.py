from .vector_store import search_vector_db
from .groq_client import generate_response

async def process_rag_query(query: str, bot_id: int) -> str:
    """Execute the full RAG pipeline for a given query."""
    
    # 1. Similarity Search
    relevant_chunks = await search_vector_db(query, bot_id)
    
    # 2. Extract Context and Metadata
    context_text = ""
    sources = set()
    
    for idx, chunk in enumerate(relevant_chunks):
        text = chunk.get("text", "")
        url = chunk.get("source_url", "Unknown source")
        
        context_text += f"\n--- Chunk {idx + 1} ---\n{text}\n"
        sources.add(url)
        
    if not context_text:
        return "I don't have enough context to answer this question. Please upload more documents."
        
    # 3. Prompt Assembly
    prompt = f"Context:\n{context_text}\n\nQuestion: {query}"
    
    # 4. Generation via Groq
    answer = generate_response(prompt)
    
    # 5. Intercept and Append Sources citation
    if sources:
        citations = "\n\n**Sources:**\n" + "\n".join([f"- {src}" for src in sources])
        answer += citations
        
    return answer
