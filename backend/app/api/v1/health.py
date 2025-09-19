from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
def health():
    return {"status": "ok"}