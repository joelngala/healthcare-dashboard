from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.note import Note
from app.models.patient import Patient
from app.schemas.summary import SummaryResponse
from app.services.summary_service import generate_patient_summary

router = APIRouter(tags=["summary"])


@router.get(
    "/patients/{patient_id}/summary", response_model=SummaryResponse
)
def get_patient_summary(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    notes = (
        db.query(Note)
        .filter(Note.patient_id == patient_id)
        .order_by(Note.timestamp.desc())
        .all()
    )

    summary = generate_patient_summary(patient, notes)
    return SummaryResponse(summary=summary)
