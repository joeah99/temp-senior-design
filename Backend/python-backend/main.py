from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import commodities
from dotenv import load_dotenv
import os

# Load .env values
load_dotenv()

app = FastAPI(title="Python Backend (Asset Manager Stage 2)")

db_url = os.getenv("POSTGRE_SQL_CONNECTIONSTRING")
DOTNET_API_BASE = os.getenv("DOTNET_API_BASE")

# Register routes
app.include_router(commodities.router, prefix="/api/commodities", tags=["Commodities"])

# Allow your React frontend to call this API
origins = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Python backend is running!"}
