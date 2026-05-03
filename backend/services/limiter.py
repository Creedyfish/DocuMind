from fastapi import Request
from slowapi import Limiter


def get_fingerprint(request: Request) -> str:
    forwarded_for = request.headers.get("X-Forwarded-For")
    ip = (
        forwarded_for.split(",")[0].strip()
        if forwarded_for
        else (request.client.host if request.client else "unknown")
    )
    ua = request.headers.get("user-agent", "unknown")
    return f"{ip}:{ua}"


limiter = Limiter(key_func=get_fingerprint)
