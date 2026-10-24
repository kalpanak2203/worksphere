
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.schemas.workspace import ProjectCreate, ProjectOut
from app.core.permissions import require_member
from app.api.v1.endpoints.auth import get_current_user


router = APIRouter(
    prefix="/organizations/{organization_id}/projects",
    tags=["Projects"]
)


@router.post("/", response_model=ProjectOut, status_code=201)
def create_project(
    organization_id: int,
    data: ProjectCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    require_member(db, organization_id, user.id)

    name = data.name.strip()
    if len(name) < 2:
        raise HTTPException(422, "Project name is too short")

    project = Project(
        organization_id=organization_id,
        name=name,
        description=data.description,
        created_by=user.id,
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


@router.get("/", response_model=list[ProjectOut])
def list_projects(
    organization_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    require_member(db, organization_id, user.id)

    statement = (
        select(Project)
        .where(Project.organization_id == organization_id)
        .order_by(Project.id.desc())
    )

    return db.scalars(statement).all()


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    organization_id: int,
    project_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    require_member(db, organization_id, user.id)

    project = db.scalar(
        select(Project).where(
            Project.id == project_id,
            Project.organization_id == organization_id
        )
    )

    if project is None:
        raise HTTPException(404, "Project not found")

    return project
