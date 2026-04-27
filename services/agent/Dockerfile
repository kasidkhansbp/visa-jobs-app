FROM python:3.12-slim

WORKDIR /app

COPY shared/ /app/shared/
RUN pip install --no-cache-dir /app/shared

COPY services/agent/requirements.txt /app/service/requirements.txt
RUN pip install --no-cache-dir -r /app/service/requirements.txt

COPY services/agent/ /app/service/agent/

WORKDIR /app/service

ENV PYTHONPATH=/app

CMD ["python", "-m", "agent.main"]
