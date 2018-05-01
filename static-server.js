const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const config = require('./config');

class StaticServer {
  constructor() {
    this.root = config.root;
    this.port = config.port;
  }

  run() {
    http.createServer((req, res) => {
      const pathname = this.root + url.parse(req.url).pathname;
      this.response(pathname, req, res);
    }).listen(this.port);
  }

  response(pathname, req, res) {
    fs.stat(pathname, (err, stat) => {
      if (err) {
        console.log(err);
        res.writeHead(404, {
          'Content-Type': 'text/html'
        });
        res.end('Not Found');
      } else {
        res.setHeader('Content-Type', 'image/jpg');
        const readStream = fs.createReadStream(pathname);
        readStream.pipe(res);
      }
    })
  }
}

module.exports = StaticServer;
