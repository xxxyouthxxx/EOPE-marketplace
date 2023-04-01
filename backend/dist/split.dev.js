"use strict";

var WIDTH = 2000; // 画布宽度

var HEIGHT = 2000; // 画布高度

var REGION_WIDTH = 500; // 区域宽度

var REGION_HEIGHT = 500; // 区域高度

var REGION_X = WIDTH - REGION_WIDTH; // 区域左上角 x 坐标

var REGION_Y = HEIGHT - REGION_HEIGHT; // 区域左上角 y 坐标

var loadFiles = function loadFiles() {
  var data, buffer, regionData, y, x, index, colorIndex;
  return regeneratorRuntime.async(function loadFiles$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(fs.readFile('./place', {
            encoding: 'binary'
          }));

        case 2:
          data = _context.sent;
          // 将文件内容转换成 Buffer 对象
          buffer = Buffer.from(data, 'binary'); // 取出指定区域的像素数据

          regionData = [];

          for (y = REGION_Y; y < REGION_Y + REGION_HEIGHT; y++) {
            for (x = REGION_X; x < REGION_X + REGION_WIDTH; x++) {
              index = y * WIDTH + x;
              colorIndex = buffer.readUInt8(index);
              regionData.push(colorIndex);
            }
          } // 将像素数据存储到文件中


          _context.next = 8;
          return regeneratorRuntime.awrap(fs.writeFile('./region_data', Buffer.from(regionData)));

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
};

loadFiles();