FROM python:3.12-slim

WORKDIR /backend

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . .

RUN chmod +x run.sh

EXPOSE 8000

CMD ["./run.sh"]