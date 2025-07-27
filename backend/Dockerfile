FROM python:3.12-slim

# Create non-root user
RUN adduser --disabled-password appuser

WORKDIR /backend

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . .

RUN chmod +x run.sh

USER appuser

EXPOSE 8000

CMD ["./run.sh"]