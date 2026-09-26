FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install the CUDA-enabled PyTorch wheels before application dependencies.
COPY requirements.txt requirements-gpu-cu128.txt ./
RUN pip install --no-cache-dir -r requirements-gpu-cu128.txt \
    && pip install --no-cache-dir -r requirements.txt

RUN useradd --create-home --uid 10001 app
COPY --chown=app:app . .
USER app
ENV YOLO_AUTOINSTALL=false

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=180s --retries=3 \
  CMD python -c "import json,urllib.request; data=json.load(urllib.request.urlopen('http://127.0.0.1:8000/health')); raise SystemExit(0 if data.get('engine_ready') else 1)"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
