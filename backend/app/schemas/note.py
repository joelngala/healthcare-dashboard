from datetime import datetime

from pydantic import BaseModel


class NoteCreate(BaseModel):
    content: str
    timestamp: datetime | None = None


class NoteResponse(BaseModel):
    id: int
    patient_id: int
    content: str
    timestamp: datetime
    created_at: datetime

    model_config = {"from_attributes": True}
