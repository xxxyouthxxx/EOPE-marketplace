"use strict";

var express = require('express');

var router = express.Router();

var fs = require('fs').promises;
/* GET home page. */
// 获取画布信息


var BOARD, CHANGES; // 路由

var loadFilesMiddleware = function loadFilesMiddleware(t) {
  return regeneratorRuntime.async(function loadFilesMiddleware$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(fs.readFile('./region_data'));

        case 2:
          BOARD = _context.sent;

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
};

router.get('/', function (req, res) {
  loadFilesMiddleware();
  res.send(BOARD);
});
module.exports = router, BOARD;