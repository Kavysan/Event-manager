from fastapi import APIRouter, Depends, HTTPException, status
import models, schemas, hashing
from sqlalchemy.orm import Session
from database import get_db


router = APIRouter(
    tags=['users'],
    prefix='/user'
)


@router.post('/', status_code=202)
def add_user(request: schemas.AddUser, db: Session = Depends(get_db)):
    existing_user = db.query(models.Users).filter(models.Users.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    new_user = models.Users(
        name = request.name,
        email = request.email,
        password = hashing.get_password_hash(request.password)
        )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get('/', status_code=201)
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.Users).all()


@router.get('/{id}', response_model=schemas.ShowUser, status_code=201)
def get_user(id:int, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(id == models.Users.id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return user


@router.delete('/{id}', status_code=status.HTTP_202_ACCEPTED)
def delete_user(id: int, db:Session = Depends(get_db)):
    user = db.query(models.Users).filter(id == models.Users.id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    db.delete(user)
    db.commit()
    return {'detail':'deleted user succesfully'}
