import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers for general safety
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { originalText } = req.body;
  if (!originalText) {
    return res.status(400).json({ error: 'Missing originalText' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Return a pristine academic rewrite mock as a fallback to ensure 100% stable demo deployment
    const fallbackText = `进言之，毋庸置疑，基于Java语言深度定制的现代化高校教务管理系统在保障教务调度高吞吐量与数据强一致性方面具有显著的实践价值。在多线程高并发请求的真实业务图景下，本系统创造性地构筑了多级学生选课事务缓冲队列，并结合高阶内存锁（Memory Lock）与高效连接池（Connection Pool）优化技术。实验评测表明，该系统不仅大幅削减了传统I/O瓶颈，亦为保障极端教务峰值负载下的事务隔离度与服务容灾能力奠定了坚实的技术基础。`;
    
    return res.status(200).json({
      success: true,
      humanizedText: `【Vercel 演示模式 - 未配置 GEMINI_API_KEY】\n\n${fallbackText}`,
      originalText
    });
  }

  try {
    // Highly resilient model routing loop (Tries latest 2.5, falls back to 2.0 and 1.5 if 404 occurs)
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let textResult = '';
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `你是一位殿堂级的中文学术论文编辑与去 AI 检测专家。请将用户输入的学术段落进行彻底的“去 AIGC 痕迹/人化润色”。
【强制要求】：
1. 严禁改动任何专业名词、核心算法公式、代码数据与参考文献。
2. 彻底打碎原本由大模型翻译或直接生成而来的“机械感、句式单一、翻译味重”的句式。
3. 重组句法结构，多使用非对称的转折句式，合理嵌入中文学术文献特有的过渡副词（例如：进言之、诚然、显而易见、毋庸置疑、有鉴于此）。
4. 使整段文字读起来流畅、深刻，极其贴近人类学术大牛亲手撰写的文字。
5. 仅返回润色降重后的纯正文，绝对不要夹带任何多余解释、拼音、Markdown前缀或自我介绍。

用户需要重构的原文字如下：
${originalText}`
              }]
            }],
            generationConfig: { temperature: 0.7 }
          })
        });

        if (geminiResponse.ok) {
          const data = await geminiResponse.json() as any;
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            textResult = candidateText.trim();
            break; // Success! Exit the fallback loop.
          }
        } else {
          lastError = await geminiResponse.json();
        }
      } catch (err: any) {
        lastError = { message: err.message };
      }
    }

    if (!textResult) {
      return res.status(500).json({ 
        error: `Google Gemini API returned error (tried ${modelsToTry.join(', ')}): ${JSON.stringify(lastError)}` 
      });
    }

    return res.status(200).json({
      success: true,
      humanizedText: textResult,
      originalText
    });
  } catch (e: any) {
    return res.status(500).json({ error: `Cloud execute error: ${e.message}` });
  }
}
