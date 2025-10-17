from flask import Flask, request, Response
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)  # handles CORS headers automatically

BACKEND_URL = "https://api.tarum.ai/generation-service"

@app.route("/generation-service/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def proxy(path):
    # Append query string if present
    query = f"?{request.query_string.decode()}" if request.query_string else ""
    url = f"{BACKEND_URL}/{path}{query}"

    if request.method == "OPTIONS":
        return Response("", 200)

    # Forward headers (keep Authorization)
    forward_headers = {}
    for key, value in request.headers.items():
        if key.lower() not in ["host", "content-length", "connection"]:
            forward_headers[key] = value

    print(f"🔗 Proxying request to: {url}")
    print(f"🔑 Forwarding headers: {forward_headers}")

    resp = requests.request(
        method=request.method,
        url=url,
        headers=forward_headers,
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False,
    )

    excluded_headers = ["content-encoding", "content-length", "transfer-encoding", "connection"]
    headers = [(name, value) for name, value in resp.raw.headers.items()
               if name.lower() not in excluded_headers]

    return Response(resp.content, resp.status_code, headers)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
