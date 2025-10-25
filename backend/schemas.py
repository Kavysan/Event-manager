from pydantic import BaseModel
from typing import List, Optional

#------------input schemas--------------#

class AddEvent(BaseModel):
    id:str
    title: str
    description: Optional[str] = None

class AddUser(BaseModel):
    name: str
    email: str
    password: str

class AddBooking(BaseModel):
    tickets_booked: int

class UpdateBookingResponse(BaseModel):
    message: str
    event_title: str
    tickets_booked: int



#------------output schemas--------------#
class ShowEvent(BaseModel):
    id:str
    name: str
    description: Optional[str]= None
    tickets: int
    class Config():
        from_attributes = True
        fields = {"title": "name"}

class ShowMyBooking(BaseModel):
    tickets_booked: int
    event: "ShowEvent"

    class Config:
        from_attributes = True

class ShowBooking(AddBooking):
    id: int
    user_id: int
    event: "ShowEvent"  
    class Config:
        from_attributes = True

class ShowUser(BaseModel):
    name: str
    email: str
    password: str
    events: List[ShowEvent] = []
    bookings: List[ShowBooking] = []
    class Config:
        from_attributes = True

#------------Authentication schemas--------------#

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None

