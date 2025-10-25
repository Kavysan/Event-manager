from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
from sqlalchemy import String, Float, Integer, ForeignKey
from typing import List

class Bookings(Base):
    __tablename__ = "bookings"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[str] = mapped_column(ForeignKey("events.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    tickets_booked: Mapped[int] = mapped_column(Integer)

    user: Mapped["Users"] = relationship("Users", back_populates="bookings")
    event: Mapped["Events"] = relationship("Events", back_populates="bookings")


class Events(Base):
    __tablename__ = "events"
    id: Mapped[str] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(250))
    description: Mapped[str] = mapped_column(String(1000))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped["Users"] = relationship(back_populates="events")
    bookings:  Mapped[List["Bookings"]] = relationship(back_populates="event")


class Users(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]  = mapped_column(String(30))
    email: Mapped[str]  = mapped_column(String(30), unique=True)
    password: Mapped[str] = mapped_column(String(30))

    events: Mapped[List["Events"]] = relationship(back_populates="user")
    bookings: Mapped[List["Bookings"]] = relationship("Bookings", back_populates="user")
