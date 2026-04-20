FROM python:3.12-slim

WORKDIR /app

# Install shared package (brings in sqlalchemy, asyncpg, alembic)
COPY shared/ /app/shared/
RUN pip install --no-cache-dir /app/shared

# Install jobs service dependencies
COPY services/jobs/requirements.txt /app/service/requirements.txt
RUN pip install --no-cache-dir -r /app/service/requirements.txt

# Copy jobs service code into jobs/ package directory
COPY services/jobs/ /app/service/jobs/

WORKDIR /app/service

CMD ["python", "-m", "jobs.main"]
