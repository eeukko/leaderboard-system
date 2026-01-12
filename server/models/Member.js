const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    leaderboardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Leaderboard',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    avatarPath: {
        type: String,
        required: true
    },
    rankName: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// 创建索引以提高查询性能
memberSchema.index({ leaderboardId: 1, rankName: 1, order: 1 });

module.exports = mongoose.model('Member', memberSchema);
