var express = require('express')
var app = express()
const router = express.Router()
const {WebSocketServer} = require('ws')
let SECURE = false
const { createServer } = SECURE ? require('https') : require('http')
const fs = require('fs').promises
const fetch = require('node-fetch').default
let BOARD, CHANGES
let { WIDTH, HEIGHT,PALETTE_SIZE, USE_GIT} = require('../config.json')

const loadFilesMiddleware = async (t) => {
    try { 
        BOARD = await fs.readFile('./place') 
        CHANGES = await fs.readFile('./change')
    } catch(e) { 
        BOARD = new Uint8Array(WIDTH * HEIGHT) 
        CHANGES = new Uint8Array(WIDTH * HEIGHT).fill(255)
    } 
	console.log('BOARD: ', BOARD);
	console.log('CHANGES: ', CHANGES);
}
loadFilesMiddleware()
let newPos = [], newCols = []
let wss, cooldowns = new Map()

function runLengthChanges() {
    // 用游程编码算法压缩
    let i = 0 
    // 两个变量的作用是协调将数据写入到缓冲区中，并在需要时创建新的缓冲区
    let bufs = [Buffer.alloc(256)], blast = 0, bi = 0
    // 将对象的第一个字节设为2，表示这是一个更改通知。 
    bufs[0][bi++] = 2 
    //将画板的宽度和高度写入bufs对象的第2-9个字节。
    bufs[0].writeUint32BE(WIDTH, 1) 
    bufs[0].writeUint32BE(HEIGHT, 5)
    bi += 8 
    // 每次调用 add 时，它会将 a 写入到 bufs[blast][bi]，然后递增 bi。
    // 如果 bi 的值达到了 256，则将 bufs[blast] 压缩到当前大小，并将新的空间添加到 bufs 中，将 blast 递增。
    // 这样做是为了限制缓冲区的大小，因为随着时间的推移，数据量可能会变得非常大，需要定期清空缓冲区。
    let add = a => {
		bufs[blast][bi++]=a;bi==256&&(bi=0,bufs.push(Buffer.alloc(256)),blast++)
	} 
    while(true){ 
            let c = 0 
            while(CHANGES[i] == 255)c++,i++ 
            if(i == CHANGES.length)break 
            if(c < 256){ 
                    if(!c)add(CHANGES[i++]) 
                    else{ 
                            add(CHANGES[i++] + 64) 
                            add(c) 
                    } 
            }else if(c < 65536){ 
                    add(CHANGES[i++] + 128) 
                    add(c >> 8) 
                    add(c) 
            }else{ 
                    add(CHANGES[i++] + 192) 
                    add(c >> 24) 
                    add(c >> 16) 
                    add(c >> 8)
                    add(c) 
            } 
    } 
    bufs[blast] = bufs[blast].slice(0,bi) 
    return Buffer.concat(bufs) 
}

const PORT = 9249
// 创建websocket服务器 两种创建方式 加密服务器和非加密服务器
// 因为还没有证书密钥 先使用非加密服务器
const initWebSocketServer = async (port, secure) => {
	if (secure) {
		wss = new WebSocketServer({ perMessageDeflate: false, server: createServer({
			key: await fs.readFile('./key.pem'),
			cert: await fs.readFile('./cert.pem'),
			perMessageDeflate: false}).listen(port)})
	} else {
		wss = new WebSocketServer({ port: PORT, perMessageDeflate: false})
	}
	console.log('套接字运行中，端口: ', PORT);
}
initWebSocketServer(PORT, SECURE)
// console.log(wss);
let players = 0
const NO_PORT = a => a.split(':')[0].trim();
let BANS = new Set();
const initBans = async (blacklistPath) => {
	const blackList = (await fs.readFile(blacklistPath)).toString().split('\n');
	BANS = new Set([...blackList]);
    for (let ban of blackList) {
        BANS.add(ban);
    }
	console.log("黑名单加载完毕");
};
(async () => {
    await initBans('blacklist.txt');
})();


// .git-credentials 是 Git 的凭证存储文件，用于存储访问远程 Git 存储库所需的用户名和密码等凭据信息。将 ORIGIN 设置为远程 Git 存储库的 URL
let ORIGIN = null;
async function fetchOrigin() {
  try {
    ORIGIN = await (await fs.readFile("../.git-credentials")).toString().trim();
  } catch(e) {
    // 错误处理
  }
}
(async () => {
  await fetchOrigin();
})();
let HIST_LEN = 30
wss.on('connection', async function(p, {headers, url:uri}) {
	console.log('有新的连接！');
	p.ip = p._socket.remoteAddress.split(':',4).join(':')
	// 如果ip地址在黑名单中 则关闭连接
	if (BANS.has(p.ip)) return p.close()
	let url = uri.slice(1)

	let IP = /*p._socket.remoteAddress */url || p.ip 
	// 在某些情况下，IP地址会被IPv6地址中的“％”符号分隔符分隔。
	// 如果连接的IP地址以“％”开头，则这表示客户端连接到了IPv6地址，
	// 因此此IP地址将被添加到黑名单中并关闭连接。
	// 这是为了避免恶意用户使用IPv6地址来规避黑名单。
	if(IP.startsWith("%")){BANS.add(p.ip);fs.appendFile("blacklist.txt","\n"+p.ip);return p.close()} 
	if(!IP)return p.close() 
  p.pHistory = []
	let buf = Buffer.alloc(17)
	buf[0] = 1
	buf.writeUint32BE(0, 1)
	buf.writeUint32BE(0, 5)
	buf.writeUint32BE(WIDTH, 9)
	buf.writeUint32BE(HEIGHT, 13)
	p.send(buf)
  console.log('code = ',buf[0]);
	p.send(runLengthChanges())
  console.log('code = ',runLengthChanges()[0]);
  p.on('message', async function(data) {
    
  })
  p.on('close', function() {
    console.log('连接关闭');
  })
})
let NOW = Date.now()
setInterval(() => {
	NOW = Date.now()
},50)

// import {exec} from 'child_process'
const exec = require('child_process').exec
async function pushImage() {
	for (let i = BOARD.length - 1; i >= 0; i--) { 
		if (CHANGES[i] != 255) {
		 BOARD[i] = CHANGES[i]
		}
	}
	await fs.writeFile('place', BOARD)
	// 目前USE_GIT为false
	if (USE_GIT) {
		await new Promise((r, t) => exec("git commit place -m 'Hourly backup';git push --force " + ORIGIN + "", e => e ? t(e) : r()))
	} else {
		let dte = new Date().toLocaleString().replaceAll('/', '.').replaceAll(', ', '.')
		await fs.copyFile("./PlaceHttpsServer/place", "./PlaceHttpsServer/place." + dte, 0, err => { if (err) { console.log(err); return; }})
		await fs.copyFile("./place", "./PlaceHttpsServer/place", 0, err => { if (err) { console.log(err); return; }})
		await fs.appendFile("./PlaceHttpsServer/backuplist.txt", "\nplace." + dte, err => { if (err) { console.log(err); return; }})
	}
  let curr = new Uint8Array(CHANGES)
  setTimeout(() => {
    for (let i = curr.length - 1; i >= 0; i --) {
      if (curr[i] == CHANGES[i]){ 
        CHANGES[i] = 255
      }
    }
  }, 200e3)
}
setInterval(function() {
  if (!newPos.length) return
  let pos
  let buf = Buffer.alloc(1 + newPos.length * 5)
  buf[0] = 6
  let i = 1
  while ((pos = newPos.pop()) != undefined){
    buf.writeUInt32BE(pos, i)
    i += 4
    buf[i] = newCols.pop()
  }
  for (let c of wss.clients) {
    c.send(buf)
  }
}, 1000)

let I = 0
let bf = Buffer.alloc(131); bf[0] = 3



module.exports = router