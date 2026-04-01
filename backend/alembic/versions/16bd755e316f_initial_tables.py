"""initial tables

Revision ID: 16bd755e316f
Revises:
Create Date: 2026-04-01 11:20:53.256231

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "16bd755e316f"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "patients",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("dob", sa.Date(), nullable=False),
        sa.Column("email", sa.String(255), server_default=""),
        sa.Column("phone", sa.String(20), server_default=""),
        sa.Column("address", sa.Text(), server_default=""),
        sa.Column("blood_type", sa.String(5), server_default=""),
        sa.Column("allergies", sa.Text(), server_default=""),
        sa.Column("conditions", sa.Text(), server_default=""),
        sa.Column("status", sa.String(20), server_default="Active"),
        sa.Column("last_visit", sa.Date(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.func.now(),
        ),
    )

    op.create_table(
        "notes",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column(
            "patient_id",
            sa.Integer(),
            sa.ForeignKey("patients.id"),
            nullable=False,
        ),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "timestamp",
            sa.DateTime(),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("notes")
    op.drop_table("patients")
