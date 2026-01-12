const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const leaderboardsRouter = require('./routes/leaderboards');
const membersRouter = require('./routes/members');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB 连接配置（从环境变量读取，生产环境安全）
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://xizhiduan:Caroline.@cluster0.ey2nq69.mongodb.net/leaderboard-system?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ MongoDB 连接成功'))
.catch(err => console.error('❌ MongoDB 连接失败:', err));

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 路由
app.use('/api/leaderboards', leaderboardsRouter);
app.use('/api/members', membersRouter);

// 首页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 榜单详情页路由
app.get('/leaderboard/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/leaderboard.html'));
});

// 404 处理
app.use((req, res) => {
    res.status(404).json({ message: '路由不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '服务器错误', error: err.message });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📦 API 端点: http://localhost:${PORT}/api`);
});
