from fastapi import APIRouter
from .Grade1.router import router as grade1_router
from .Grade2.router import router as grade2_router
from .Grade3.router import router as grade3_router
from .Grade4.router import router as grade4_router
from .Grade5.router import router as grade5_router

router = APIRouter()

# Include sub-routers with appropriate prefixes
router.include_router(grade1_router, prefix="/grade1", tags=["Grade 1"])
router.include_router(grade2_router, prefix="/grade2", tags=["Grade 2"])
router.include_router(grade3_router, prefix="/grade3", tags=["Grade 3"])
router.include_router(grade4_router, prefix="/grade4", tags=["Grade 4"])
router.include_router(grade5_router, prefix="/grade5", tags=["Grade 5"])
