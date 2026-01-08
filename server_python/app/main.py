from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, reports, dashboard, puzzles, lottery, neet, teachers
from app.core.config import settings

app = FastAPI(title="SkillBuilder API", version="1.0.0")

# CORS
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # Next.js default (just in case)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(puzzles.router, prefix="/api/puzzles", tags=["Puzzles"])
app.include_router(lottery.router, prefix="/api/lottery", tags=["Lottery"])
app.include_router(neet.router, prefix="/api/neet", tags=["NEET"])
app.include_router(teachers.router, prefix="/api/teachers", tags=["Teachers"])

@app.get("/")
async def root():
    return {"message": "Welcome to SkillBuilder API (FastAPI)"}
