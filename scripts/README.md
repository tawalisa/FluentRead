# FluentRead 打包脚本使用说明

## 📦 快速开始

### 一键打包（最简单）

```bash
# 使用 pnpm
pnpm pack

# 或直接使用 node
node scripts/pack.cjs
```

脚本会自动：
1. ✅ 检查是否需要构建
2. ✅ 查找 Chrome 浏览器
3. ✅ 打包生成 CRX 文件
4. ✅ 显示安装说明

---

## 🎯 输出位置

- **CRX 文件**: `.output/chrome-mv3.crx` (约 954 KB)
- **私钥文件**: `.output/chrome-mv3/key.pem`

---

## 📝 完整流程

### 方法 1: 自动打包（推荐）

```bash
# 一条命令搞定所有
pnpm pack
```

### 方法 2: 分步执行

```bash
# 1. 先构建
pnpm build

# 2. 再打包
pnpm pack
```

---

## 🔧 脚本功能

### 自动化特性

1. **智能检测**
   - 检查构建产物是否存在
   - 如果不存在，自动执行 `pnpm build`
   - 验证 manifest.json 文件

2. **跨平台支持**
   - Windows: 自动查找 Chrome 安装路径
   - macOS: 支持 Applications 目录
   - Linux: 支持常见安装路径

3. **错误处理**
   - 找不到 Chrome 时提供手动打包指南
   - 构建失败时显示详细错误信息
   - 打包失败时提供备选方案

---

## 💡 常见问题

### Q1: 提示找不到 Chrome 浏览器

**解决方案：**

1. 确保已安装 Google Chrome
2. 如果是非标准路径安装，可以修改脚本中的 `findChromePath()` 函数

或者手动打包：
```bash
pnpm build
powershell -ExecutionPolicy Bypass -File ./pack-crx.ps1
```

### Q2: 想要重新构建

```bash
# 删除旧的构建产物
rm -rf .output

# 重新构建并打包
pnpm build
pnpm pack
```

### Q3: 更新扩展版本

```bash
# 1. 修改 package.json 中的 version
# 2. 重新打包（会自动使用之前的私钥）
pnpm pack
```

---

## 🚀 安装 CRX 文件

### 方法 1: 拖拽安装（推荐）

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 将 `.output/chrome-mv3.crx` 拖到页面中
5. 点击"添加扩展程序"

### 方法 2: 加载已解压的扩展

1. 访问 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `.output/chrome-mv3` 文件夹

---

## ⚠️ 重要提示

### 私钥文件管理

- **位置**: `.output/chrome-mv3/key.pem`
- **用途**: 签名扩展程序，保证更新连续性
- **注意**: 
  - ⚠️ 不要丢失此文件
  - ⚠️ 不要提交到 Git 仓库
  - ⚠️ 每次更新版本都要使用相同的私钥

### Git 忽略配置

确保 `.gitignore` 包含：

```gitignore
.output/
node_modules/
*.pem
```

---

## 📊 文件大小参考

| 文件类型 | 大小 | 说明 |
|---------|------|------|
| 源代码 | ~6 MB | 包含依赖 |
| 构建产物 | ~1.97 MB | 优化后 |
| CRX 安装包 | ~954 KB | 最终发布 |

---

## 🛠️ 高级用法

### 自定义输出路径

编辑 `scripts/pack.cjs`，修改 CONFIG 对象：

```javascript
const CONFIG = {
  extensionDir: '/your/custom/path',
  outputPath: '/your/output/path',
  crxFile: '/your/output/extension.crx',
};
```

### 查看调试信息

```bash
# 启用 Node.js 详细输出
NODE_DEBUG=child_process node scripts/pack.cjs
```

---

## 📞 需要帮助？

如果遇到问题：

1. 检查控制台输出的错误信息
2. 查看项目文档：https://fluent.thinkstu.com/
3. 参考 GitHub Issues

---

**最后更新**: 2026-03-09
