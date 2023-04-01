const express = require('express')
const SECURE = false
const { createServer } = SECURE ? require('https') : require('http')
const {WebSocketServer} = require('ws')
const router = express.Router()
const fs = require('fs').promises

let { WIDTH, HEIGHT,PALETTE_SIZE} = require('../config.json')

const app = express()
const server = createServer(app)
let wss = new Map()
let BANS = new Set();
const initBans = async (blacklistPath) => {
	const blackList = (await fs.readFile(blacklistPath)).toString().split('\n');
	BANS = new Set([...blackList]);
    for (let ban of blackList) {
        BANS.add(ban);
    }
	console.log("黑名单加载完毕:", BANS.size, "个");
};
(async () => {
    await initBans('blacklist.txt');
})();

const PORT = 9249
if (SECURE) {
  wss = new WebSocketServer({ perMessageDeflate: false, server: createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    perMessageDeflate: false
  }).listen(PORT)})
} else {
  console.log('非加密服务器');
  wss = new WebSocketServer({ port: PORT, perMessageDeflate: false})
}
console.log('套接字运行端口: ', PORT);
const useCloudflare = false
let PlayerCount = 0
const clients = new Map()
const loadFilesMiddleware = async (t) => {
  BOARD = await fs.readFile('./region_data')
}
loadFilesMiddleware()

router.get('/', function(req, res) {
  loadFilesMiddleware()
  res.send(BOARD)
});

// 套接字
wss.on('connection', (ws, req) => {
  var address = req.connection.remoteAddress.split(':').pop()
  // 获取客户端的origin
  const origin = req.headers.origin
  // 拒绝连接，如果客户端的IP地址在黑名单中，或者客户端的origin与服务器的origin不匹配。
  if ((origin && req.headers.origin !== origin) || BANS.has(address)){
    console.log("客户端：", address, "已被拒绝连接");
    ws.close()
  }
  // 防御措施：放置单个ip的连接数过多（>1）
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
  const playerSocketClient = {
    ip: req.connection.remoteAddress,
    port: req.connection.remotePort,
    connectedTime: new Date(),
  }
  clients.set(ws, playerSocketClient)
  PlayerCount++

  let buf = Buffer.alloc(17)
  // 第一个字节表示数据类型 这里是1 服务器向客户端发送冷却时间，画布宽高
  buf[0] = 1
  // 第二个字节表示冷却时间
  buf.writeUint32BE(0,1)
  buf.writeUint32BE(0,5)
  buf.writeUint32BE(WIDTH,9)
  buf.writeUint32BE(HEIGHT,13)
  ws.send(buf)
  distributePlayerCount()
  ws.on('message', (data) => {
    switch(data[0]) {
      //客户端发送的数据第一个字节为4，表示像素点的放置操作
      case 4:
      {
        if (data.length < 6) {
          console.log("像素因无效的数据包长度", data.Length, "被拒绝。");
        }
        var index = data.readUInt32BE(1)
        var color = data.readUInt8(5)
        if (index >= WIDTH * HEIGHT || color >= PALETTE_SIZE) {
          console.log('客户端：', address, '放置了无效的像素点', index, '颜色', color);
        }
        var clientCooldown = 0
        if (clientCooldown > playerSocketClient.connectedTime) {
          console.log("客户端：", address, "放置了像素点", index, "颜色", color, "但是被拒绝了，因为冷却时间未到。");
          var Buffer = Buffer.alloc(10)
          Buffer[0] = 7
          Buffer.writeUInt32BE(0, 1)  // 第二个字节表示冷却时间
          Buffer.writeUInt32BE(index, 5) // 第三个字节表示像素点的索引
          Buffer[9] = color
          ws.send(Buffer)
          return
        }
        console.log(data);
        DistributePixelPlacement(data)
        console.log("客户端", address, "放置了像素点", index, "颜色", color);
        console.log("当前画布：", BOARD);
      }
    }
  })
})
function distributePlayerCount() {
  var gameInfo = Buffer.alloc(5)
  gameInfo[0] = 3
  gameInfo.writeUint32BE(PlayerCount, 1)
  for (let c of wss.clients){
    c.send(gameInfo)
  }
  
}
// 服务器向客户端发送像素点的分布
function DistributePixelPlacement(pixel) {
  pixel[0] = 6 // 第一个字节表示数据类型 这里是6 服务器向客户端发送像素点的分布
  console.log(pixel);
  for (let c of wss.clients){
    c.send(pixel)
    BOARD[pixel.readUInt32BE(1)] = pixel.readUInt8(5)
  }
}

// 服务器将改变后的画布保存到文件




let I = 0
setInterval(() => {
  I++
  if (I % 12 == 0) {
    fs. writeFile('./region_data', BOARD)
    console.log("保存画布");
    console.log('BOARD', BOARD)
  }
}, 5000)
module.exports = router