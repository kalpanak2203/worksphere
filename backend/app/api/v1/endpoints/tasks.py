
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.schemas.workspace import (
    TaskCreate, TaskUpdate, TaskOut
)
from app.core.permissions import require_member
from app.api.v1.endpoints.auth import get_current_user


router = APIRouter(
    prefix="/organizations/{organization_id}/projects/{project_id}/tasks",
    tags=["Tasks"]
)


def get_authorized_project(
    db: Session,
    organization_id: int,
    project_id: int,
    user_id: int
):
    require_member(db, organization_id, user_id)

    project = db.scalar(
        select(Project).where(
            Project.id == project_id,
            Project.organization_id == organization_id
        )
    )

    if project is None:
        raise HTTPException(404, "Project not found")

    return project


@router.post("/", response_model=TaskOut, status_code=201)
def create_task(
    organization_id: int,
    project_id: int,
    data: TaskCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    get_authorized_project(
        db, organization_id, project_id, user.id
    )

    title = data.title.strip()
    if not title:
        raise HTTPException(422, "Task title is required")

    task = Task(
        organization_id=organization_id,
        project_id=project_id,
        title=title,
        description=data.description,
        priority=data.priority,
        created_by=user.id,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.get("/", response_model=list[TaskOut])
def list_tasks(
    organization_id: int,
    project_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    get_authorized_project(
        db, organization_id, project_id, user.id
    )

    return db.scalars(
        select(Task).where(
            Task.organization_id == organization_id,
            Task.project_id == project_id
        ).order_by(Task.id.desc())
    ).all()


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    organization_id: int,
    project_id: int,
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    get_authorized_project(
        db, organization_id, project_id, user.id
    )

    task = db.scalar(
        select(Task).where(
            Task.id == task_id,
            Task.organization_id == organization_id,
            Task.project_id == project_id
        )
    )

    if task is None:
        raise HTTPException(404, "Task not found")

    changes = data.model_dump(exclude_unset=True)

    for field, value in changes.items():
        if value is None:
            raise HTTPException(
                422, f"{field} cannot be null"
            )
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task
