/**
 * 测试 Ollama 本地翻译接口
 */

const OLLAMA_BASE_URL = 'http://localhost:11434/v1/chat/completions';
const OLLAMA_API_URL = 'http://localhost:11434/api/tags';

// 模拟消息模板（与项目中保持一致）
function commonMsgTemplate(text, model = 'llama3.2') {
    return JSON.stringify({
        model: model,
        messages: [
            {
                role: "system",
                content: "你是一个专业的翻译助手。只输出翻译结果，不要有任何解释、额外说明或其他内容。"
            },
            {
                role: "user",
                content: `将以下中文翻译成英文，只输出翻译结果：${text}`
            }
        ],
        temperature: 0.1,
        stream: false
    });
}

// 获取可用的模型列表
async function getAvailableModels() {
    try {
        const response = await fetch(OLLAMA_API_URL);
        if (response.ok) {
            const result = await response.json();
            console.log('📋 可用模型列表:', result.models?.map(m => m.name).join(', ') || '无');
            return result.models?.map(m => m.name) || [];
        }
    } catch (error) {
        console.error('获取模型列表失败:', error.message);
    }
    return [];
}

async function testTranslation() {
    const testText = "你好，世界";
    
    console.log('🧪 开始测试 Ollama 翻译接口...');
    console.log('请求地址:', OLLAMA_BASE_URL);
    console.log('测试文本:', testText);
    console.log('目标语言：中文 → 英文\n');

    // 先获取可用模型
    const models = await getAvailableModels();
    if (models.length === 0) {
        console.error('❌ 未找到可用的 Ollama 模型！请先安装模型。');
        console.error('示例命令：ollama pull llama3.2');
        throw new Error('没有可用的模型');
    }
    
    // 使用第一个可用模型
    const model = models[0];
    console.log('使用模型:', model);
    console.log('---\n');

    try {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        // Ollama 本地服务通常不需要 token，如果需要可以添加
        // headers.append('Authorization', 'Bearer YOUR_TOKEN');

        const response = await fetch(OLLAMA_BASE_URL, {
            method: 'POST',
            headers: headers,
            body: commonMsgTemplate(testText, model)
        });

        console.log('响应状态:', response.status, response.statusText);

        if (response.ok) {
            const result = await response.json();
            console.log('完整响应:', JSON.stringify(result, null, 2));
            
            const translatedText = result.choices[0].message.content;
            console.log('\n✅ 翻译成功！');
            console.log('原文:', testText);
            console.log('译文:', translatedText);
            
            return translatedText;
        } else {
            const errorText = await response.text();
            console.error('❌ 翻译失败！');
            console.error('状态码:', response.status);
            console.error('错误信息:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('❌ 请求异常:', error);
        throw error;
    }
}

// 运行测试
testTranslation()
    .then(() => {
        console.log('\n✨ 测试完成！');
    })
    .catch((error) => {
        console.error('\n💥 测试失败:', error.message);
        process.exit(1);
    });
