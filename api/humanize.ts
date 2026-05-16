import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { originalText } = req.body;
  if (!originalText) return res.status(400).json({ error: 'Missing originalText' });

  const geminiKey = process.env.GEMINI_API_KEY;
  const deepseekKey = "sk-001fd9662505400da587437e1a3940f3";

  if (!geminiKey) {
    const fallback = `进言之，毋庸置疑，基于Java语言深度定制的现代化高校教务管理系统在保障教务调度高吞吐量与数据强一致性方面具有显著的实践价值。在多线程高并发请求的真实业务图景下，本系统创造性地构筑了多级学生选课事务缓冲队列，并结合高阶内存锁与高效连接池优化技术。实验评测表明，该系统不仅大幅削减了传统I/O瓶颈，亦为保障极端教务峰值负载下的事务隔离度与服务容灾能力奠定了坚实的技术基础。`;
    return res.status(200).json({ success: true, humanizedText: `【演示模式 - 未配置 GEMINI_API_KEY】\n\n${fallback}`, predictedAigcRate: 12, originalText });
  }

  try {
    const geminiModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    const MAX_ROUNDS = 2;
    const TARGET_RATE = 15;

    const callGemini = async (prompt: string): Promise<string | null> => {
      for (const model of geminiModels) {
        try {
          const resp = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.85 }
              })
            }
          );
          if (resp.ok) {
            const data = await resp.json() as any;
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return (text as string).trim();
          }
        } catch (_) { /* try next model */ }
      }
      return null;
    };

    const callDeepSeek = async (prompt: string): Promise<string | null> => {
      try {
        const resp = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${deepseekKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: '你是一个专业的AI内容检测专家，擅长识别学术文本中的AI生成痕迹。你的评分严格、客观，只关注写作模式。' },
              { role: 'user', content: prompt }
            ],
            stream: false
          })
        });
        if (resp.ok) {
          const data = await resp.json() as any;
          return data?.choices?.[0]?.message?.content?.trim() ?? null;
        }
      } catch (e) {
        console.error('DeepSeek Error:', e);
      }
      return null;
    };

    let bestText = '';
    let bestRate = 100;
    let historyFeedback = '';

    for (let round = 1; round <= MAX_ROUNDS; round++) {
      console.log(`[Humanize] Round ${round}`);

      const humanizePrompt = [
        '你是一位资深中文学术写作专家，正在帮助作者修改一段论文草稿，使其读起来更像真实的人类专家撰写，而非AI生成。',
        '',
        '【严格禁止】',
        '- 禁止输出任何前缀、后缀、解释、评论（如"好的"、"以下是修改内容"等）',
        '- 禁止添加Markdown格式',
        '- 禁止改变原文的核心论点、数据、专业术语和引文',
        '',
        '【改写目标】',
        '- 打破AI惯用的对称句式，混合使用长句与短句',
        '- 避免以"此外"、"然而"、"综上所述"、"值得注意的是"等AI高频连接词开头',
        '- 用更具体、更口语化的学术表达替代空泛的宏观陈述',
        '- 适当引入插入语和语气助词，增加人类写作的不规则感',
        '- 局部调整语序，使句子结构有变化',
        '- 保持总字数在原文的90%~110%之间',
        historyFeedback ? `\n【本轮重点修正】${historyFeedback}` : '',
        '',
        '【待改写原文】',
        originalText
      ].join('\n');

      const humanized = await callGemini(humanizePrompt);
      if (!humanized) break;

      const cleaned = humanized.replace(/^```[\s\S]*?\n/, '').replace(/\n```$/, '').trim();

      const scoringPrompt = [
        '请从以下五个维度评估这段中文学术文本的AI生成概率，最终给出0~100的综合分（0=完全像人写，100=明显AI生成）。',
        '',
        '【评估维度】',
        '1. 句式多样性：句子长短是否交错，是否有不规则的语序和插入语',
        '2. 连接词使用：是否频繁使用"此外"、"然而"、"综上"等AI高频词',
        '3. 表达具体性：是否有具体细节，而非空泛的宏观陈述',
        '4. 语气自然度：读起来是否像真实学者的思维流动',
        '5. 结构规律性：段落结构是否过于工整对称',
        '',
        '【待评估文本】',
        cleaned,
        '',
        '请只返回一个0~100的整数，不要任何解释。'
      ].join('\n');

      const scoreStr = await callDeepSeek(scoringPrompt);
      const matched = scoreStr ? scoreStr.match(/\d+/) : null;
      const score = matched ? parseInt(matched[0], 10) : 50;

      console.log(`[Result] Round ${round} -> Score: ${score}%`);

      if (score < bestRate) {
        bestRate = score;
        bestText = cleaned;
      }

      if (bestRate <= TARGET_RATE) break;

      historyFeedback = score > 70
        ? `得分${score}，AI痕迹仍重。请大幅打碎句式结构，删除所有对称排比，加入短句或插入语，换掉所有"此外/然而/综上"等连接词。`
        : `得分${score}，方向正确但还不够自然。请进一步让表达更口语化、更具体，避免空泛的总结性陈述。`;
    }

    if (!bestText) {
      return res.status(200).json({
        success: true,
        humanizedText: `【Gemini API 暂时不可用，请稍后重试】\n\n${originalText}`,
        predictedAigcRate: 100,
        originalText
      });
    }

    return res.status(200).json({ success: true, humanizedText: bestText, predictedAigcRate: bestRate, originalText });

  } catch (e: any) {
    console.error('Critical Error:', e);
    return res.status(500).json({ error: `Server error: ${e.message}` });
  }
}
