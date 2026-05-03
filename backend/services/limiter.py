from fastapi import Request
from slowapi import Limiter


def get_fingerprint(request: Request) -> str:
    ip = request.client.host if request.client else "unknown"
    ua = request.headers.get("user-agent", "unknown")
    return f"{ip}:{ua}"


limiter = Limiter(key_func=get_fingerprint)
