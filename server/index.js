const Controller = require("./controller");
const http = require('http');
const server = http.createServer();

const controller = new Controller();

server.on('request', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === 'OPTIONS') {
    res.status = 200;
    res.end();
    return;
  }
  // 验证内容是否上传过
  if (req.url === "/verify") {
    await controller.handleVerifyUpload(req, res);
    return;
  }
  // 上传切片接口
  if (req.url === "/upload") {
    await controller.handleFormData(req, res);
  }
  // 所有切片上传完成，通知后端合并切片接口
  if (req.url === "/merge") {
    await controller.handleMerge(req, res);
    return;
  }
})

server.listen(8088, () => console.log("正在监听 8088 端口"));