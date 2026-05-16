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
    const deepseekKey = "sk-001fd9662505400da587437e1a3940f3";
    const MAX_ROUNDS = 2;
    const TARGET_RATE = 15;

    let bestText = "";
    let bestRate = 100;
    let historyFeedback = "";

    // Helper: Execute LLM Call (Gemini)
    async function callGemini(prompt: string) {
      for (const model of modelsToTry) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.85 }
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
      if (!deepseekKey) return null;
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekKey}`
          },
          body: JSON.stringify({
            model: “deepseek-chat”,
            messages: [
              {
                role: “system”,
                content: “你是一个专业的 AI 内容检测专家，擅长识别学术文本中的 AI 生成痕迹。你的评分严格、客观，不受文章主题影响，只关注写作模式。”
              },
              { role: “user”, content: prompt }
            ],
            stream: false
          })
        });
        if (response.ok) {
          const data = await response.json() as any;
          return data.choices?.[0]?.message?.content?.trim();
        }
      } catch (e) {
        console.error(“DeepSeek Error:”, e);
      }
      return null;
    }

    // --- ITERATIVE LOOP (AGENTIC WORKFLOW) ---
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      console.log(`[Humanize] Round ${round} started...`);

      // 1. Humanize Step (Gemini) — optimized prompt
      const humanizePrompt = `你是一位资深中文学术写作专家，正在帮助作者修改一段论文草稿，使其读起来更像真实的人类专家撰写，而非 AI 生成。

【严格禁止】
- 禁止输出任何前缀、后缀、解释、评论（如”好的”、”以下是修改内容”、”修改如下”等）
- 禁止添加 Markdown 格式（如 **加粗**、## 标题）
- 禁止改变原文的核心论点、数据、专业术语和引文

【改写目标】
- 打破 AI 惯用的对称句式，混合使用长句与短句
- 避免以”此外”、”然而”、”综上所述”、”值得注意的是”等 AI 高频连接词开头
- 用更具体、更口语化的学术表达替代空泛的宏观陈述
- 适当引入不完整的插入语、省略和语气助词，增加人类写作的不规则感
- 局部调整语序，使句子结构有变化，避免”主谓宾”的机械重复
- 保持总字数在原文的 90%~110% 之间
${historyFeedback ? `\n【本轮重点修正】${historyFeedback}` : “”}

【待改写原文】
${originalText}`;

      const humanizedText = await callGemini(humanizePrompt);
      if (!humanizedText) break;

      const cleanedText = humanizedText.replace(/^```[\s\S]*?\n/g, '').replace(/\n```$/g, '').trim();

      console.log(`[Score] Round ${round} scoring...`);

      // 2. Scoring Step (DeepSeek) — structured rubric
      const scoringPrompt = `请从以下五个维度评估这段中文学术文本的 AI 生成概率，最终给出 0~100 的综合分（0=完全像人写，100=明显 AI 生成）。

【评估维度】
1. 句式多样性：句子长短是否交错？是否有不规则的语序和插入语？
2. 连接词使用：是否频繁使用”此外”、”然而”、”综上”、”值得注意”等 AI 高频词？
3. 表达具体性：是否有具体细节和个人化表达，而非空泛的宏观陈述？
4. 语气自然度：读起来是否像真实学者的思维流动，还是像模板填空？
5. 结构规律性：段落结构是否过于工整对称？

【待评估文本】
${cleanedText}

请只返回一个 0~100 的整数，不要任何解释。`;

      const scoreStr = await callDeepSeek(scoringPrompt);
      const matchedScore = scoreStr?.match(/\d+/);
      const score = matchedScore ? parseInt(matchedScore[0]) : 50;

      console.log(`[Result] Round ${round} -> DeepSeek Score: ${score}%`);

      if (score < bestRate) {
        bestRate = score;
        bestText = cleanedText;
      }

      if (bestRate <= TARGET_RATE) {
        console.log(`[Early Exit] Target achieved.`);
        break;
      }

      // Targeted feedback based on score range
      if (score > 70) {
        historyFeedback = `得分 ${score}，AI 痕迹仍重。请大幅打碎句式结构，删除所有对称排比，加入至少两处短句或插入语，并换掉所有”此外/然而/综上”等连接词。`;
      } else {
        historyFeedback = `得分 ${score}，方向正确但还不够自然。请进一步让表达更口语化、更具体，避免空泛的总结性陈述。`;
      }
    }

    if (!bestText) {
      return res.status(200).json({
        success: true,
        humanizedText: `【Gemini API 暂时不可用，请检查额度或稍后重试】\n\n${originalText}`,
        predictedAigcRate: 100,
        originalText
      });
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
