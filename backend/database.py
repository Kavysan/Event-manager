from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base

sqlite_file_name = "events.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)
SessionLocal  = sessionmaker(expire_on_commit=False, autoflush=True, bind=engine)


def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally:
        db.close()


Base = declarative_base()