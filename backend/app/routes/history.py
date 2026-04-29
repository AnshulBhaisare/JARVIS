from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db, CommandHistory
from app.models.schemas import CommandHistoryItem

router = APIRouter()


@router.get("/", response_model=List[CommandHistoryItem])
async def get_history(limit: int = 50, db: Session = Depends(get_db)):
    return (
        db.query(CommandHistory)
        .order_by(CommandHistory.created_at.desc())
        .limit(limit)
        .all()
    )


@router.delete("/clear")
async def clear_history(db: Session = Depends(get_db)):
    db.query(CommandHistory).delete()
    db.commit()
    return {"message": "History cleared"}
