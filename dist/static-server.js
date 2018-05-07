"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var url_1 = __importDefault(require("url"));
var config_1 = __importDefault(require("./config"));
var getMime_1 = __importDefault(require("./getMime"));
var IncomingMessage = http_1.default.IncomingMessage;
var ServerResponse = http_1.default.ServerResponse;
var StaticServer = /** @class */ (function () {
    function StaticServer() {
        this.root = config_1.default.root;
        this.port = config_1.default.port;
        // 正则全局模式会把上次匹配到的索引记录下来，下次搜索的时候，会从停下来的位置开始。
        this.fileRe = /(\.\.\\|\.\\|\\$)/;
        this.cache = config_1.default.cache;
    }
    StaticServer.prototype.run = function () {
        var _this = this;
        var server = http_1.default.createServer(function (req, res) {
            var pathname = _this._parsePathname(req, res);
            if (!res.finished) {
                _this._response(pathname, req, res);
            }
        });
        server.listen(this.port);
    };
    StaticServer.prototype._parsePathname = function (req, res) {
        var urlpath = '';
        if (req.url) {
            urlpath = url_1.default.parse(req.url).pathname;
        }
        if (urlpath === undefined) {
            urlpath = '';
        }
        var pathname = path_1.default.join(this.root, urlpath);
        return pathname;
    };
    StaticServer.prototype._cacheControl = function (stat, req, res) {
        // Cache-Control: max-age, Last-Modified, Expires
        var date = new Date();
        var lastModified = stat.mtime.toUTCString();
        res.setHeader('Cache-Control', "max-age: " + this.cache.maxAge);
        res.setHeader('Expires', date.toUTCString());
        res.setHeader('Last-Modified', lastModified);
    };
    StaticServer.prototype._response = function (pathname, req, res) {
        var _this = this;
        var ext = path_1.default.extname(pathname).replace('.', '');
        fs_1.default.stat(pathname, function (err, stat) {
            if (err) {
                res.writeHead(404, {
                    'Content-Type': 'text/html'
                });
                res.end('Not Found');
                return;
            }
            // 判断是否是合法路径。 路径中有 ../, ./, 以 / 结尾的为非法路径
            if (stat.isDirectory() || _this.fileRe.test(pathname)) {
                res.writeHead(403, {
                    'Content-Type': 'text/html'
                });
                res.end('403 Forbidden');
                return;
            }
            var lastModified = stat.mtime.toUTCString();
            if (req.headers['if-modified-since'] && lastModified == req.headers['if-modified-since']) {
                res.writeHead(304, "Not Modified");
                res.end();
            }
            else {
                _this._cacheControl(stat, req, res);
                res.setHeader('Content-Type', getMime_1.default(ext));
                var readStream = fs_1.default.createReadStream(pathname);
                readStream.pipe(res);
            }
        });
    };
    return StaticServer;
}());
module.exports = StaticServer;
