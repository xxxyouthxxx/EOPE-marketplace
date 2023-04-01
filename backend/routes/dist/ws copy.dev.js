"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var express = require('express');

var app = express();
var router = express.Router();

var _require = require('ws'),
    WebSocketServer = _require.WebSocketServer;

var SECURE = false;

var _ref = SECURE ? require('https') : require('http'),
    createServer = _ref.createServer;

var fs = require('fs').promises;

var fetch = require('node-fetch')["default"];

var BOARD, CHANGES;

var _require2 = require('../config.json'),
    WIDTH = _require2.WIDTH,
    HEIGHT = _require2.HEIGHT,
    PALETTE_SIZE = _require2.PALETTE_SIZE,
    USE_GIT = _require2.USE_GIT;

var loadFilesMiddleware = function loadFilesMiddleware(t) {
  return regeneratorRuntime.async(function loadFilesMiddleware$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(fs.readFile('./place'));

        case 3:
          BOARD = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(fs.readFile('./change'));

        case 6:
          CHANGES = _context.sent;
          _context.next = 13;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](0);
          BOARD = new Uint8Array(WIDTH * HEIGHT);
          CHANGES = new Uint8Array(WIDTH * HEIGHT).fill(255);

        case 13:
          console.log('BOARD: ', BOARD);
          console.log('CHANGES: ', CHANGES);

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 9]]);
};

loadFilesMiddleware();
var newPos = [],
    newCols = [];
var wss,
    cooldowns = new Map();

function runLengthChanges() {
  // 用游程编码算法压缩
  var i = 0; // 两个变量的作用是协调将数据写入到缓冲区中，并在需要时创建新的缓冲区

  var bufs = [Buffer.alloc(256)],
      blast = 0,
      bi = 0; // 将对象的第一个字节设为2，表示这是一个更改通知。 

  bufs[0][bi++] = 2; //将画板的宽度和高度写入bufs对象的第2-9个字节。

  bufs[0].writeUint32BE(WIDTH, 1);
  bufs[0].writeUint32BE(HEIGHT, 5);
  bi += 8; // 每次调用 add 时，它会将 a 写入到 bufs[blast][bi]，然后递增 bi。
  // 如果 bi 的值达到了 256，则将 bufs[blast] 压缩到当前大小，并将新的空间添加到 bufs 中，将 blast 递增。
  // 这样做是为了限制缓冲区的大小，因为随着时间的推移，数据量可能会变得非常大，需要定期清空缓冲区。

  var add = function add(a) {
    bufs[blast][bi++] = a;
    bi == 256 && (bi = 0, bufs.push(Buffer.alloc(256)), blast++);
  };

  while (true) {
    var c = 0;

    while (CHANGES[i] == 255) {
      c++, i++;
    }

    if (i == CHANGES.length) break;

    if (c < 256) {
      if (!c) add(CHANGES[i++]);else {
        add(CHANGES[i++] + 64);
        add(c);
      }
    } else if (c < 65536) {
      add(CHANGES[i++] + 128);
      add(c >> 8);
      add(c);
    } else {
      add(CHANGES[i++] + 192);
      add(c >> 24);
      add(c >> 16);
      add(c >> 8);
      add(c);
    }
  }

  bufs[blast] = bufs[blast].slice(0, bi);
  return Buffer.concat(bufs);
}

var PORT = 9249; // 创建websocket服务器 两种创建方式 加密服务器和非加密服务器
// 因为还没有证书密钥 先使用非加密服务器

var initWebSocketServer = function initWebSocketServer(port, secure) {
  return regeneratorRuntime.async(function initWebSocketServer$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!secure) {
            _context2.next = 16;
            break;
          }

          _context2.t0 = WebSocketServer;
          _context2.t1 = createServer;
          _context2.next = 5;
          return regeneratorRuntime.awrap(fs.readFile('./key.pem'));

        case 5:
          _context2.t2 = _context2.sent;
          _context2.next = 8;
          return regeneratorRuntime.awrap(fs.readFile('./cert.pem'));

        case 8:
          _context2.t3 = _context2.sent;
          _context2.t4 = {
            key: _context2.t2,
            cert: _context2.t3,
            perMessageDeflate: false
          };
          _context2.t5 = port;
          _context2.t6 = (0, _context2.t1)(_context2.t4).listen(_context2.t5);
          _context2.t7 = {
            perMessageDeflate: false,
            server: _context2.t6
          };
          wss = new _context2.t0(_context2.t7);
          _context2.next = 17;
          break;

        case 16:
          wss = new WebSocketServer({
            port: PORT,
            perMessageDeflate: false
          });

        case 17:
          console.log('套接字运行中，端口: ', PORT);

        case 18:
        case "end":
          return _context2.stop();
      }
    }
  });
};

initWebSocketServer(PORT, SECURE); // console.log(wss);

var players = 0;

var NO_PORT = function NO_PORT(a) {
  return a.split(':')[0].trim();
};

var BANS = new Set();

var initBans = function initBans(blacklistPath) {
  var blackList, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, ban;

  return regeneratorRuntime.async(function initBans$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(fs.readFile(blacklistPath));

        case 2:
          blackList = _context3.sent.toString().split('\n');
          BANS = new Set(_toConsumableArray(blackList));
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context3.prev = 7;

          for (_iterator = blackList[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            ban = _step.value;
            BANS.add(ban);
          }

          _context3.next = 15;
          break;

        case 11:
          _context3.prev = 11;
          _context3.t0 = _context3["catch"](7);
          _didIteratorError = true;
          _iteratorError = _context3.t0;

        case 15:
          _context3.prev = 15;
          _context3.prev = 16;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 18:
          _context3.prev = 18;

          if (!_didIteratorError) {
            _context3.next = 21;
            break;
          }

          throw _iteratorError;

        case 21:
          return _context3.finish(18);

        case 22:
          return _context3.finish(15);

        case 23:
          console.log("黑名单加载完毕");

        case 24:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[7, 11, 15, 23], [16,, 18, 22]]);
};

(function _callee() {
  return regeneratorRuntime.async(function _callee$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(initBans('blacklist.txt'));

        case 2:
        case "end":
          return _context4.stop();
      }
    }
  });
})(); // .git-credentials 是 Git 的凭证存储文件，用于存储访问远程 Git 存储库所需的用户名和密码等凭据信息。将 ORIGIN 设置为远程 Git 存储库的 URL


var ORIGIN = null;

function fetchOrigin() {
  return regeneratorRuntime.async(function fetchOrigin$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.t0 = regeneratorRuntime;
          _context5.next = 4;
          return regeneratorRuntime.awrap(fs.readFile("../.git-credentials"));

        case 4:
          _context5.t1 = _context5.sent.toString().trim();
          _context5.next = 7;
          return _context5.t0.awrap.call(_context5.t0, _context5.t1);

        case 7:
          ORIGIN = _context5.sent;
          _context5.next = 12;
          break;

        case 10:
          _context5.prev = 10;
          _context5.t2 = _context5["catch"](0);

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 10]]);
}

(function _callee2() {
  return regeneratorRuntime.async(function _callee2$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(fetchOrigin());

        case 2:
        case "end":
          return _context6.stop();
      }
    }
  });
})();

var HIST_LEN = 30;
wss.on('connection', function _callee4(p, _ref2) {
  var headers, uri, url, IP, buf;
  return regeneratorRuntime.async(function _callee4$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          headers = _ref2.headers, uri = _ref2.url;
          console.log('有新的连接！');
          p.ip = p._socket.remoteAddress.split(':', 4).join(':'); // 如果ip地址在黑名单中 则关闭连接

          if (!BANS.has(p.ip)) {
            _context8.next = 5;
            break;
          }

          return _context8.abrupt("return", p.close());

        case 5:
          url = uri.slice(1);
          IP =
          /*p._socket.remoteAddress */
          url || p.ip; // 在某些情况下，IP地址会被IPv6地址中的“％”符号分隔符分隔。
          // 如果连接的IP地址以“％”开头，则这表示客户端连接到了IPv6地址，
          // 因此此IP地址将被添加到黑名单中并关闭连接。
          // 这是为了避免恶意用户使用IPv6地址来规避黑名单。

          if (!IP.startsWith("%")) {
            _context8.next = 11;
            break;
          }

          BANS.add(p.ip);
          fs.appendFile("blacklist.txt", "\n" + p.ip);
          return _context8.abrupt("return", p.close());

        case 11:
          if (IP) {
            _context8.next = 13;
            break;
          }

          return _context8.abrupt("return", p.close());

        case 13:
          p.pHistory = [];
          buf = Buffer.alloc(17);
          buf[0] = 1;
          buf.writeUint32BE(0, 1);
          buf.writeUint32BE(0, 5);
          buf.writeUint32BE(WIDTH, 9);
          buf.writeUint32BE(HEIGHT, 13);
          p.send(buf);
          console.log('code = ', buf[0]);
          p.send(runLengthChanges());
          console.log('code = ', runLengthChanges()[0]);
          p.on('message', function _callee3(data) {
            return regeneratorRuntime.async(function _callee3$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                  case "end":
                    return _context7.stop();
                }
              }
            });
          });
          p.on('close', function () {
            console.log('连接关闭');
          });

        case 26:
        case "end":
          return _context8.stop();
      }
    }
  });
});
var NOW = Date.now();
setInterval(function () {
  NOW = Date.now();
}, 50); // import {exec} from 'child_process'

var exec = require('child_process').exec;

function pushImage() {
  var i, dte, curr;
  return regeneratorRuntime.async(function pushImage$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          for (i = BOARD.length - 1; i >= 0; i--) {
            if (CHANGES[i] != 255) {
              BOARD[i] = CHANGES[i];
            }
          }

          _context9.next = 3;
          return regeneratorRuntime.awrap(fs.writeFile('place', BOARD));

        case 3:
          if (!USE_GIT) {
            _context9.next = 8;
            break;
          }

          _context9.next = 6;
          return regeneratorRuntime.awrap(new Promise(function (r, t) {
            return exec("git commit place -m 'Hourly backup';git push --force " + ORIGIN + "", function (e) {
              return e ? t(e) : r();
            });
          }));

        case 6:
          _context9.next = 15;
          break;

        case 8:
          dte = new Date().toLocaleString().replaceAll('/', '.').replaceAll(', ', '.');
          _context9.next = 11;
          return regeneratorRuntime.awrap(fs.copyFile("./PlaceHttpsServer/place", "./PlaceHttpsServer/place." + dte, 0, function (err) {
            if (err) {
              console.log(err);
              return;
            }
          }));

        case 11:
          _context9.next = 13;
          return regeneratorRuntime.awrap(fs.copyFile("./place", "./PlaceHttpsServer/place", 0, function (err) {
            if (err) {
              console.log(err);
              return;
            }
          }));

        case 13:
          _context9.next = 15;
          return regeneratorRuntime.awrap(fs.appendFile("./PlaceHttpsServer/backuplist.txt", "\nplace." + dte, function (err) {
            if (err) {
              console.log(err);
              return;
            }
          }));

        case 15:
          curr = new Uint8Array(CHANGES);
          setTimeout(function () {
            for (var _i = curr.length - 1; _i >= 0; _i--) {
              if (curr[_i] == CHANGES[_i]) {
                CHANGES[_i] = 255;
              }
            }
          }, 200e3);

        case 17:
        case "end":
          return _context9.stop();
      }
    }
  });
}

setInterval(function () {
  if (!newPos.length) return;
  var pos;
  var buf = Buffer.alloc(1 + newPos.length * 5);
  buf[0] = 6;
  var i = 1;

  while ((pos = newPos.pop()) != undefined) {
    buf.writeUInt32BE(pos, i);
    i += 4;
    buf[i] = newCols.pop();
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = wss.clients[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var c = _step2.value;
      c.send(buf);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}, 1000);
var I = 0;
var bf = Buffer.alloc(131);
bf[0] = 3;
module.exports = router;