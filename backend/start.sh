#!/usr/bin/env bash
pip install gunicorn uvicorn fastapi sqlalchemy pydantic
gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT
