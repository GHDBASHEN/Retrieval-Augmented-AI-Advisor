from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import users, bots, conversations

load_dotenv()

app = FastAPI(
    title="RAG-as-a-Service API",
    description="Backend for the custom chatbot platform",
    version="1.0.0"
)

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(bots.router)
app.include_router(conversations.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the RAG-as-a-Service API"}
