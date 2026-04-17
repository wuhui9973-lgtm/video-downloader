/**
 * 全能视频下载器 - 前端逻辑
 * 支持抖音、快手、小红书、B站、西瓜视频、微博
 */

const API_BASE = 'https://your-backend-url.railway.app'; // 替换为你的Railway后端地址

// DOM元素
const videoUrlInput = document.getElementById('videoUrl');
const parseBtn = document.getElementById('parseBtn');
const loadingEl = document.getElementById('loading');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');
const platformIcons = document.getElementById('platformIcons');

// 平台配置
const platforms = {
    douyin: { name: '抖音', patterns: [/douyin\.com/, /v\.douyin\.com/, /iesdouyin\.com/] },
    kuaishou: { name: '快手', patterns: [/kuaishou\.com/, /v\.kuaishou\.com/] },
    xiaohongshu: { name: '小红书', patterns: [/xiaohongshu\.com/, /xhslink\.com/] },
    bilibili: { name: 'B站', patterns: [/bilibili\.com/, /b23\.tv/] },
    xigua: { name: '西瓜视频', patterns: [/ixigua\.com/, /v\.ixigua\.com/] },
    weibo: { name: '微博', patterns: [/weibo\.com/, /weibo\.tv/] }
};

// 检测平台
function detectPlatform(url) {
    for (const [key, platform] of Object.entries(platforms)) {
        for (const pattern of platform.patterns) {
            if (pattern.test(url)) {
                return { key, ...platform };
            }
        }
    }
    return null;
}

// 更新平台图标高亮
function updatePlatformIcons(platformKey) {
    document.querySelectorAll('.platform-icon').forEach(icon => {
        icon.classList.toggle('active', icon.dataset.platform === platformKey);
    });
}

// 格式化文件大小
function formatSize(bytes) {
    if (!bytes || bytes === 'N/A') return '未知大小';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
        return (mb / 1024).toFixed(2) + ' GB';
    }
    return mb.toFixed(2) + ' MB';
}

// 格式化时长
function formatDuration(seconds) {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 显示结果
function showResult(data) {
    hideAll();
    resultSection.style.display = 'block';

    // 设置视频信息
    document.getElementById('videoCover').src = data.thumbnail || '';
    document.getElementById('videoCover').onerror = function() {
        this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect fill="%23334155" width="160" height="100"/><text x="80" y="50" text-anchor="middle" fill="%2394a3b8" font-size="12">暂无封面</text></svg>';
    };
    
    document.getElementById('videoTitle').textContent = data.title || '未知标题';
    document.getElementById('videoAuthor').textContent = data.author ? `作者：${data.author}` : '';
    document.getElementById('videoDuration').textContent = formatDuration(data.duration);
    
    const badge = document.getElementById('platformBadge');
    badge.textContent = platforms[data.platform]?.name || data.platform || '未知平台';
    
    // 渲染下载选项
    const downloadOptions = document.getElementById('downloadOptions');
    downloadOptions.innerHTML = '';
    
    if (data.formats && data.formats.length > 0) {
        data.formats.forEach((format, index) => {
            const item = document.createElement('div');
            item.className = 'download-item';
            item.innerHTML = `
                <div class="download-info">
                    <span class="quality">${format.quality || '默认画质'}</span>
                    <span class="size">${format.ext || 'mp4'} · ${formatSize(format.file_size)}</span>
                </div>
                <a href="${format.url}" class="btn-download" download target="_blank">
                    ⬇️ 下载
                </a>
            `;
            downloadOptions.appendChild(item);
        });
    } else if (data.download_url) {
        const item = document.createElement('div');
        item.className = 'download-item';
        item.innerHTML = `
            <div class="download-info">
                <span class="quality">${data.quality || '默认画质'}</span>
                <span class="size">${formatSize(data.file_size)}</span>
            </div>
            <a href="${data.download_url}" class="btn-download" download target="_blank">
                ⬇️ 下载
            </a>
        `;
        downloadOptions.appendChild(item);
    }
}

// 显示错误
function showError(message) {
    hideAll();
    errorSection.style.display = 'block';
    document.getElementById('errorText').textContent = message;
}

// 隐藏所有
function hideAll() {
    loadingEl.classList.remove('active');
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';
}

// 解析视频
async function parseVideo() {
    const url = videoUrlInput.value.trim();
    
    if (!url) {
        showError('请输入视频链接');
        return;
    }
    
    const platform = detectPlatform(url);
    if (!platform) {
        showError('不支持该平台，请输入抖音、快手、小红书、B站、西瓜视频或微博链接');
        return;
    }
    
    hideAll();
    loadingEl.classList.add('active');
    parseBtn.disabled = true;
    updatePlatformIcons(platform.key);
    
    try {
        const response = await fetch(`${API_BASE}/api/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || '解析失败');
        }
        
        showResult(data);
    } catch (error) {
        console.error('解析错误:', error);
        showError(error.message || '解析失败，请检查链接是否正确');
    } finally {
        parseBtn.disabled = false;
    }
}

// 粘贴事件
videoUrlInput.addEventListener('paste', (e) => {
    setTimeout(() => {
        const url = videoUrlInput.value.trim();
        const platform = detectPlatform(url);
        if (platform) {
            updatePlatformIcons(platform.key);
        }
    }, 100);
});

// 输入事件 - 实时检测平台
videoUrlInput.addEventListener('input', () => {
    const url = videoUrlInput.value.trim();
    const platform = detectPlatform(url);
    if (platform) {
        updatePlatformIcons(platform.key);
    } else {
        document.querySelectorAll('.platform-icon').forEach(icon => {
            icon.classList.remove('active');
        });
    }
});

// 解析按钮
parseBtn.addEventListener('click', parseVideo);

// 回车键解析
videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        parseVideo();
    }
});

// 监听输入框获得焦点时的占位提示
videoUrlInput.addEventListener('focus', () => {
    if (!videoUrlInput.value.trim()) {
        updatePlatformIcons(null);
    }
});

// 初始化 - 检查URL参数
(function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url');
    if (url) {
        videoUrlInput.value = decodeURIComponent(url);
        setTimeout(parseVideo, 500);
    }
})();
