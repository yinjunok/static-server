import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import config from './config';
import getMime from './getMime';

const IncomingMessage = http.IncomingMessage;
const ServerResponse = http.ServerResponse;

class StaticServer {
  private readonly root: string;
  private readonly port: number;
  private readonly fileRe: RegExp;
  private readonly cache: {
    maxAge: number,
    file: RegExp,
  };

  constructor() {
    this.root = config.root;
    this.port = config.port;
    // 正则全局模式会把上次匹配到的索引记录下来，下次搜索的时候，会从停下来的位置开始。
    this.fileRe = /(\.\.\\|\.\\|\\$)/; 
    this.cache = config.cache;
  }

  public run() {
    const server = http.createServer((req, res) => {
      const pathname = this._parsePathname(req, res);
      if (!res.finished) {
        this._response(pathname, req, res);
      }
    });

    server.listen(this.port);
  }

  private _parsePathname(req: http.IncomingMessage, res: http.ServerResponse): string {
    let urlpath : string | undefined = '';
    if (req.url) {
      urlpath = url.parse(req.url).pathname;
    }

    if(urlpath === undefined) {
      urlpath = '';
    }

    const pathname = path.join(this.root, urlpath);
    return pathname;
  }

  private _cacheControl(stat: fs.Stats, req: http.IncomingMessage, res: http.ServerResponse): void {
    // Cache-Control: max-age, Last-Modified, Expires
    const date = new Date();
    const lastModified = stat.mtime.toUTCString();
    res.setHeader('Cache-Control', `max-age: ${this.cache.maxAge}`);
    res.setHeader('Expires', date.toUTCString());
    res.setHeader('Last-Modified', lastModified);
  }

  private _response(pathname: string, req: http.IncomingMessage, res: http.ServerResponse): undefined | void {
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
