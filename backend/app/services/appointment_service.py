import secrets
import string
from typing import List
from datetime import date, timedelta
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

        # 날짜 범위 검증
        if request.end_date < request.start_date:
            raise ValueError("종료일은 시작일보다 이후여야 합니다")

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

        # 시작일부터 종료일까지 모든 날짜를 후보 날짜로 등록
        current_date = request.start_date
        while current_date <= request.end_date:
            appointment_date = AppointmentDates(
                appointment_id=appointment.id,
                candidate_date=current_date
            )
            db.add(appointment_date)
            current_date += timedelta(days=1)

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

    @staticmethod
    async def join_appointment(invite_code: str, user_id: int, db: AsyncSession) -> Participations:
        # 초대 코드로 약속 참여

        # 약속 조회
        appointment = await AppointmentService.get_appointment_by_invite_code(invite_code, db)
        if not appointment:
            raise ValueError("존재하지 않는 약속입니다")

        # 약속 상태 확인
        if appointment.status != 'VOTING':
            raise ValueError("참여할 수 없는 약속입니다")

        # 이미 참여했는지 확인
        existing = await AppointmentService._get_participation(
            user_id, appointment.id, db
        )
        if existing:
            raise ValueError("이미 참여한 약속입니다")

        # 최대 참여자 수 확인
        if appointment.max_participants:
            current_count = await AppointmentService._get_participation_count(
                appointment.id, db
            )
            if current_count >= appointment.max_participants:
                raise ValueError("참여 인원이 가득 찼습니다")

        # 참여자 추가
        participation = Participations(
            user_id=user_id,
            appointment_id=appointment.id,
            status='ATTENDING'
        )
        db.add(participation)
        await db.commit()
        await db.refresh(participation)

        return participation

    @staticmethod
    async def _get_participation(user_id: int, appointment_id: int, db: AsyncSession) -> Participations:
        # 특정 사용자의 참여 정보 조회
        result = await db.execute(
            select(Participations).where(
                Participations.user_id == user_id,
                Participations.appointment_id == appointment_id
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def _get_participation_count(appointment_id: int, db: AsyncSession) -> int:
        # 약속의 참여자 수 조회
        from sqlalchemy import func
        result = await db.execute(
            select(func.count(Participations.id)).where(
                Participations.appointment_id == appointment_id
            )
        )
        return result.scalar()