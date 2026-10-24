
import re
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.organization import (
    Organization, OrganizationMember
)
from app.schemas.workspace import (
    OrganizationCreate, OrganizationOut
)
from app.api.v1.endpoints.auth import get_current_user
from app.core.permissions import require_member


router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"]
)


@router.post("/", response_model=OrganizationOut, status_code=201)
def create_organization(
    data: OrganizationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    name = data.name.strip()

    if len(name) < 2:
        raise HTTPException(422, "Name is too short")

    slug_base = re.sub(
        r"[^a-z0-9]+", "-",
        name.lower()
    ).strip("-")[:150] or "workspace"

    slug = f"{slug_base}-{secrets.token_hex(4)}"

    org = Organization(
        name=name,
        slug=slug,
        owner_id=user.id
    )

    try:
        db.add(org)
        db.flush()

        member = OrganizationMember(
            organization_id=org.id,
            user_id=user.id,
            role="owner"
        )

        db.add(member)
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(org)
    return org


@router.get("/", response_model=list[OrganizationOut])
def list_organizations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    statement = (
        select(Organization)
        .join(
            OrganizationMember,
            OrganizationMember.organization_id == Organization.id
        )
        .where(OrganizationMember.user_id == user.id)
        .order_by(Organization.id.desc())
    )

    return db.scalars(statement).all()


@router.get("/{organization_id}", response_model=OrganizationOut)
def get_organization(
    organization_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    require_member(db, organization_id, user.id)

    org = db.get(Organization, organization_id)

    if org is None:
        raise HTTPException(404, "Workspace not found")

    return org
