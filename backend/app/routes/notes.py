from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.models.database import get_db, Note
from app.models.schemas import NoteCreate, NoteItem

router = APIRouter()


@router.post("/", response_model=NoteItem)
async def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    db_note = Note(
        title=note.title,
        content=note.content or "",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.get("/", response_model=List[NoteItem])
async def list_notes(db: Session = Depends(get_db)):
    return db.query(Note).order_by(Note.created_at.desc()).all()


@router.delete("/{note_id}")
async def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"message": "Note deleted"}
