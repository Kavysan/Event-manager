from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.responses import JSONResponse
import schemas, models
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from .oauth2 import get_current_user
import uuid

router = APIRouter(
    tags=['events'],
    prefix='/events'
)
#--------------post event-----------#
@router.post("/", status_code=201)
def add_event(event: schemas.AddEvent, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    existing_event = db.query(models.Events).filter(models.Events.title == event.title).first()
    if existing_event:
        return JSONResponse(
            status_code=200,
            content={"message": "Event already exists", "redirect": "/profile"}
        )

    new_event = models.Events(
        id=event.id,  
        title=event.title,
        description=event.description,
        user_id=current_user.id
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

#--------------get my bookings-----------#

@router.get("/my-bookings", response_model=List[schemas.ShowMyBooking])
def get_my_registered_events(db: Session = Depends(get_db), current_user: models.Users = Depends(get_current_user)):
    bookings = db.query(models.Bookings).filter(models.Bookings.user_id == current_user.id).all()
    result = []
    for booking in bookings:
        event = db.query(models.Events).filter(models.Events.id == booking.event_id).first()
        print("eventID = ", event.id)
        if event:
            result.append({
                "tickets_booked": booking.tickets_booked,
                "event": {
                    "id": event.id,
                    "name": event.title ,
                    "description": event.description or "",
                    "tickets": booking.tickets_booked
                }
            })
    print("My bookings result:", result)
    return result
#--------------get all events-----------#

@router.get('/', status_code=200, response_model=List[schemas.ShowEvent])
def get_all_events(db: Session = Depends(get_db), current_user: models.Users = Depends(get_current_user)):
    return db.query(models.Events).all()

#--------------get event by id----------#

@router.get('/{id}', status_code=status.HTTP_200_OK, response_model=schemas.ShowEvent)
def get_event_id(id: int, db: Session = Depends(get_db), current_user: models.Users = Depends(get_current_user)):
    event = db.query(models.Events).filter(models.Events.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Enter a valid ID")
    return event

#--------------register for event-----------#

@router.post('/{id}/register', status_code=201)
def register_event(
    id: str,
    request: schemas.AddBooking,
    db: Session = Depends(get_db),
    current_user: models.Users = Depends(get_current_user)
):  
    print("Received request:", request)
    # Check if the event exists
    event = db.query(models.Events).filter(models.Events.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Not a valid event')

    existing_booking = (
        db.query(models.Bookings)
        .filter(models.Bookings.event_id == id, models.Bookings.user_id == current_user.id)
        .first()
    )
    if existing_booking:
        raise HTTPException(status_code=400, detail='You have already registered for one or more of these events! Go to profile to view the registration!')

    new_booking = models.Bookings(
        event_id=event.id,
        user_id=current_user.id,
        tickets_booked=request.tickets_booked
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return {
        "message": "Booking successful",
        "event_title": event.title,
        "tickets_booked": request.tickets_booked
    }

# Delete an event by ID
@router.delete("/{event_id}", status_code=200)
def delete_event(event_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    event = db.query(models.Events).filter(
        models.Events.id == event_id, 
        models.Events.user_id == current_user.id
    ).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Delete all bookings related to this event first
    db.query(models.Bookings).filter(models.Bookings.event_id == event.id).delete()

    # Then delete the event
    db.delete(event)
    db.commit()
    return {"detail": "Event and related bookings deleted successfully"}

#--------------get attendees-----------#

@router.get("/{id}/attendees", response_model=List[schemas.ShowBooking])
def get_event_attendees(id: int, db: Session = Depends(get_db), current_user: models.Users = Depends(get_current_user)):
    event = db.query(models.Events).filter(models.Events.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to view attendees for this event")
    return db.query(models.Bookings).filter(models.Bookings.event_id == id).all()

#--------------cancel booking-----------#

@router.delete("/{id}/register", status_code=200)
def cancel_registration(id: str, db: Session = Depends(get_db), current_user: models.Users = Depends(get_current_user)):
    booking = (
        db.query(models.Bookings)
        .filter(models.Bookings.event_id == id, models.Bookings.user_id == current_user.id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    db.delete(booking)
    db.commit()
    return {"detail": "Registration cancelled successfully"}

#--------------update booking -----------#

@router.put("/{id}/register", response_model=schemas.UpdateBookingResponse, status_code=200)
def update_registration(
    id: str,
    request: schemas.AddBooking,
    db: Session = Depends(get_db),
    current_user: models.Users = Depends(get_current_user)
):
    booking = (
        db.query(models.Bookings)
        .filter(models.Bookings.event_id == id, models.Bookings.user_id == current_user.id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.tickets_booked = request.tickets_booked
    db.commit()
    db.refresh(booking)

    event = db.query(models.Events).filter(models.Events.id == id).first()

    return {
        "message": "Booking updated successfully",
        "event_title": event.title,
        "tickets_booked": booking.tickets_booked
    }
