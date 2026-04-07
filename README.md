# OpenClaw × Star-Office-UI

把你的 OpenClaw 状态映射到 Star-Office-UI 的像素办公室里：主页加载原项目的 Phaser 场景（`public/static/`），并用 `postMessage` 驱动办公室动画。

## 开发

```bash
pnpm install
pnpm run dev
```

访问：`http://localhost:5173/`

## 构建

```bash
pnpm run build
pnpm run preview
```

## 部署（推荐：Vercel 导入 GitHub）

1) 推送到 GitHub

```bash
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

2) 打开 `https://vercel.com/new` 导入该仓库并部署

## 目录说明

- `public/static/`：来自 Star-Office-UI 的前端与素材
- `src/pages/StarOffice.tsx`：iframe 承载 + OpenClaw 状态桥接

## 许可证

- 本仓库代码：MIT（见 `LICENSE`）
- 第三方：Star-Office-UI 代码 MIT，但其美术资源为非商业用途（见 `THIRD_PARTY_NOTICES.md`）
