var express = require('express');
var router = express.Router();
const fs = require('fs').promises
/* GET home page. */
// 获取画布信息
let BOARD, CHANGES
// 路由
const loadFilesMiddleware = async (t) => {
  BOARD = await fs.readFile('./region_data')
}
router.get('/', function(req, res) {
  loadFilesMiddleware()
  res.send(BOARD)
});

module.exports = router, BOARD;

