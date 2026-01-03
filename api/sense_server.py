import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from ci_mitca_sense import build_sense_profile

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / 'data' / 'sense_profiles.json'


def load_profiles():
    if DATA_PATH.exists():
        try:
            return json.loads(DATA_PATH.read_text(encoding='utf-8'))
        except json.JSONDecodeError:
            return []
    return []


def append_profile(profile):
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    profiles = load_profiles()
    profiles.append(profile)
    DATA_PATH.write_text(json.dumps(profiles, ensure_ascii=False, indent=2), encoding='utf-8')


class SenseHandler(BaseHTTPRequestHandler):
    server_version = 'CimeikaSense/1.0'

    def _set_headers(self, status=200, content_type='application/json', body_length=0):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(body_length))
        self.end_headers()

    def do_GET(self):
        if self.path != '/mitca/sense':
            message = json.dumps({'error': 'Not found'})
            encoded = message.encode('utf-8')
            self._set_headers(status=404, body_length=len(encoded))
            self.wfile.write(encoded)
            return

        profile = build_sense_profile()
        append_profile(profile)
        payload = json.dumps(profile, ensure_ascii=False).encode('utf-8')
        self._set_headers(body_length=len(payload))
        self.wfile.write(payload)

    def log_message(self, format, *args):  # noqa: A003
        return


def run_server():
    port = int(os.environ.get('SENSE_PORT', '8000'))
    address = ('0.0.0.0', port)
    with ThreadingHTTPServer(address, SenseHandler) as httpd:
        print(f'Cimeika Sense server running on port {port}, endpoint /mitca/sense')
        httpd.serve_forever()


if __name__ == '__main__':
    run_server()
