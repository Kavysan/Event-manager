from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import events, users, authentication
from database import Base, engine

app = FastAPI()

# ✅ Only include frontend + local dev URLs
origins = [
    "https://event-manager-1-ncav.onrender.com",  # your deployed frontend
    "http://localhost:5173",                      # local dev
    "http://127.0.0.1:5173"
]

# ✅ CORS middleware FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=".*",   # <— fallback wildcard for any domain (avoids cold-start CORS errors)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Initialize database
Base.metadata.create_all(bind=engine)

# ✅ Include routers AFTER middleware
app.include_router(events.router)
app.include_router(users.router)
app.include_router(authentication.router)
