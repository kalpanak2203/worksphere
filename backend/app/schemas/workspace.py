
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class OrganizationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)


class OrganizationOut(BaseModel):
    id: int
    name: str
    slug: str
    owner_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None


class ProjectOut(BaseModel):
    id: int
    organization_id: int
    name: str
    description: str | None
    status: str
    created_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


TaskStatus = Literal["todo", "in_progress", "done"]
TaskPriority = Literal["low", "medium", "high", "urgent"]


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    priority: TaskPriority = "medium"


class TaskUpdate(BaseModel):
    status: TaskStatus | None = None
    priority: TaskPriority | None = None


class TaskOut(BaseModel):
    id: int
    organization_id: int
    project_id: int
    title: str
    description: str | None
    status: str
    priority: str
    created_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
