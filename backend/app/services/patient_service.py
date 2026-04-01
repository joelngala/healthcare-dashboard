from datetime import date, datetime

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate


def get_patients(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    status: str | None = None,
    sort_by: str = "last_visit",
    sort_order: str = "desc",
) -> tuple[list[Patient], int]:
    query = db.query(Patient)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Patient.first_name.ilike(term),
                Patient.last_name.ilike(term),
            )
        )

    if status:
        query = query.filter(Patient.status == status)

    total = query.count()

    sort_col = getattr(Patient, sort_by, Patient.last_visit)
    if sort_order == "desc":
        query = query.order_by(sort_col.desc().nullslast())
    else:
        query = query.order_by(sort_col.asc().nullsfirst())

    patients = query.offset((page - 1) * page_size).limit(page_size).all()
    return patients, total


def get_patient(db: Session, patient_id: int) -> Patient | None:
    return db.query(Patient).filter(Patient.id == patient_id).first()


def create_patient(db: Session, data: PatientCreate) -> Patient:
    patient = Patient(**data.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def update_patient(
    db: Session, patient_id: int, data: PatientUpdate
) -> Patient | None:
    patient = get_patient(db, patient_id)
    if not patient:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    patient.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(patient)
    return patient


def delete_patient(db: Session, patient_id: int) -> bool:
    patient = get_patient(db, patient_id)
    if not patient:
        return False
    db.delete(patient)
    db.commit()
    return True


def get_dashboard_stats(db: Session) -> dict:
    total = db.query(func.count(Patient.id)).scalar() or 0
    active = (
        db.query(func.count(Patient.id))
        .filter(Patient.status == "Active")
        .scalar()
        or 0
    )
    followup = (
        db.query(func.count(Patient.id))
        .filter(Patient.status == "Follow-up")
        .scalar()
        or 0
    )

    today = date.today()
    first_of_month = today.replace(day=1)
    seen_this_month = (
        db.query(func.count(Patient.id))
        .filter(Patient.last_visit >= first_of_month)
        .scalar()
        or 0
    )

    status_breakdown = (
        db.query(Patient.status, func.count(Patient.id))
        .group_by(Patient.status)
        .all()
    )

    recent = (
        db.query(Patient)
        .order_by(Patient.last_visit.desc().nullslast())
        .limit(5)
        .all()
    )

    return {
        "total_patients": total,
        "active_patients": active,
        "needs_followup": followup,
        "seen_this_month": seen_this_month,
        "status_breakdown": [
            {"status": s, "count": c} for s, c in status_breakdown
        ],
        "recent_patients": recent,
    }
