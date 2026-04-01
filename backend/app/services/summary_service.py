from datetime import date

from app.models.patient import Patient
from app.models.note import Note


def generate_patient_summary(patient: Patient, notes: list[Note]) -> str:
    age = _calculate_age(patient.dob)
    recent_notes = " ".join([n.content for n in notes[:3]])

    conditions_text = patient.conditions or "none listed"
    allergies_text = patient.allergies or "none listed"
    notes_text = recent_notes or "No recent notes available."

    last_visit_text = ""
    if patient.last_visit:
        last_visit_text = (
            f" Last seen on {patient.last_visit.strftime('%B %d, %Y')}."
        )

    return (
        f"{patient.first_name} {patient.last_name} is a {age}-year-old "
        f"patient with blood type {patient.blood_type or 'unknown'}. "
        f"Known conditions include {conditions_text}. "
        f"Allergies include {allergies_text}. "
        f"Recent clinical notes indicate: {notes_text}"
        f"{last_visit_text}"
    )


def _calculate_age(dob: date) -> int:
    today = date.today()
    age = today.year - dob.year
    if (today.month, today.day) < (dob.month, dob.day):
        age -= 1
    return age
