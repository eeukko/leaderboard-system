const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Member = require('../models/Member');

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'server/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 限制
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('只支持图片文件！'));
    }
});

// 获取榜单的所有成员
router.get('/', async (req, res) => {
    try {
        const { leaderboardId } = req.query;
        if (!leaderboardId) {
            return res.status(400).json({ message: '缺少 leaderboardId 参数' });
        }

        const members = await Member.find({ leaderboardId })
            .sort({ rankName: 1, order: 1 });

        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 添加成员（含头像上传）
router.post('/', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '请上传头像' });
        }

        const avatarPath = '/uploads/' + req.file.filename;

        const member = new Member({
            leaderboardId: req.body.leaderboardId,
            name: req.body.name,
            avatarPath: avatarPath,
            rankName: req.body.rankName,
            order: req.body.order || 0
        });

        const newMember = await member.save();
        res.status(201).json(newMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 更新成员信息（移动等级、排序）
router.put('/:id', async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: '成员不存在' });
        }

        if (req.body.name) member.name = req.body.name;
        if (req.body.rankName) member.rankName = req.body.rankName;
        if (req.body.order !== undefined) member.order = req.body.order;

        const updatedMember = await member.save();
        res.json(updatedMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 批量更新成员排序
router.put('/batch/reorder', async (req, res) => {
    try {
        const { updates } = req.body; // updates: [{ id, rankName, order }, ...]

        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({ message: '无效的更新数据' });
        }

        const promises = updates.map(update =>
            Member.findByIdAndUpdate(
                update.id,
                {
                    rankName: update.rankName,
                    order: update.order
                },
                { new: true }
            )
        );

        const updatedMembers = await Promise.all(promises);
        res.json(updatedMembers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 删除成员
router.delete('/:id', async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: '成员不存在' });
        }

        await Member.findByIdAndDelete(req.params.id);
        res.json({ message: '成员已删除' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
