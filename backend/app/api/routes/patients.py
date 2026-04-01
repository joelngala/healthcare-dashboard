import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PaginatedPatients,
)
from app.services import patient_service

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("", response_model=PaginatedPatients)
def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    status: str | None = None,
    sort_by: str = "last_visit",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
):
    patients, total = patient_service.get_patients(
        db, page, page_size, search, status, sort_by, sort_order
    )
    return PaginatedPatients(
        items=patients,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=math.ceil(total / page_size) if total else 0,
    )


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = patient_service.get_patient(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.post("", response_model=PatientResponse, status_code=201)
def create_patient(data: PatientCreate, db: Session = Depends(get_db)):
    return patient_service.create_patient(db, data)


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int, data: PatientUpdate, db: Session = Depends(get_db)
):
    patient = patient_service.update_patient(db, patient_id, data)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.delete("/{patient_id}", status_code=204)
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    if not patient_service.delete_patient(db, patient_id):
        raise HTTPException(status_code=404, detail="Patient not found")
