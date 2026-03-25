# Ollama 本地翻译配置指南

## ✅ 测试结果

你的 Ollama 本地接口 (`http://localhost:11434/v1/chat/completions`) **工作正常**！

测试用例：
- ✓ "你好，世界" → "Hello, world!"
- ✓ "今天天气很好" → "Today's weather is very pleasant."
- ✓ "我喜欢学习编程" → "I like to learn programming"
- ✓ "这是一个测试" → "This is a test."

## 🔧 在插件中配置 Ollama

### 方法 1：通过 Popup 界面配置（推荐）

1. **打开插件设置**
   - 点击浏览器右上角的流畅阅读图标

2. **选择翻译服务**
   - 在"翻译服务"下拉框中选择：**自定义**

3. **填写配置信息**
   ```
   自定义接口地址：http://localhost:11434/v1/chat/completions
   Token: 留空（或随便填一个值，比如 "ollama"）
   模型：phi:latest（或者你本地其他可用模型）
   ```

4. **保存并测试**
   - 配置会自动保存
   - 打开任意网页，选中一段中文测试翻译

### 方法 2：直接修改配置文件

如果你熟悉开发者工具，可以直接修改浏览器存储中的配置：

1. 按 F12 打开开发者工具
2. 切换到 Console 标签
3. 运行以下代码：

```javascript
// 设置自定义接口配置
const config = {
    service: "custom",
    custom: "http://localhost:11434/v1/chat/completions",
    token: { custom: "" },  // 空 token
    model: { custom: "phi:latest" }  // 使用你本地的模型
};

storage.setItem('local:config', JSON.stringify(config))
    .then(() => console.log('✅ 配置已更新'))
    .catch(err => console.error('❌ 配置失败:', err));
```

## 📝 优化建议

### 1. 如果模型输出太多额外内容

某些模型（如 phi:latest）可能会输出解释性文字。解决方法：

**选项 A：更换模型**
```bash
# 安装更合适的翻译模型
ollama pull llama3.2        # Llama 3.2，更简洁的输出
ollama pull qwen2.5:7b     # 通义千问，翻译质量较好
```

**选项 B：调整提示词**
在插件设置的"高级选项"中，修改系统提示词为：
```
你是一个专业的翻译助手。只输出翻译结果，不要有任何解释、额外说明或其他内容。
```

用户提示词改为：
```
将以下文本翻译成英文，只输出翻译结果：{{origin}}
```

### 2. 提高翻译速度

- 使用较小的模型（如 7B 参数量的模型）
- 降低 temperature 参数（在代码中已设置为 0.1）
- 确保 Ollama 服务运行正常

## 🔍 常见问题排查

### Q1: 翻译失败，提示连接错误
**解决：**
- 检查 Ollama 是否运行：访问 http://localhost:11434
- 确认防火墙没有阻止 11434 端口
- 重启 Ollama 服务

### Q2: 提示模型不存在
**解决：**
```bash
# 查看可用模型
ollama list

# 安装模型
ollama pull phi:latest
```

### Q3: 跨域错误（CORS）
Ollama 默认允许跨域，如果遇到 CORS 错误：
- 检查浏览器控制台的具体错误信息
- 可能需要在启动 Ollama 时添加 CORS 参数

## 🎯 最佳实践

1. **选择合适的模型**
   - 快速翻译：phi:latest, llama3.2:8b
   - 高质量翻译：qwen2.5:7b, mistral:7b

2. **性能优化**
   - 使用缓存功能（默认开启）
   - 避免同时翻译大量文本

3. **隐私保护**
   - 本地部署确保数据安全
   - 不需要上传任何数据到云端

## 🚀 开始使用

配置完成后：
1. 打开任意包含英文的网页
2. 使用快捷键（默认 Alt+Q）或悬浮球触发翻译
3. 享受流畅的阅读体验！

---

**测试命令：** 如果遇到问题，可以运行 `node test-integration.js` 来验证接口是否正常
