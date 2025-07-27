#!/bin/sh

#Running migrations and upgrades into app
# alembic -c app/db/migrations/alembic.ini migrate 
# alembic -c app/db/migrations/alembic.ini upgrade head

echo "Starting Fast API backend..."

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload