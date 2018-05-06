const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const config = require('./config');
const getMime = require('./getMime');

class StaticServer {
  constructor() {
    this.root = config.root;
    this.port = config.port;
    // 正则全局模式会把上次匹配到的索引记录下来，下次搜索的时候，会从停下来的位置开始。
    this.fileRe = /(\.\.\\|\.\\|\\$)/; 
    this.cache = config.cache;
  }

  run() {
    const server = http.createServer((req, res) => {
      const pathname = this._parsePathname(req, res);
      if (!res.finished) {
        this._response(pathname, req, res);
      }
    });

    server.listen(this.port);
  }

  _parsePathname(req, res) {
    const pathname = path.join(this.root, url.parse(req.url).pathname);
    return pathname;
  }

  _cacheControl(stat, req, res) {
    // Cache-Control: max-age, Last-Modified, Expires
    const date = new Date();
    const lastModified = stat.mtime.toUTCString();
    res.setHeader('Cache-Control', `max-age: ${this.cache.maxAge}`);
    res.setHeader('Expires', date.toUTCString());
    res.setHeader('Last-Modified', lastModified);
  }

  _response(pathname, req, res) {
    const ext = path.extname(pathname).replace('.', '');

    fs.stat(pathname, (err, stat) => {
      if (err) {
        res.writeHead(404, {
          'Content-Type': 'text/html'
        });
        res.end('Not Found');
        return;
      }

      // 判断是否是合法路径。 路径中有 ../, ./, 以 / 结尾的为非法路径

      if (stat.isDirectory() || this.fileRe.test(pathname)) {
        res.writeHead(403, {
          'Content-Type': 'text/html'
        });
        res.end('403 Forbidden');
        return;
      }

      const lastModified = stat.mtime.toUTCString();
      if (req.headers['if-modified-since'] && lastModified == req.headers['if-modified-since']) {
        res.writeHead(304, "Not Modified");
        res.end();
      } else {
        this._cacheControl(stat, req, res);
        res.setHeader('Content-Type', getMime(ext));
        const readStream = fs.createReadStream(pathname);
        readStream.pipe(res);
      }
    });
  }
}

module.exports = StaticServer;
