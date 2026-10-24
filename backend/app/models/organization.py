
from datetime import datetime, timezone

from sqlalchemy import (
    String, Integer, ForeignKey, DateTime,
    UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


def utc_now():
    return datetime.now(timezone.utc)


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    name: Mapped[str] = mapped_column(
        String(150), nullable=False
    )
    slug: Mapped[str] = mapped_column(
        String(180), unique=True, index=True
    )
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now
    )


class OrganizationMember(Base):
    __tablename__ = "organization_members"

    __table_args__ = (
        UniqueConstraint(
            "organization_id", "user_id",
            name="uq_org_user"
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"),
        index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), index=True
    )
    role: Mapped[str] = mapped_column(
        String(20), default="member"
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now
    )
