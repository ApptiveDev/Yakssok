from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class AppointmentCreateRequest(BaseModel):
    name: str
    candidate_dates: List[date]
    max_participants: Optional[int] = None


class AppointmentResponse(BaseModel):
    id: int
    name: str
    creator_id: int
    max_participants: Optional[int]
    status: str
    invite_link: str
    candidate_dates: List[date]

    class Config:
        from_attributes = True


class AppointmentDateResponse(BaseModel):
    id: int
    appointment_id: int
    candidate_date: date

    class Config:
        from_attributes = True