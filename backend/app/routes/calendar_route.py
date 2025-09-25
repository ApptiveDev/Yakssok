from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.google_calendar_service import GoogleCalendarService
from app.services.user_service import UserService
from app.utils.jwt import verify_token

security = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/calendar")


@router.get("/events")
async def list_events(
    time_min: str | None = None,
    time_max: str | None = None,
    max_results: int = 50,
    page_token: str | None = None,
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
):
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="인증 토큰이 필요합니다.")

    payload = verify_token(credentials.credentials)
    user_id = payload.get("sub") if payload else None
    if not user_id:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

    user = await UserService.get_user_by_google_id(user_id, db)
    if not user or not getattr(user, "google_refresh_token", None):
        return JSONResponse(
            status_code=400,
            content={
                "code": "calendar_scope_missing",
                "reauthUrl": "/user/google/login?force=1",
            },
        )

    try:
        access_token = GoogleCalendarService.refresh_access_token(
            user.google_refresh_token
        )
    except HTTPException as exc:
        if exc.status_code == 401:
            return JSONResponse(
                status_code=401,
                content={
                    "code": "calendar_refresh_failed",
                    "reauthUrl": "/user/google/login?force=1",
                },
            )
        raise

    events_payload = GoogleCalendarService.list_primary_events(
        access_token,
        time_min=time_min,
        time_max=time_max,
        max_results=max_results,
        page_token=page_token,
    )
    return events_payload
