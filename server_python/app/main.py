from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.features.auth.router import router as auth_router
from app.features.users.router import router as users_router
from app.features.reports.router import router as reports_router
from app.features.dashboard.router import router as dashboard_router
from app.features.puzzles.router import router as puzzles_router
from app.features.lottery.router import router as lottery_router
from app.features.neet.router import router as neet_router
from app.features.teachers.router import router as teachers_router
from app.features.skill_practice.router import router as skill_practice_router

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
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(reports_router, prefix="/api/reports", tags=["Reports"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(puzzles_router, prefix="/api/puzzles", tags=["Puzzles"])
app.include_router(lottery_router, prefix="/api/lottery", tags=["Lottery"])
app.include_router(neet_router, prefix="/api/neet", tags=["NEET"])
app.include_router(teachers_router, prefix="/api/teachers", tags=["Teachers"])
app.include_router(skill_practice_router, prefix="/api/skill-practice", tags=["Skill Practice"])

@app.get("/")
async def root():
    return {"message": "Welcome to SkillBuilder API (FastAPI)"}
