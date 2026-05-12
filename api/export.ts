import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Configuration
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

  const { paragraphs, filename } = req.body;
  if (!paragraphs || !Array.isArray(paragraphs)) {
    return res.status(400).json({ error: '缺少段落数据或段落格式不正确' });
  }

  try {
    // Generate document elements
    const docChildren = paragraphs.map((p: any) => {
      // Use humanized text if available, otherwise fall back to original text
      const textContent = p.finalText || p.originalText;
      const isHeader = p.type === 'header';

      return new Paragraph({
        children: [
          new TextRun({
            text: textContent,
            font: 'SimSun', // 华文宋体/宋体，最标准的中文学术排版字体
            size: isHeader ? 28 : 24, // 14pt (28 half-points) for headers, 12pt (24 half-points) for body
            bold: isHeader, // Bold headers
          }),
        ],
        spacing: {
          line: 360, // 1.5倍行距 (standard Chinese thesis spacing)
          before: isHeader ? 240 : 120, // Double spacing before header segments
          after: 120,
        },
        indent: isHeader ? undefined : {
          firstLine: 480, // 首行缩进 2 字符 (12pt * 20 = 240, wait, size is 24, so 2 chars is 480 half-points)
        },
      });
    });

    // Create Microsoft Word document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    // Compress into raw binary Buffer
    const buffer = await Packer.toBuffer(doc);

    // Format download attachment filename safely
    const originalName = filename || 'AuraPaper_降重报告.docx';
    const safeName = originalName.endsWith('.docx') 
      ? originalName.replace('.docx', '_降AIGC后.docx') 
      : `${originalName}_降AIGC后.docx`;
      
    const encodedFilename = encodeURIComponent(safeName);

    // Write binary headers to trigger file download in browser natively
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Content-Length', buffer.length);

    return res.status(200).send(buffer);

  } catch (exportErr: any) {
    console.error('Word generation failed:', exportErr);
    return res.status(500).json({ error: `导出 Word 文档失败：${exportErr.message || '格式生成异常'}` });
  }
}
