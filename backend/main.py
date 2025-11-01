from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import events, users, authentication
from database import Base, engine

app = FastAPI()

# CORS middleware first
origins = [
        "https://event-manager-1-ncav.onrender.com",
        "https://event-manager-xdpt.onrender.com",  
        "http://localhost:5173",
        "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB setup
Base.metadata.create_all(bind=engine)

# Then include routers
app.include_router(events.router)
app.include_router(users.router)
app.include_router(authentication.router)
