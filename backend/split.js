const WIDTH = 2000; // 画布宽度
const HEIGHT = 2000; // 画布高度
const REGION_WIDTH = 500; // 区域宽度
const REGION_HEIGHT = 500; // 区域高度
const REGION_X = WIDTH - REGION_WIDTH; // 区域左上角 x 坐标
const REGION_Y = HEIGHT - REGION_HEIGHT; // 区域左上角 y 坐标

const loadFiles = async () => {
  // 读取文件内容
  const data = await fs.readFile('./place', { encoding: 'binary' });

  // 将文件内容转换成 Buffer 对象
  const buffer = Buffer.from(data, 'binary');

  // 取出指定区域的像素数据
  const regionData = [];
  for (let y = REGION_Y; y < REGION_Y + REGION_HEIGHT; y++) {
    for (let x = REGION_X; x < REGION_X + REGION_WIDTH; x++) {
      const index = y * WIDTH + x;
      const colorIndex = buffer.readUInt8(index);
      regionData.push(colorIndex);
    }
  }

  // 将像素数据存储到文件中
  await fs.writeFile('./region_data', Buffer.from(regionData));
};

loadFiles();