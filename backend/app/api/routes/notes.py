from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.note import Note
from app.models.patient import Patient
from app.schemas.note import NoteCreate, NoteResponse

router = APIRouter(prefix="/patients/{patient_id}/notes", tags=["notes"])


@router.get("", response_model=list[NoteResponse])
def list_notes(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return (
        db.query(Note)
        .filter(Note.patient_id == patient_id)
        .order_by(Note.timestamp.desc())
        .all()
    )


@router.post("", response_model=NoteResponse, status_code=201)
def create_note(
    patient_id: int, data: NoteCreate, db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    kwargs: dict = {"patient_id": patient_id, "content": data.content}
    if data.timestamp is not None:
        kwargs["timestamp"] = data.timestamp
    note = Note(**kwargs)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(
    patient_id: int, note_id: int, db: Session = Depends(get_db)
):
    note = (
        db.query(Note)
        .filter(Note.id == note_id, Note.patient_id == patient_id)
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
