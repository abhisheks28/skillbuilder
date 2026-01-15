from fastapi import APIRouter
from .Grade1.router import router as grade1_router
from .Grade2.router import router as grade2_router
from .Grade3.router import router as grade3_router

router = APIRouter()

# Include sub-routers with appropriate prefixes
router.include_router(grade1_router, prefix="/grade1", tags=["Grade 1"])
router.include_router(grade2_router, prefix="/grade2", tags=["Grade 2"])
router.include_router(grade3_router, prefix="/grade3", tags=["Grade 3"])
