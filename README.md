> 著名的刑法学教授、“法外狂徒张三死对头”罗翔老师说过：我们因为无知而读书，而我们读书让我们更加地觉得自己的无知。

### 启动

npm install

npm run dev

本地node服务启动：

cd server

node index

启动8088端口为后端服务端口
### 虚拟列表实现-基础版

url: http://localhost:3001/bigDataBase

列表项高度固定

显示窗口显示10条数据，对大数据进行切片

监听scroll事件计算切片的startIndex和endIndex，更新显示窗口的数据。

### 虚拟列表实现-升级版

url: http://localhost:3001/bigDataPro

在基础版的前提下有以下特点：

1. 列表项高度不固定

### 大体积文件切片上传

url: http://localhost:3001/uploadfile

前端部分：

1. 调用file.slice实现大体积文件切片
2. 使用spark-md5 算法根据文件内容生成文件hash名称，保证文件唯一性
3. 通过web-worker创建一个线程用来计算hahs文件名的生成，不影响主线程
4. 通过request.abort方法可以暂停正在上传的接口

后端部分：

1. 使用multiparty模块将接收到的切片文件暂存在target文件夹下
2. 使用 fs.createWriteStream 创建一个可写流，通过 fs.createReadStream 创建可读流，传输合并到目标文件中。

功能：

1. 大体积文件切片上传
2. 断点传续
3. 文件秒传