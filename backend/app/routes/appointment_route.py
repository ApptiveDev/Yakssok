from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.appointment_service import AppointmentService
from app.schema.appointment_schema import AppointmentCreateRequest, AppointmentResponse
from app.utils.jwt import get_current_user

security = HTTPBearer()

router = APIRouter(
    prefix="/appointments",
)


@router.post("/", response_model=AppointmentResponse)
async def create_appointment(
    request: AppointmentCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # 약속 생성
    try:
        appointment = await AppointmentService.create_appointment(
            request=request,
            creator_id=current_user["sub"],
            db=db
        )

        appointment_dates = await AppointmentService.get_appointment_dates(
            appointment.id, db
        )

        return AppointmentResponse(
            id=appointment.id,
            name=appointment.name,
            creator_id=appointment.creator_id,
            max_participants=appointment.max_participants,
            status=appointment.status,
            invite_link=appointment.invite_link,
            candidate_dates=[ad.candidate_date for ad in appointment_dates]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"약속 생성 실패: {str(e)}")


@router.get("/{invite_code}", response_model=AppointmentResponse)
async def get_appointment_by_invite_code(
    invite_code: str,
    db: AsyncSession = Depends(get_db)
):
    # 초대 코드로 약속 조회
    appointment = await AppointmentService.get_appointment_by_invite_code(invite_code, db)

    if not appointment:
        raise HTTPException(status_code=404, detail="존재하지 않는 약속입니다")

    appointment_dates = await AppointmentService.get_appointment_dates(
        appointment.id, db
    )

    return AppointmentResponse(
        id=appointment.id,
        name=appointment.name,
        creator_id=appointment.creator_id,
        max_participants=appointment.max_participants,
        status=appointment.status,
        invite_link=appointment.invite_link,
        candidate_dates=[ad.candidate_date for ad in appointment_dates]
    )