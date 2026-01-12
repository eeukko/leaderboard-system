const API_URL = '/api';
let currentLeaderboard = null;
let members = [];
let draggedMember = null;

// 获取榜单 ID
const leaderboardId = window.location.pathname.split('/').pop();

// DOM 元素
const lbTitle = document.getElementById('lbTitle');
const totalCount = document.getElementById('totalCount');
const rankSelect = document.getElementById('rankSelect');
const addMemberForm = document.getElementById('addMemberForm');
const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
const ranksContainer = document.getElementById('ranksContainer');

// 页面加载
document.addEventListener('DOMContentLoaded', init);

async function init() {
    await loadLeaderboard();
    await loadMembers();
    setupEventListeners();
}

// 设置事件监听
function setupEventListeners() {
    // 头像预览
    avatarInput.addEventListener('change', handleAvatarPreview);

    // 提交表单
    addMemberForm.addEventListener('submit', handleAddMember);
}

// 返回首页
function goBack() {
    window.location.href = '/';
}

// 加载榜单信息
async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/leaderboards/${leaderboardId}`);
        currentLeaderboard = await response.json();

        lbTitle.textContent = currentLeaderboard.name;

        // 填充等级选择框
        rankSelect.innerHTML = currentLeaderboard.ranks.map(rank =>
            `<option value="${rank.name}">${rank.name}</option>`
        ).join('');

    } catch (error) {
        alert('加载榜单失败');
        console.error(error);
    }
}

// 加载成员
async function loadMembers() {
    try {
        const response = await fetch(`${API_URL}/members?leaderboardId=${leaderboardId}`);
        members = await response.json();

        renderRanks();
        updateStatistics();
    } catch (error) {
        console.error('加载成员失败:', error);
    }
}

// 渲染等级区域（垂直排列）
function renderRanks() {
    if (!currentLeaderboard) return;

    ranksContainer.innerHTML = currentLeaderboard.ranks.map(rank => {
        const rankMembers = members.filter(m => m.rankName === rank.name);

        return `
            <div class="rank-zone" data-rank="${rank.name}" style="--rank-color: ${rank.color}">
                <div class="rank-header">
                    <h2>${rank.name}</h2>
                    <span class="rank-count">${rankMembers.length} 人</span>
                </div>
                <div class="members-area" data-rank="${rank.name}">
                    ${rankMembers.length === 0
                        ? '<div class="empty-hint">拖动成员到这里</div>'
                        : renderMembers(rankMembers)
                    }
                </div>
            </div>
        `;
    }).join('');

    setupDragDropListeners();
}

// 渲染成员列表
function renderMembers(rankMembers) {
    return rankMembers.map(member => `
        <div class="member-item" draggable="true" data-member-id="${member._id}">
            <button class="btn-delete-member" onclick="deleteMember('${member._id}')">×</button>
            <div class="member-avatar">
                <img src="${member.avatarPath}" alt="${member.name}">
            </div>
            <div class="member-name">${member.name}</div>
        </div>
    `).join('');
}

// 设置拖拽监听
function setupDragDropListeners() {
    const memberItems = document.querySelectorAll('.member-item');
    const membersAreas = document.querySelectorAll('.members-area');

    // 成员拖拽
    memberItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    // 区域接收
    membersAreas.forEach(area => {
        area.addEventListener('dragover', handleDragOver);
        area.addEventListener('drop', handleDrop);
        area.addEventListener('dragenter', handleDragEnter);
        area.addEventListener('dragleave', handleDragLeave);
    });
}

// 拖拽开始
function handleDragStart(e) {
    draggedMember = {
        id: this.dataset.memberId,
        element: this
    };
    this.classList.add('dragging');
}

// 拖拽结束
function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedMember = null;
}

// 拖拽经过
function handleDragOver(e) {
    e.preventDefault();
}

// 拖拽进入
function handleDragEnter(e) {
    if (e.target.classList.contains('members-area')) {
        e.target.classList.add('drag-over');
    }
}

// 拖拽离开
function handleDragLeave(e) {
    if (e.target.classList.contains('members-area')) {
        e.target.classList.remove('drag-over');
    }
}

// 放下
async function handleDrop(e) {
    e.preventDefault();

    if (!draggedMember) return;

    const targetRank = this.dataset.rank;
    this.classList.remove('drag-over');

    // 找到被拖拽的成员
    const member = members.find(m => m._id === draggedMember.id);
    if (!member) return;

    // 如果等级没变，不做操作
    if (member.rankName === targetRank) return;

    // 更新成员等级
    try {
        const response = await fetch(`${API_URL}/members/${member._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rankName: targetRank
            })
        });

        if (response.ok) {
            await loadMembers();
            showNotification(`已移动到 ${targetRank}`);
        }
    } catch (error) {
        alert('移动失败: ' + error.message);
    }
}

// 头像预览
function handleAvatarPreview(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        avatarPreview.innerHTML = `<img src="${e.target.result}" alt="预览">`;
    };
    reader.readAsDataURL(file);
}

// 添加成员
async function handleAddMember(e) {
    e.preventDefault();

    const rankName = rankSelect.value;
    const memberName = document.getElementById('memberName').value.trim();
    const avatarFile = avatarInput.files[0];

    if (!rankName || !memberName || !avatarFile) {
        alert('请填写完整信息！');
        return;
    }

    // 构建 FormData
    const formData = new FormData();
    formData.append('leaderboardId', leaderboardId);
    formData.append('name', memberName);
    formData.append('rankName', rankName);
    formData.append('avatar', avatarFile);

    try {
        const submitBtn = addMemberForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = '添加中...';

        const response = await fetch(`${API_URL}/members`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            await loadMembers();
            addMemberForm.reset();
            avatarPreview.innerHTML = '<span class="preview-text">预览</span>';
            showNotification('添加成功！');
        } else {
            const error = await response.json();
            alert('添加失败: ' + error.message);
        }
    } catch (error) {
        alert('添加失败: ' + error.message);
    } finally {
        const submitBtn = addMemberForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = '添加';
    }
}

// 删除成员
async function deleteMember(memberId) {
    if (!confirm('确定要删除这个成员吗？')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/members/${memberId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadMembers();
            showNotification('删除成功');
        } else {
            alert('删除失败');
        }
    } catch (error) {
        alert('删除失败: ' + error.message);
    }
}

// 更新统计
function updateStatistics() {
    totalCount.textContent = members.length;
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
