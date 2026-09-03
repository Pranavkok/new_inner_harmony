import http.server
import socketserver
import os
import sys

class RangeRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()

        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, "File not found")
            return None

        fs = os.fstat(f.fileno())
        total = fs.st_size
        range_header = self.headers.get('Range')

        if not range_header or not range_header.startswith('bytes='):
            return super().send_head()

        try:
            ranges = range_header[6:].split('-')
            start = int(ranges[0]) if ranges[0] else 0
            end = int(ranges[1]) if ranges[1] else total - 1
            if start >= total or end >= total or start > end:
                self.send_error(416, "Requested Range Not Satisfiable")
                f.close()
                return None

            length = end - start + 1
            self.send_response(206)
            self.send_header("Content-type", self.guess_type(path))
            self.send_header("Content-Range", f"bytes {start}-{end}/{total}")
            self.send_header("Content-Length", str(length))
            self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
            self.end_headers()

            class RangeFile:
                def __init__(self, fp, start_pos, length_to_read):
                    self.fp = fp
                    self.fp.seek(start_pos)
                    self.remaining = length_to_read
                def read(self, size=-1):
                    if self.remaining <= 0:
                        return b''
                    if size < 0 or size > self.remaining:
                        size = self.remaining
                    data = self.fp.read(size)
                    self.remaining -= len(data)
                    return data
                def close(self):
                    self.fp.close()

            return RangeFile(f, start, length)
        except Exception:
            f.seek(0)
            return super().send_head()

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == '__main__':
    port = 8000
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    server = ThreadedHTTPServer(('0.0.0.0', port), RangeRequestHandler)
    print(f"Serving HTTP on port {port} with Range support...")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
