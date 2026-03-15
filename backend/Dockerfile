FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for building Python packages
RUN apt-get update && apt-get install -y build-essential libpq-dev

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Copy application code
COPY . .

# Expose port (this is just documentation for Docker, Railway overrides it)
EXPOSE 8000

# Start command (Updated to use Railway's dynamic $PORT variable)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}