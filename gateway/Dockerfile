FROM python:3.12-slim

WORKDIR /app

# Install shared package (brings in sqlalchemy, asyncpg, alembic)
COPY shared/ /app/shared/
RUN pip install --no-cache-dir /app/shared

# Install gateway dependencies
COPY gateway/requirements.txt /app/gateway/requirements.txt
RUN pip install --no-cache-dir -r /app/gateway/requirements.txt

# Copy gateway code
COPY gateway/ /app/gateway/

WORKDIR /app/gateway

# Run migrations then start the server
CMD ["sh", "-c", "cd /app/shared && PYTHONPATH=/app python -m alembic upgrade head && cd /app/gateway && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
