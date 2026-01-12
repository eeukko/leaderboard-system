# 多榜单排行系统

一个功能完整的多榜单管理系统，支持创建多个自定义排行榜，每个榜单包含多个等级，可以通过拖拽方式管理成员。

## 功能特点

- 多榜单系统：可以创建多个不同主题的排行榜
- 自定义等级：每个榜单可以自定义等级名称和颜色
- 垂直展示：等级从上到下依次排列
- 拖拽管理：拖动成员头像即可调整等级
- 头像上传：支持上传图片作为成员头像
- 实时统计：显示总人数和各等级人数
- 响应式设计：支持PC和移动端

## 技术栈

- **后端**: Node.js + Express + MongoDB + Multer
- **前端**: 原生 HTML/CSS/JavaScript
- **数据库**: MongoDB

## 安装步骤

### 1. 安装 MongoDB

确保您的系统已安装 MongoDB。

**Windows**:
- 下载并安装 MongoDB Community Edition
- 启动 MongoDB 服务

**Mac**:
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux**:
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 2. 安装项目依赖

在项目根目录运行:

```bash
npm install
```

这将安装以下依赖：
- express: Web 服务器框架
- mongoose: MongoDB 对象模型
- multer: 文件上传中间件
- cors: 跨域资源共享

### 3. 启动服务器

```bash
npm start
```

或使用开发模式（自动重启）：

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动

## 使用指南

### 首页功能

1. **创建榜单**
   - 点击 "创建榜单" 按钮
   - 填写榜单名称和描述
   - 添加自定义等级（名称和颜色）
   - 点击 "创建" 完成

2. **查看榜单列表**
   - 首页显示所有已创建的榜单
   - 每个榜单卡片显示名称、描述、等级数、成员数

3. **进入榜单**
   - 点击榜单卡片的 "进入榜单" 按钮

4. **删除榜单**
   - 点击榜单卡片右上角的 ×  按钮
   - 确认后删除榜单及所有成员

### 榜单详情页功能

1. **添加成员**
   - 选择等级
   - 输入成员昵称
   - 上传头像图片
   - 点击 "添加" 按钮

2. **移动成员**
   - 按住成员头像不放（拖拽）
   - 移动到目标等级区域
   - 松开鼠标完成移动

3. **删除成员**
   - 鼠标悬停在成员头像上
   - 点击右上角的 × 按钮

4. **查看统计**
   - 顶部显示榜单总人数
   - 每个等级标题显示该等级人数

## 项目结构

```
D:\claude code\
├── server/
│   ├── server.js           # Express 服务器入口
│   ├── models/
│   │   ├── Leaderboard.js  # 榜单数据模型
│   │   └── Member.js       # 成员数据模型
│   ├── routes/
│   │   ├── leaderboards.js # 榜单API路由
│   │   └── members.js      # 成员API路由
│   └── uploads/            # 头像存储目录
├── public/
│   ├── index.html          # 首页
│   ├── leaderboard.html    # 榜单详情页
│   ├── css/
│   │   └── styles.css      # 样式文件
│   └── js/
│       ├── index.js        # 首页逻辑
│       └── leaderboard.js  # 榜单页逻辑
├── package.json
└── README.md
```

## API 接口

### 榜单接口

- `GET /api/leaderboards` - 获取所有榜单
- `GET /api/leaderboards/:id` - 获取单个榜单
- `POST /api/leaderboards` - 创建榜单
- `PUT /api/leaderboards/:id` - 更新榜单
- `DELETE /api/leaderboards/:id` - 删除榜单

### 成员接口

- `GET /api/members?leaderboardId=xxx` - 获取榜单的所有成员
- `POST /api/members` - 添加成员（multipart/form-data）
- `PUT /api/members/:id` - 更新成员信息
- `DELETE /api/members/:id` - 删除成员

## 数据库配置

默认连接到本地 MongoDB:
```
mongodb://localhost:27017/leaderboard-system
```

如需修改，请在 `server/server.js` 中更改 `MONGODB_URI` 变量。

## 部署到生产环境

### 1. 设置环境变量

```bash
export PORT=3000
export MONGODB_URI=mongodb://your-mongodb-server/leaderboard-system
```

### 2. 使用 PM2 管理进程

```bash
npm install -g pm2
pm2 start server/server.js --name leaderboard-system
pm2 save
pm2 startup
```

### 3. 配置反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 常见问题

### MongoDB 连接失败

- 确保 MongoDB 服务已启动
- 检查连接字符串是否正确
- 检查防火墙设置

### 头像上传失败

- 确保 `server/uploads/` 目录存在且有写入权限
- 检查文件大小限制（默认5MB）
- 确保文件格式正确（jpg/png/gif/webp）

### 端口被占用

修改 `server/server.js` 中的 `PORT` 变量，或设置环境变量：

```bash
PORT=8080 npm start
```

## 许可证

ISC

## 作者

Claude Code System

## 贡献

欢迎提交 Issue 和 Pull Request！
