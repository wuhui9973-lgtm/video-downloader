"""
全能视频下载器 - FastAPI 后端
支持抖音、快手、小红书、B站、西瓜视频、微博等平台
"""

import os
import re
import json
import asyncio
from typing import Optional
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import yt_dlp

# 创建 FastAPI 应用
app = FastAPI(title="全能视频下载器 API", version="1.0.0")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境建议指定具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求模型
class DownloadRequest(BaseModel):
    url: str

# 创建下载目录
DOWNLOAD_DIR = "/tmp/downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# 平台检测函数
def detect_platform(url: str) -> Optional[str]:
    """检测URL所属平台"""
    patterns = {
        "douyin": [r"douyin\.com", r"v\.douyin\.com", r"iesdouyin\.com"],
        "kuaishou": [r"kuaishou\.com", r"v\.kuaishou\.com"],
        "xiaohongshu": [r"xiaohongshu\.com", r"xhslink\.com"],
        "bilibili": [r"bilibili\.com", r"b23\.tv"],
        "xigua": [r"ixigua\.com", r"v\.ixigua\.com"],
        "weibo": [r"weibo\.com", r"weibo\.tv"],
    }
    
    for platform, pattern_list in patterns.items():
        for pattern in pattern_list:
            if re.search(pattern, url, re.IGNORECASE):
                return platform
    return None


def get_ytdlp_options(format_str: str = "best", output_template: str = None):
    """获取 yt-dlp 配置选项"""
    if output_template is None:
        output_template = os.path.join(DOWNLOAD_DIR, "%(id)s.%(ext)s")
    
    return {
        'format': format_str,
        'outtmpl': output_template,
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        # 跳过HTTPS检查（某些平台）
        'nocheckcertificate': True,
        # 网络选项
        'socket_timeout': 30,
        # 重试次数
        'retries': 3,
    }


@app.get("/")
async def root():
    """健康检查"""
    return {"status": "ok", "message": "全能视频下载器 API 运行中"}


@app.post("/api/download")
async def download_video(request: DownloadRequest):
    """
    解析视频信息
    返回视频标题、封面、时长、下载链接等信息
    """
    url = request.url.strip()
    
    if not url:
        raise HTTPException(status_code=400, detail="URL不能为空")
    
    # 检测平台
    platform = detect_platform(url)
    if not platform:
        raise HTTPException(
            status_code=400, 
            detail="不支持该平台，支持：抖音、快手、小红书、B站、西瓜视频、微博"
        )
    
    # yt-dlp 配置
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'nocheckcertificate': True,
        'socket_timeout': 30,
        'retries': 3,
        # 获取所有格式信息
        'dump_single_json': True,
    }
    
    try:
        # 使用yt-dlp获取视频信息
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
        
        if not info:
            raise HTTPException(status_code=404, detail="无法获取视频信息")
        
        # 构建响应数据
        formats = []
        
        # 提取formats信息
        if 'formats' in info:
            for f in info['formats']:
                if f.get('vcodec') != 'none' and f.get('ext') == 'mp4':
                    formats.append({
                        'format_id': f.get('format_id', ''),
                        'quality': f.get('format_note', '未知'),
                        'ext': f.get('ext', 'mp4'),
                        'file_size': f.get('filesize') or f.get('size') or 0,
                        'url': f.get('url', ''),
                        'width': f.get('width'),
                        'height': f.get('height'),
                    })
        
        # 去重并排序（按分辨率）
        seen = set()
        unique_formats = []
        for f in formats:
            height = f.get('height', 0)
            if height not in seen:
                seen.add(height)
                unique_formats.append(f)
        
        unique_formats.sort(key=lambda x: x.get('height', 0) or 0, reverse=True)
        
        # 取最佳格式的URL作为默认下载链接
        download_url = ""
        quality = "未知"
        file_size = 0
        
        if unique_formats:
            best = unique_formats[0]
            download_url = best['url']
            quality = best['quality']
            file_size = best['file_size']
        
        response = {
            "success": True,
            "platform": platform,
            "title": info.get('title', '未知标题'),
            "author": info.get('uploader') or info.get('nickname') or '',
            "thumbnail": info.get('thumbnail', ''),
            "duration": info.get('duration', 0),
            "description": info.get('description', ''),
            "download_url": download_url,
            "quality": quality,
            "file_size": file_size,
            "formats": unique_formats[:5],  # 最多返回5个格式选项
        }
        
        return response
        
    except yt_dlp.utils.DownloadError as e:
        raise HTTPException(status_code=500, detail=f"下载解析失败: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"服务器错误: {str(e)}")


@app.get("/api/info")
async def get_video_info(url: str):
    """
    简单获取视频信息（用于预览）
    """
    request = DownloadRequest(url=url)
    return await download_video(request)


# 启动命令
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
