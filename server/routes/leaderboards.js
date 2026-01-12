const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const Member = require('../models/Member');

// 获取所有榜单
router.get('/', async (req, res) => {
    try {
        const leaderboards = await Leaderboard.find().sort({ createdAt: -1 });

        // 为每个榜单计算成员总数
        const leaderboardsWithCount = await Promise.all(
            leaderboards.map(async (lb) => {
                const count = await Member.countDocuments({ leaderboardId: lb._id });
                return {
                    ...lb.toObject(),
                    memberCount: count
                };
            })
        );

        res.json(leaderboardsWithCount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 获取单个榜单详情
router.get('/:id', async (req, res) => {
    try {
        const leaderboard = await Leaderboard.findById(req.params.id);
        if (!leaderboard) {
            return res.status(404).json({ message: '榜单不存在' });
        }
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 创建新榜单
router.post('/', async (req, res) => {
    const leaderboard = new Leaderboard({
        name: req.body.name,
        description: req.body.description,
        ranks: req.body.ranks || []
    });

    try {
        const newLeaderboard = await leaderboard.save();
        res.status(201).json(newLeaderboard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 更新榜单
router.put('/:id', async (req, res) => {
    try {
        const leaderboard = await Leaderboard.findById(req.params.id);
        if (!leaderboard) {
            return res.status(404).json({ message: '榜单不存在' });
        }

        if (req.body.name) leaderboard.name = req.body.name;
        if (req.body.description !== undefined) leaderboard.description = req.body.description;
        if (req.body.ranks) leaderboard.ranks = req.body.ranks;

        const updatedLeaderboard = await leaderboard.save();
        res.json(updatedLeaderboard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 删除榜单
router.delete('/:id', async (req, res) => {
    try {
        const leaderboard = await Leaderboard.findById(req.params.id);
        if (!leaderboard) {
            return res.status(404).json({ message: '榜单不存在' });
        }

        // 同时删除该榜单的所有成员
        await Member.deleteMany({ leaderboardId: req.params.id });
        await Leaderboard.findByIdAndDelete(req.params.id);

        res.json({ message: '榜单已删除' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
