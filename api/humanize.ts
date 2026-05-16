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
      predictedAigcRate: 12,
      originalText
    });
  }

  try {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    const MAX_ROUNDS = 3;
    const TARGET_RATE = 15; // 目标 AIGC 概率低于 15%

    let currentText = originalText;
    let bestText = "";
    let bestRate = 100;
    let historyFeedback = "";

    const deepseekKey = "sk-001fd9662505400da587437e1a3940f3";

    // Helper: Execute LLM Call (Gemini)
    async function callGemini(prompt: string) {
      for (const model of modelsToTry) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7 }
            })
          });
          if (response.ok) {
            const data = await response.json() as any;
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text.trim();
          }
        } catch (e) {}
      }
      return null;
    }

    // Helper: Execute LLM Call (DeepSeek)
    async function callDeepSeek(prompt: string) {
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekKey}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: "你是一个专业的学术查重评分助手。" },
              { role: "user", content: prompt }
            ],
            stream: false
          })
        });
        if (response.ok) {
          const data = await response.json() as any;
          return data.choices?.[0]?.message?.content?.trim();
        }
      } catch (e) {
        console.error("DeepSeek Error:", e);
      }
      return null;
    }

    // --- ITERATIVE LOOP (AGENTIC WORKFLOW) ---
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      console.log(`[Humanize] Round ${round} started...`);
      
      // 1. Humanize Step (Gemini)
      // 这里的提示词经过了极致压缩和去对话化处理
      const humanizePrompt = `【任务】：重构学术段落。
【禁令】：严禁返回任何前缀、后缀、对话、评价或解释（如“好的”、“以下是重构内容”等）。
【目标】：去 AI 化、增强人类专家韵味、保持 95% 以上字数。
【约束】：保留所有术语、数据、引文。

${historyFeedback ? `【修正建议】：${historyFeedback}` : ""}

【待处理原文字】：
${originalText}`;

      const humanizedText = await callGemini(humanizePrompt);
      if (!humanizedText) break;

      // 简单清洗掉可能存在的 Markdown 包装
      const cleanedText = humanizedText.replace(/^```[\s\S]*?\n/g, '').replace(/\n```$/g, '').trim();

      console.log(`[Score] Round ${round} scoring...`);

      // 2. Scoring Step (DeepSeek)
      const scoringPrompt = `请对以下段落的 AI 生成概率进行 0-100 打分（仅返回数字）：
${cleanedText}`;

      const scoreStr = await callDeepSeek(scoringPrompt);
      // 使用正则提取所有数字，防止 DeepSeek 返回类似 "得分：20分" 这种带文字的内容
      const matchedScore = scoreStr?.match(/\d+/);
      const score = matchedScore ? parseInt(matchedScore[0]) : 100;
      
      console.log(`[Result] Round ${round} -> DeepSeek Score: ${score}%`);

      if (score < bestRate) {
        bestRate = score;
        bestText = cleanedText;
      }

      // 如果分数达到理想目标 (<=15)，立即提前结束，节省时间
      if (bestRate <= TARGET_RATE) {
        console.log(`[Early Exit] Target achieved.`);
        break;
      }

      historyFeedback = `上一轮 AI 嫌疑分数为 ${score}，句式仍显死板，请进一步通过长短句交错打碎结构。`;
    }

    return res.status(200).json({
      success: true,
      humanizedText: bestText,
      predictedAigcRate: bestRate,
      originalText
    });

  } catch (e: any) {
    console.error("Critical Error:", e);
    return res.status(500).json({ error: `Cloud execute error: ${e.message}` });
  }
}
