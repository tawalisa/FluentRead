import { config } from "@/entrypoints/utils/config";
import { method } from "@/entrypoints/utils/constant";
import { contentPostHandler } from "@/entrypoints/utils/check";

/**
 * 本地后端翻译接口服务
 * 调用本地后端 API 进行翻译
 * 
 * 请求格式：
 * POST http://localhost:8080/api/chat/translate
 * Content-Type: application/json
 * Body: {"content": "原文", "targetLanguage": "zh-Hans"}
 * 
 * 响应格式：
 * 直接返回翻译后的文本内容
 */
async function localBackend(message: any) {
    try {
        const url = config.proxy.localBackend || 'http://lz-biz-dev.ccccltd.cn:8080/api/chat/translate';
        
        // 构建请求体，按照后端要求的格式
        const requestBody = {
            content: message.origin,
            targetLanguage: config.to
        };

        const headers = new Headers({
            'Content-Type': 'application/json',
        });

        const resp = await fetch(url, {
            method: method.POST,
            headers,
            body: JSON.stringify(requestBody)
        });

        if (!resp.ok) {
            throw new Error(`翻译失败：${resp.status} ${resp.statusText} body: ${await resp.text()}`);
        }

        // 直接返回响应体作为翻译结果
        const result = await resp.text();
        return contentPostHandler(result);
    } catch (error) {
        console.error('本地后端 API 调用失败:', error);
        throw error;
    }
}

export default localBackend;
