from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from .auth_token import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token
from sqlalchemy.orm import Session
from database import get_db
import models, hashing



router = APIRouter(
    tags=['authentication'],
    prefix='/auth'
)


@router.post("/login")
async def login_for_access_token(db: Session = Depends(get_db), request: OAuth2PasswordRequestForm = Depends()):
    user = db.query(models.Users).filter(models.Users.email == request.username).first()
    if not user or not hashing.verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }

