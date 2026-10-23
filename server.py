"""Local static preview. Serves only the app and generated model/runtime assets."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
ROOT = Path(__file__).resolve().parent
ALLOWED = {'index.html', 'style.css', 'app.mjs', 'analyze.mjs', 'demo.mjs', 'semantic.mjs'}
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = unquote(urlsplit(self.path).path).lstrip('/') or 'index.html'
        target = (ROOT / path).resolve()
        if not target.is_relative_to(ROOT) or not target.is_file() or not (path in ALLOWED or path.startswith(('models/', 'vendor/'))):
            self.send_error(404); return
        super().do_GET()
    def do_HEAD(self):
        self.do_GET()
    def translate_path(self, path):
        return str(ROOT / (unquote(urlsplit(path).path).lstrip('/') or 'index.html'))
    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        super().end_headers()
if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--port', type=int, default=8765)
    args = parser.parse_args()
    print(f'Open http://127.0.0.1:{args.port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
