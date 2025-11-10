import secrets
import string
from typing import List
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.appointment_model import Appointments, AppointmentDates, Participations
from app.schema.appointment_schema import AppointmentCreateRequest


class AppointmentService:
    @staticmethod
    def generate_invite_code(length: int = 8) -> str:
        # 랜덤 초대 코드 생성
        characters = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))

    @staticmethod
    async def create_appointment(
        request: AppointmentCreateRequest,
        creator_id: str,
        db: AsyncSession
    ) -> Appointments:
        # 약속 생성 및 후보 날짜 등록

        # 고유한 초대 코드 생성
        invite_code = AppointmentService.generate_invite_code()

        # 초대 코드 중복 체크
        while await AppointmentService._is_invite_code_exists(invite_code, db):
            invite_code = AppointmentService.generate_invite_code()

        # 약속 생성
        appointment = Appointments(
            name=request.name,
            creator_id=creator_id,
            max_participants=request.max_participants,
            status='VOTING',
            invite_link=invite_code
        )

        db.add(appointment)
        await db.flush()  

        # 후보 날짜들 등록
        for candidate_date in request.candidate_dates:
            appointment_date = AppointmentDates(
                appointment_id=appointment.id,
                candidate_date=candidate_date
            )
            db.add(appointment_date)

        # 생성자 참여자목록에 반영
        creator_participation = Participations(
            user_id=creator_id,
            appointment_id=appointment.id,
            status='ATTENDING'
        )
        db.add(creator_participation)

        await db.commit()
        await db.refresh(appointment)

        return appointment

    @staticmethod
    async def _is_invite_code_exists(invite_code: str, db: AsyncSession) -> bool:
        # 초대 코드 중복 확인
        result = await db.execute(
            select(Appointments).where(Appointments.invite_link == invite_code)
        )
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def get_appointment_by_invite_code(invite_code: str, db: AsyncSession) -> Appointments:
        # 초대 코드로 약속 조회
        result = await db.execute(
            select(Appointments).where(Appointments.invite_link == invite_code)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_appointment_dates(appointment_id: int, db: AsyncSession) -> List[AppointmentDates]:
        # 약속의 모든 후보 날짜 조회
        result = await db.execute(
            select(AppointmentDates).where(AppointmentDates.appointment_id == appointment_id)
        )
        return result.scalars().all()