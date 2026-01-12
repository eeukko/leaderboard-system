const API_URL = '/api';

// DOM 元素
const createBtn = document.getElementById('createBtn');
const createModal = document.getElementById('createModal');
const modalClose = document.getElementById('modalClose');
const cancelBtn = document.getElementById('cancelBtn');
const submitBtn = document.getElementById('submitBtn');
const addRankBtn = document.getElementById('addRankBtn');
const ranksContainer = document.getElementById('ranksContainer');
const leaderboardsGrid = document.getElementById('leaderboardsGrid');

// 页面加载时获取所有榜单
document.addEventListener('DOMContentLoaded', loadLeaderboards);

// 打开创建榜单弹窗
createBtn.addEventListener('click', () => {
    createModal.style.display = 'flex';
});

// 关闭弹窗
modalClose.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// 点击弹窗外部关闭
createModal.addEventListener('click', (e) => {
    if (e.target === createModal) {
        closeModal();
    }
});

function closeModal() {
    createModal.style.display = 'none';
    resetForm();
}

// 添加等级输入
addRankBtn.addEventListener('click', () => {
    const rankInput = document.createElement('div');
    rankInput.className = 'rank-input';
    rankInput.innerHTML = `
        <input type="text" placeholder="等级名称" class="rank-name">
        <input type="color" class="rank-color" value="#${Math.floor(Math.random()*16777215).toString(16)}">
        <button type="button" class="btn-remove-rank" onclick="removeRank(this)">×</button>
    `;
    ranksContainer.appendChild(rankInput);
});

// 删除等级输入
function removeRank(button) {
    button.parentElement.remove();
}

// 提交创建榜单
submitBtn.addEventListener('click', async () => {
    const name = document.getElementById('lbName').value.trim();
    const description = document.getElementById('lbDescription').value.trim();

    if (!name) {
        alert('请输入榜单名称！');
        return;
    }

    // 收集等级信息
    const rankInputs = ranksContainer.querySelectorAll('.rank-input');
    const ranks = Array.from(rankInputs).map((input, index) => {
        const rankName = input.querySelector('.rank-name').value.trim();
        const rankColor = input.querySelector('.rank-color').value;

        if (!rankName) {
            return null;
        }

        return {
            name: rankName,
            color: rankColor,
            order: index
        };
    }).filter(rank => rank !== null);

    if (ranks.length === 0) {
        alert('请至少添加一个等级！');
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = '创建中...';

        const response = await fetch(`${API_URL}/leaderboards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description, ranks })
        });

        if (response.ok) {
            closeModal();
            loadLeaderboards();
            showNotification('榜单创建成功！');
        } else {
            const error = await response.json();
            alert('创建失败: ' + error.message);
        }
    } catch (error) {
        alert('创建失败: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '创建';
    }
});

// 重置表单
function resetForm() {
    document.getElementById('lbName').value = '';
    document.getElementById('lbDescription').value = '';

    // 重置等级输入为一个
    ranksContainer.innerHTML = `
        <div class="rank-input">
            <input type="text" placeholder="等级名称" class="rank-name" value="夯爆了">
            <input type="color" class="rank-color" value="#f093fb">
            <button type="button" class="btn-remove-rank" disabled>×</button>
        </div>
    `;
}

// 加载所有榜单
async function loadLeaderboards() {
    try {
        const response = await fetch(`${API_URL}/leaderboards`);
        const leaderboards = await response.json();

        if (leaderboards.length === 0) {
            leaderboardsGrid.innerHTML = '<div class="empty-state">还没有榜单，点击上方按钮创建一个吧！</div>';
            return;
        }

        leaderboardsGrid.innerHTML = leaderboards.map(lb => `
            <div class="leaderboard-card">
                <button class="btn-delete-lb" onclick="deleteLeaderboard('${lb._id}')">×</button>
                <h3>${lb.name}</h3>
                <p class="lb-description">${lb.description || '暂无描述'}</p>
                <div class="lb-stats">
                    <span>${lb.ranks.length} 个等级</span>
                    <span>${lb.memberCount || 0} 人</span>
                </div>
                <button class="btn-enter" onclick="enterLeaderboard('${lb._id}')">进入榜单</button>
            </div>
        `).join('');
    } catch (error) {
        leaderboardsGrid.innerHTML = '<div class="error-state">加载失败，请刷新重试</div>';
        console.error('加载失败:', error);
    }
}

// 进入榜单
function enterLeaderboard(id) {
    window.location.href = `/leaderboard/${id}`;
}

// 删除榜单
async function deleteLeaderboard(id) {
    if (!confirm('确定要删除这个榜单吗？所有成员数据也将被删除！')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/leaderboards/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadLeaderboards();
            showNotification('榜单已删除');
        } else {
            alert('删除失败');
        }
    } catch (error) {
        alert('删除失败: ' + error.message);
    }
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
