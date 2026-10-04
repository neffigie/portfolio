"""Serve the built site locally with Hugo's navigable 404 page."""

from argparse import ArgumentParser
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


PUBLIC_DIRECTORY = Path(__file__).resolve().parents[1] / "site" / "public"


class PortfolioHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_error(self, code, message=None, explain=None):
        if code == HTTPStatus.NOT_FOUND:
            error_page = Path(self.directory) / "404.html"
            if error_page.is_file():
                content = error_page.read_bytes()
                self.send_response(HTTPStatus.NOT_FOUND)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                if self.command != "HEAD":
                    self.wfile.write(content)
                return
        super().send_error(code, message, explain)


if __name__ == "__main__":
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=4173)
    args = parser.parse_args()
    handler = partial(PortfolioHandler, directory=str(PUBLIC_DIRECTORY))
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        print(f"Serving {PUBLIC_DIRECTORY} at http://127.0.0.1:{args.port}/", flush=True)
        server.serve_forever()
