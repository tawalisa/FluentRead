# FluentRead 扩展打包指南

## 📦 快速打包（推荐）

### 一键生成 CRX 文件

```bash
# 使用 pnpm 命令
pnpm pack

# 或者直接运行脚本
powershell -ExecutionPolicy Bypass -File ./pack-crx.ps1
```

**输出位置：** `.output/chrome-mv3.crx` (约 954 KB)

---

## 🔧 完整流程

### 1. 构建扩展

```bash
# 安装依赖（首次运行）
pnpm install

# 构建生产版本
pnpm build
```

构建成功后会输出到 `.output/chrome-mv3/` 目录

### 2. 打包成 CRX

```bash
# 运行打包脚本
pnpm pack
```

脚本会自动：
- ✅ 检查 Chrome 浏览器是否安装
- ✅ 验证构建产物是否完整
- ✅ 调用 Chrome 打包生成 CRX
- ✅ 生成私钥文件（key.pem）用于下次更新

---

## 📌 手动打包方法

如果自动脚本失败，可以手动操作：

### 步骤：

1. **打开 Chrome 浏览器**

2. **访问扩展管理页面**
   ```
   chrome://extensions/
   ```

3. **开启开发者模式**
   - 点击页面右上角的"开发者模式"开关

4. **点击"打包扩展程序"**
   - 会出现一个对话框

5. **输入扩展程序目录**
   ```
   D:\code\FluentRead\.output\chrome-mv3
   ```

6. **点击"打包扩展程序"按钮**
   - Chrome 会生成 CRX 文件和 PEM 私钥文件
   - CRX 文件默认保存在 `.output/` 目录

---

## 🚀 安装 CRX 文件

### 方法 1：拖拽安装（最简单）

1. 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 将 `.output/chrome-mv3.crx` 文件拖拽到扩展页面
4. 点击"添加扩展程序"

### 方法 2：加载已解压的扩展

1. 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `.output\chrome-mv3` 文件夹

---

## 💡 重要提示

### 私钥文件（key.pem）

- **作用：** 用于签名扩展程序，确保更新时的连续性
- **位置：** `.output/chrome-mv3/key.pem`
- **注意：** 
  - ⚠️ 不要丢失私钥文件
  - ⚠️ 每次更新扩展版本时都要使用相同的私钥
  - ⚠️ 不要将私钥提交到公开仓库

### 版本更新

当需要更新扩展时：

1. 修改 `package.json` 中的版本号
2. 重新运行 `pnpm build`
3. 使用相同的私钥重新打包：
   ```bash
   # 脚本会自动使用已有的 key.pem
   pnpm pack
   ```

---

## 🎯 不同浏览器的打包

### Chrome / Edge

```bash
pnpm build
pnpm pack
```

### Firefox

```bash
# Firefox 使用 XPI 格式
pnpm build:firefox
pnpm zip:firefox
```

Firefox 包位置：`.output/firefox-mv3/`

---

## 📊 文件大小

| 文件类型 | 大小 | 说明 |
|---------|------|------|
| 源代码 | ~6 MB | 包含所有依赖 |
| 构建产物 | ~1.97 MB | 压缩优化后 |
| CRX 文件 | ~954 KB | 最终安装包 |

---

## 🔍 故障排查

### 问题 1：找不到 Chrome 浏览器

**解决：**
- 确保已安装 Google Chrome
- 检查默认安装路径是否有 `chrome.exe`

### 问题 2：CRX 文件无法安装

**可能原因：**
- Chrome 版本过低
- 扩展清单（manifest）版本不兼容

**解决：**
- 更新 Chrome 到最新版本
- 检查 `.output/chrome-mv3/manifest.json`

### 问题 3：打包后功能异常

**检查：**
1. 确认构建过程无错误
2. 查看浏览器控制台的错误日志
3. 在开发模式下测试：`pnpm dev`

---

## 📝 发布到应用商店

### Chrome Web Store

1. 访问 [Chrome 开发者仪表板](https://chrome.google.com/webstore/devconsole)
2. 支付一次性注册费（$5）
3. 上传 CRX 文件
4. 填写扩展信息、截图等
5. 提交审核

### Microsoft Edge Add-ons

1. 访问 [Microsoft Edge 加载项](https://partner.microsoft.com/en-us/dashboard/microsoftedge/begin)
2. 注册开发者账号
3. 上传 CRX 或 ZIP 文件
4. 填写相关信息
5. 提交审核

---

## 🛠️ 高级选项

### 自定义输出路径

```bash
.\pack-crx.ps1 -extensionDir ".output\chrome-mv3" -outputPath "dist"
```

### 查看帮助

```bash
.\pack-crx.ps1 -Help
```

---

## 📞 需要帮助？

如果遇到问题：

1. 检查构建日志
2. 查看浏览器开发者工具的控制台
3. 参考项目文档：https://fluent.thinkstu.com/

---

**最后更新：** 2026-03-09
