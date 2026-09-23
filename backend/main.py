from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import storyboard

app = FastAPI(
    title="PoseBooth AI Backend Service API",
    description="REST API cho hệ thống buồng chụp ảnh thông minh PoseBooth AI (Môn EXE101). Hỗ trợ sinh Storyboard video ngắn & tư thế.",
    version="1.0.0"
)

# Enable CORS for React Frontend (Vite port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(storyboard.router)

@app.get("/")
def root():
    return {
        "app": "PoseBooth AI API Service",
        "status": "online",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
