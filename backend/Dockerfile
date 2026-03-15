FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential libpq-dev

# Tell Docker explicitly to copy from the backend folder
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Tell Docker explicitly to copy the rest of the backend files
COPY backend/ .

EXPOSE 8000

# Start command using Railway's dynamic port
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port $PORT"