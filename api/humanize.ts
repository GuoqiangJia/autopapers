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

    // Helper: Execute LLM Call
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

    // --- ITERATIVE LOOP (AGENTIC WORKFLOW) ---
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      // 1. Humanize Step
      const humanizePrompt = `你是一位深耕学术多年的资深论文导师，擅长将机械的学术段落重构为极具人类专家韵味的文字。
目标：对以下段落进行“去 AI 化”重构，彻底消除 AI 生成感。

【核心要求】：
1. **禁止改动**：专业术语、公式数据、算法逻辑及参考文献。
2. **拒绝陈词滥调**：严禁堆砌如“毋庸置疑、诚然、进言之、有鉴于此”等 AI 特征词汇。
3. **句式重组**：打破平衡结构，采用长短句交错、灵活连接，模仿人类深度思考的张力。
4. **保量改写**：字数必须保持在原文的 95% 以上，严禁大幅删减。
${historyFeedback ? `\n【上一轮反馈】：\n${historyFeedback}\n请针对上述反馈进行更深度的迭代改进。` : ""}

用户原文字：
${originalText}`;

      const humanizedText = await callGemini(humanizePrompt);
      if (!humanizedText) break;

      // 2. Scoring Step
      const scoringPrompt = `你是一位严苛的 AIGC 检测专家，擅长从语感、逻辑多样性、高频词统计等方面识别人工智能生成的文本。
请对以下学术段落的“AI 生成概率”进行打分（0-100 分，分数越低代表人类创作特征越明显，越不容易被检测）。

【评分准则】：
- 结构过于工整、过渡词死板、缺乏语义深度 -> 高分 (80-100)
- 句式灵活、逻辑隐性、表达地道、具有专家韵味 -> 低分 (0-20)

【输出要求】：
仅返回一个 0 到 100 之间的纯数字。

待检测文本：
${humanizedText}`;

      const scoreStr = await callGemini(scoringPrompt);
      const score = parseInt(scoreStr || "100");

      // Update best result
      if (score < bestRate) {
        bestRate = score;
        bestText = humanizedText;
      }

      // Check if target met
      if (bestRate <= TARGET_RATE) break;

      // Prepare feedback for next round
      historyFeedback = `当前改写版本的 AIGC 嫌疑分数为 ${score}。
主要问题：文字依然存在部分模式化的倾向，请进一步打碎原有结构，增强语言的自然流动感和专业深度。`;
    }

    if (!bestText) {
      throw new Error("Failed to generate humanized text after multiple rounds.");
    }

    return res.status(200).json({
      success: true,
      humanizedText: bestText,
      predictedAigcRate: bestRate,
      originalText
    });

  } catch (e: any) {
    return res.status(500).json({ error: `Cloud execute error: ${e.message}` });
  }
}
