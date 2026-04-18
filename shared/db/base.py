from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    All SQLAlchemy ORM models inherit from this.
    Import this base when defining new tables.
    """
    pass
