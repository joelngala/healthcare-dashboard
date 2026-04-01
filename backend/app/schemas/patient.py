from datetime import date, datetime

from pydantic import BaseModel


class PatientBase(BaseModel):
    first_name: str
    last_name: str
    dob: date
    email: str = ""
    phone: str = ""
    address: str = ""
    blood_type: str = ""
    allergies: str = ""
    conditions: str = ""
    status: str = "Active"
    last_visit: date | None = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    dob: date | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    blood_type: str | None = None
    allergies: str | None = None
    conditions: str | None = None
    status: str | None = None
    last_visit: date | None = None


class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedPatients(BaseModel):
    items: list[PatientResponse]
    page: int
    page_size: int
    total: int
    total_pages: int
