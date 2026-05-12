import type { VercelRequest, VercelResponse } from '@vercel/node';
import mammoth from 'mammoth';
import multiparty from 'multiparty';

// Disable default body parser to let multiparty handle the file stream
export const config = {
  api: {
    bodyParser: false,
  },
};

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

  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Multiparty parsing error:', err);
      return res.status(500).json({ error: '文件传输解析失败' });
    }

    const fileList = files.file;
    if (!fileList || fileList.length === 0) {
      return res.status(400).json({ error: '未检测到任何上传的文件，请重试' });
    }

    const file = fileList[0];

    try {
      // Parse the .docx using mammoth to extract raw text (retaining simple paragraph structure)
      const parseResult = await mammoth.extractRawText({ path: file.path });
      const fullText = parseResult.value || '';

      // Split text by newlines and filter out empty or too short placeholder rows (such as single line numbers)
      const lines = fullText.split('\n');
      const paragraphs: any[] = [];
      let indexCounter = 1;

      for (let line of lines) {
        const trimmed = line.trim();
        // Ignore headers/lines that are extremely short (less than 6 chars) to make editing cleaner
        if (trimmed.length > 5) {
          paragraphs.push({
            id: indexCounter++,
            type: trimmed.length < 35 && (trimmed.startsWith('第') || trimmed.endsWith('章') || trimmed.match(/^[0-9]\.[0-9]/)) ? 'header' : 'body',
            originalText: trimmed,
            finalText: '', // Filled upon humanization
            diffSegments: [] // Stored diff view
          });
        }
      }

      if (paragraphs.length === 0) {
        return res.status(400).json({ error: 'Word 文档中没有检测到足够的有效文本段落' });
      }

      return res.status(200).json({
        success: true,
        filename: file.originalFilename || '未定义文档.docx',
        paragraphs
      });

    } catch (docxErr: any) {
      console.error('Mammoth parsing failed:', docxErr);
      return res.status(500).json({ error: `Word 文档解析错误：${docxErr.message || '文件格式损坏'}` });
    }
  });
}
