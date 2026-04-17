# 🎬 全能视频下载器

支持 **抖音 / 快手 / 小红书 / B站 / 西瓜视频 / 微博** 的视频下载工具

---

## 📁 项目结构

```
video-downloader/
├── frontend/            # 前端页面
│   ├── index.html       # 主页面
│   ├── style.css        # 样式文件
│   └── app.js           # 前端逻辑
├── backend/             # 后端服务
│   ├── main.py          # FastAPI 主程序
│   └── requirements.txt # Python 依赖
├── Railwayfile          # Railway 部署配置
├── vercel.json          # Vercel 前端配置
└── README.md            # 说明文档
```

---

## 🚀 快速部署

### 第一步：部署后端 (Railway)

Railway 提供 **500小时/月** 免费额度，够10个人正常使用。

1. **注册 Railway 账号**
   - 访问 [railway.app](https://railway.app)
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 `New Project` → `Deploy from GitHub repo`
   - 选择你的 GitHub 仓库（需要先把代码上传到GitHub）

3. **配置环境变量**（可选）
   - Railway 会自动设置 `PORT` 环境变量
   - 不需要额外配置

4. **等待部署完成**
   - Railway 会自动安装依赖（requirements.txt）
   - 部署成功后，会给你一个 URL，如：
   ```
   https://video-downloader-production.up.railway.app
   ```

5. **测试后端**
   - 访问 `https://你的域名.railway.app/` 
   - 应该看到 `{"status":"ok","message":"全能视频下载器 API 运行中"}`

---

### 第二步：部署前端 (Vercel)

Vercel 完全免费，适合静态网站托管。

1. **注册 Vercel 账号**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 `Add New` → `Project`
   - 导入你的 GitHub 仓库
   - Vercel 会自动识别 `vercel.json` 配置

3. **配置环境变量**（可选）
   - 不需要额外配置

4. **修改前端 API 地址**（重要⚠️）
   
   部署前端之前，需要修改 `frontend/app.js` 文件：
   
   ```javascript
   // 找到这一行（约第6行）
   const API_BASE = 'https://your-backend-url.railway.app';
   
   // 改成你的 Railway 后端地址，例如：
   const API_BASE = 'https://video-downloader-production.up.railway.app';
   ```

5. **部署**
   - 点击 `Deploy`
   - 等待 1-2 分钟
   - 获得你的免费域名，如：
   ```
   https://video-downloader.vercel.app
   ```

---

## 📱 使用方法

1. 打开你的网站（Vercel 地址）
2. 粘贴视频链接（支持以下平台）：
   - ✅ 抖音 / TikTok
   - ✅ 快手
   - ✅ 小红书
   - ✅ B站
   - ✅ 西瓜视频
   - ✅ 微博
3. 点击「解析」按钮
4. 等待解析完成，显示视频信息
5. 点击「下载」按钮保存视频

---

## 🔧 本地开发

### 后端本地运行

```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 运行服务
uvicorn main:app --reload --port 8000
```

后端地址：`http://localhost:8000`

### 前端本地运行

直接用浏览器打开 `frontend/index.html` 文件即可。

或者使用 VS Code 的 Live Server 插件：

```bash
# 安装 Live Server 插件后
# 右键 index.html → Open with Live Server
```

---

## 📊 API 接口文档

### 1. 健康检查

```
GET /
```

响应：
```json
{
  "status": "ok",
  "message": "全能视频下载器 API 运行中"
}
```

### 2. 解析视频

```
POST /api/download
Content-Type: application/json

{
  "url": "https://v.douyin.com/xxxxx"
}
```

响应：
```json
{
  "success": true,
  "platform": "douyin",
  "title": "视频标题",
  "author": "作者名称",
  "thumbnail": "封面图URL",
  "duration": 60,
  "download_url": "视频直链",
  "quality": "1080p",
  "file_size": 15234567,
  "formats": [...]
}
```

### 3. 获取视频信息

```
GET /api/info?url=https://v.douyin.com/xxxxx
```

---

## 💰 费用说明

| 服务 | 免费额度 | 备注 |
|------|----------|------|
| Railway | 500小时/月 | 睡眠不计时 |
| Vercel | 无流量限制 | 仅限静态站 |

**10人使用场景：**
- Railway 每月500小时 = 24小时 × 20天 = 480小时 ✅ 够用
- Vercel 完全免费 ✅

---

## ❓ 常见问题

### 1. 解析失败怎么办？

- 检查链接是否正确、完整
- 某些视频可能设置了下载限制
- 尝试更新 yt-dlp：`pip install -U yt-dlp`

### 2. Railway 实例睡眠了？

- 免费版闲置 7 天后会睡眠
- 访问一次 URL 即可唤醒
- 或者关闭睡眠设置（在 Railway 设置中）

### 3. 视频下载太慢？

- 视频直链由各平台提供，速度取决于平台服务器
- 可以考虑搭建自己的 CDN 加速

### 4. 如何上传到 GitHub？

```bash
# 在项目根目录执行
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/video-downloader.git
git push -u origin main
```

---

## 🎯 后续优化建议

1. **添加更多平台** - 参考 yt-dlp 支持的平台列表
2. **添加登录功能** - 使用数据库存储用户信息
3. **添加历史记录** - 记录用户下载历史
4. **添加批量下载** - 一次解析多个链接
5. **添加水印去除** - 针对特定平台

---

## 📄 免责声明

本工具仅供学习交流使用，请勿用于商业用途或下载侵权内容。使用本工具产生的任何法律责任由使用者自行承担。

---

**Made with ❤️ for Boss**
