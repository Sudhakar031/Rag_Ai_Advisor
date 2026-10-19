import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from advisor.models import ChatRequest, ChatResponse
from advisor.rag import process_user_query
from advisor.data_loader import load_platforms

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

app = FastAPI(
    title="Hireko AI Product Advisor",
    description="Dedicated AI Product Advisor for recruitment, interviewing, assessment and AI hiring platforms",
    version="2.0.0",
)

# Enable CORS for flexible integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (Hireko logo, avatar, CSS, JS)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def serve_index():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Hireko AI Product Advisor API is running. Index file not found."}


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Hireko AI Product Advisor",
        "version": "2.0.0",
        "framework": "Python / FastAPI",
    }


@app.get("/api/platforms")
async def get_platforms():
    platforms = load_platforms()
    return {
        "count": len(platforms),
        "platforms": [
            {
                "id": p.get("id"),
                "name": p.get("name"),
                "category": p.get("category"),
                "bestFor": p.get("bestFor"),
                "pricingModel": p.get("pricingModel"),
                "websiteUrl": p.get("websiteUrl"),
            }
            for p in platforms
        ],
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    try:
        response = await process_user_query(
            query=request.query,
            history=request.history,
            user_name=request.userName,
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advisor processing error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
