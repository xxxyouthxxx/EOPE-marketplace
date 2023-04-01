"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var express = require('express');

var SECURE = false;

var _ref = SECURE ? require('https') : require('http'),
    createServer = _ref.createServer;

var _require = require('ws'),
    WebSocketServer = _require.WebSocketServer;

var router = express.Router();

var fs = require('fs').promises;

var _require2 = require('../config.json'),
    WIDTH = _require2.WIDTH,
    HEIGHT = _require2.HEIGHT,
    PALETTE_SIZE = _require2.PALETTE_SIZE;

var app = express();
var server = createServer(app);
var wss = new Map();
var BANS = new Set();

var initBans = function initBans(blacklistPath) {
  var blackList, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, ban;

  return regeneratorRuntime.async(function initBans$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(fs.readFile(blacklistPath));

        case 2:
          blackList = _context.sent.toString().split('\n');
          BANS = new Set(_toConsumableArray(blackList));
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 7;

          for (_iterator = blackList[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            ban = _step.value;
            BANS.add(ban);
          }

          _context.next = 15;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](7);
          _didIteratorError = true;
          _iteratorError = _context.t0;

        case 15:
          _context.prev = 15;
          _context.prev = 16;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 18:
          _context.prev = 18;

          if (!_didIteratorError) {
            _context.next = 21;
            break;
          }

          throw _iteratorError;

        case 21:
          return _context.finish(18);

        case 22:
          return _context.finish(15);

        case 23:
          console.log("黑名单加载完毕:", BANS.size, "个");

        case 24:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[7, 11, 15, 23], [16,, 18, 22]]);
};

(function _callee() {
  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(initBans('blacklist.txt'));

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  });
})();

var PORT = 9249;

if (SECURE) {
  wss = new WebSocketServer({
    perMessageDeflate: false,
    server: createServer({
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
      perMessageDeflate: false
    }).listen(PORT)
  });
} else {
  console.log('非加密服务器');
  wss = new WebSocketServer({
    port: PORT,
    perMessageDeflate: false
  });
}

console.log('套接字运行端口: ', PORT);
var useCloudflare = false;
var PlayerCount = 0;
var clients = new Map();

var loadFilesMiddleware = function loadFilesMiddleware(t) {
  return regeneratorRuntime.async(function loadFilesMiddleware$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(fs.readFile('./region_data'));

        case 2:
          BOARD = _context3.sent;

        case 3:
        case "end":
          return _context3.stop();
      }
    }
  });
};

loadFilesMiddleware();
router.get('/', function (req, res) {
  loadFilesMiddleware();
  res.send(BOARD);
}); // 套接字

wss.on('connection', function (ws, req) {
  var address = req.connection.remoteAddress.split(':').pop(); // 获取客户端的origin

  var origin = req.headers.origin; // 拒绝连接，如果客户端的IP地址在黑名单中，或者客户端的origin与服务器的origin不匹配。

  if (origin && req.headers.origin !== origin || BANS.has(address)) {
    console.log("客户端：", address, "已被拒绝连接");
    ws.close();
  } // 防御措施：放置单个ip的连接数过多（>1）
  // if (useCloudflare) {
  //   //CF清除cookie是按设备、按浏览器进行的，因为每个浏览器/用户/设备只允许有一个WS连接。
  //   var clearance = req.headers['cf-connecting-ip']
  //   if (!clearance) {
  //     console.log('客户端：', address, '未通过Cloudflare验证');
  //     ws.close()
  //   }
  //   Object.values(clients).forEach((metadata) => {
  //     console.log('metadata: ', metadata);
  //   })
  // }
  // 允许连接，


  var playerSocketClient = {
    ip: req.connection.remoteAddress,
    port: req.connection.remotePort,
    connectedTime: new Date()
  };
  clients.set(ws, playerSocketClient);
  PlayerCount++;
  var buf = Buffer.alloc(17); // 第一个字节表示数据类型 这里是1 服务器向客户端发送冷却时间，画布宽高

  buf[0] = 1; // 第二个字节表示冷却时间

  buf.writeUint32BE(0, 1);
  buf.writeUint32BE(0, 5);
  buf.writeUint32BE(WIDTH, 9);
  buf.writeUint32BE(HEIGHT, 13);
  ws.send(buf);
  distributePlayerCount();
  ws.on('message', function (data) {
    switch (data[0]) {
      //客户端发送的数据第一个字节为4，表示像素点的放置操作
      case 4:
        {
          if (data.length < 6) {
            console.log("像素因无效的数据包长度", data.Length, "被拒绝。");
          }

          var index = data.readUInt32BE(1);
          var color = data.readUInt8(5);

          if (index >= WIDTH * HEIGHT || color >= PALETTE_SIZE) {
            console.log('客户端：', address, '放置了无效的像素点', index, '颜色', color);
          }

          var clientCooldown = 0;

          if (clientCooldown > playerSocketClient.connectedTime) {
            console.log("客户端：", address, "放置了像素点", index, "颜色", color, "但是被拒绝了，因为冷却时间未到。");
            var Buffer = Buffer.alloc(10);
            Buffer[0] = 7;
            Buffer.writeUInt32BE(0, 1); // 第二个字节表示冷却时间

            Buffer.writeUInt32BE(index, 5); // 第三个字节表示像素点的索引

            Buffer[9] = color;
            ws.send(Buffer);
            return;
          }

          console.log(data);
          DistributePixelPlacement(data);
          console.log("客户端", address, "放置了像素点", index, "颜色", color);
          console.log("当前画布：", BOARD);
        }
    }
  });
});

function distributePlayerCount() {
  var gameInfo = Buffer.alloc(5);
  gameInfo[0] = 3;
  gameInfo.writeUint32BE(PlayerCount, 1);
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = wss.clients[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var c = _step2.value;
      c.send(gameInfo);
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
} // 服务器向客户端发送像素点的分布


function DistributePixelPlacement(pixel) {
  pixel[0] = 6; // 第一个字节表示数据类型 这里是6 服务器向客户端发送像素点的分布

  console.log(pixel);
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = wss.clients[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var c = _step3.value;
      c.send(pixel);
      BOARD[pixel.readUInt32BE(1)] = pixel.readUInt8(5);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
        _iterator3["return"]();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
} // 服务器将改变后的画布保存到文件


var I = 0;
setInterval(function () {
  I++;

  if (I % 12 == 0) {
    fs.writeFile('./region_data', BOARD);
    console.log("保存画布");
    console.log('BOARD', BOARD);
  }
}, 5000);
module.exports = router;