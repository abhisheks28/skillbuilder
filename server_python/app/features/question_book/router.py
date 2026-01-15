from fastapi import APIRouter
from .Grade1.router import router as grade1_router
from .Grade2.router import router as grade2_router
from .Grade5.router import router as grade5_router

router = APIRouter()

# Include sub-routers with appropriate prefixes
router.include_router(grade1_router, prefix="/grade1", tags=["Grade 1"])
router.include_router(grade2_router, prefix="/grade2", tags=["Grade 2"])
router.include_router(grade5_router, prefix="/grade5", tags=["Grade 5"])
