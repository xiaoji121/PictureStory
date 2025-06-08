# 图文秀秀（让照片讲故事，让回忆更生动）

本工具能够替你解决以下问题：

- 幼儿园老师每个月都会下发孩子的成长手册，家长往上面贴照片，配文字，记录孩子的成长
- 家长找到几张孩子的高光时刻照片，用美图秀秀拼成一张图片，然后打印出来贴到成长手册上，再自己写上一段话
- 这些工作费时费力费脑筋
- 有了这个工具，你无需再用美图拼图，也不用自己想文案
- 选择几张照片，点一个按钮，拼图和文案都自动帮你生成好了
- 你只需要将生成好的图片截图即可
- 既可以分享到朋友圈，也可以打印出来贴到孩子的成长手册上

---

本项目是一个基于 React + Ant Design + Google Gemini API 的 AI 图文纪念品创作工具。用户可上传照片，AI 自动生成故事文案，并可一键导出精美图片。

---

## 主要功能

- 支持本地图片上传（最多4张，单张最大50MB，支持JPEG/PNG/GIF/WebP）
- AI（Google Gemini）自动生成多风格故事文案
- 作品预览区高清展示图片和文案
- 一键导出作品为图片（或直接截图）
- 响应式设计，适配多端

---

## 本地运行

### 1. 环境要求

- Node.js 16 及以上
- 推荐使用 Chrome 浏览器

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

项目依赖 Google Gemini API，需要配置 API Key。

1. 在项目根目录下新建 `.env.local` 文件（如不存在）。
2. 添加如下内容：

```
GEMINI_API_KEY=你的Google Gemini API Key
```

> **注意：**  
> - 你可以在 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取 API Key。
> - 请勿将 API Key 泄露到公共仓库。

### 4. 启动开发环境

```bash
npm run dev
```

访问 http://localhost:5173 （或终端输出的端口）即可体验。

---

## 目录结构

```
.
├── components/           # 主要React组件
├── services/             # AI服务相关代码
├── public/               # 静态资源（如背景图）
├── index.jsx             # 入口文件
├── App.jsx               # 主应用
├── constants.js          # 常量配置
├── vite.config.js        # Vite配置
├── README.md             # 项目说明
└── ...
```

---

## 常见问题

### 1. 图片无法预览或模糊？

- 组件已优化为本地高清预览，若仍有问题请确保浏览器支持 `URL.createObjectURL`。

### 2. AI 生成失败？

- 请检查 `.env.local` 中的 `GEMINI_API_KEY` 是否正确。
- 网络需能访问 Google Gemini API。

### 3. 导出图片不清晰？

- 推荐直接使用系统截图功能，或使用导出按钮（底层基于 html2canvas）。

---

## 依赖技术

- React 19
- Ant Design 5
- Google Gemini API
- browser-image-compression
- Vite

---

## 贡献与反馈

如有建议或 bug，欢迎提 issue 或 PR！

---

如需进一步定制或有其他问题，欢迎联系作者。
