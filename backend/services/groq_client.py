import os
from groq import Groq

# Initialize Groq client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY", "dummy_key"),
)

def generate_response(prompt: str) -> str:
    """Send the constructed prompt to Groq API and get the response."""
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Answer the user's question using ONLY the context provided below. Always cite the Source URL at the end of your answer."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            max_tokens=1024,
            top_p=1,
            stream=False,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return "Sorry, I am unable to process your request at the moment due to an AI generation error."
