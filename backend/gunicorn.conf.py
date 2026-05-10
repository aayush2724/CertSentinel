import multiprocessing

bind = "0.0.0.0:5000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
timeout = 120          # generous for OCR processing
keepalive = 5
max_requests = 1000    # recycle workers to prevent memory leaks
max_requests_jitter = 100
accesslog = "-"
errorlog = "-"
loglevel = "info"
