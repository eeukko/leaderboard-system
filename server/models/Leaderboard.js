const mongoose = require('mongoose');

const rankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    }
});

const leaderboardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    ranks: [rankSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
