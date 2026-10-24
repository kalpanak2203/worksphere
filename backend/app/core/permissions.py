
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.organization import OrganizationMember


def require_member(
    db: Session,
    organization_id: int,
    user_id: int,
    allowed_roles: tuple[str, ...] | None = None,
):
    member = db.scalar(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == user_id,
        )
    )

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found"
        )

    if allowed_roles and member.role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions"
        )

    return member
