import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Sparkles, 
  FileText, 
  BookOpen, 
  Heart, 
  TrendingDown, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Download, 
  Copy, 
  GraduationCap, 
  AlertTriangle,
  Compass,
  Sun,
  Moon
} from 'lucide-react';

// ==========================================
// TYPES
// ==========================================

interface DiffSegment {
  type: 'unchanged' | 'removed' | 'added';
  text: string;
}

interface MockParagraph {
  id: number;
  type: 'body' | 'header';
  originalText: string;
  diffSegments: DiffSegment[];
  finalText: string;
  isHeaderSkipped?: boolean;
}

// ==========================================
// MOCK DATA & CONSTANTS
// ==========================================

const INITIAL_AIGC_TEXT_QUICK = `Furthermore, it is widely acknowledged that deep learning frameworks have revolutionized the field of natural language processing. In conclusion, the results obtained from our experiments clearly demonstrate that the proposed model outperforms traditional baseline methods by a significant margin. Additionally, it is worth noting that further research is required to fully understand the underlying mechanisms. Consequently, we can infer that this architecture represents a crucial milestone in artificial intelligence development.`;

const INITIAL_PLAGIARISM_TEXT_QUICK = `基于Java的教务管理系统主要是通过多线程并发机制来处理学生选课请求的。该系统可以实现学生选课、排课、成绩录入等功能。由于采用了高性能的后台缓存技术，系统不仅具备极佳运行稳定性，还能够很好地应对数万名学生同时在线访问造成的并发流量压力。`;

const PARAPHRASED_PLAGIARISM_TEXT_QUICK = `本研究设计的Java教务选课系统利用多线程调度队列缓冲瞬时选课流量。系统主要涵盖成绩录入、智能排课和选课逻辑调度等核心微服务。后台底层引入了高性能分布式缓存机制，使其在高并发选课场景下仍能保持高可用性。`;

const POLISHED_TEXTS = {
  light: `This Java system aims to identify why the server experiences database lock latency. We employ a connection pooling tool to evaluate the query pathways. The evaluation demonstrates that thread safety is the primary bottleneck, causing contention. We modified the locking logic, resolving the latency.`,
  medium: `This research investigates database lock latency within Java-based institutional systems. We utilized a customized pool utility to evaluate transaction contention pathways, revealing that thread safety limits throughput. Following database refactoring, query response times improved significantly.`,
  strong: `This investigation interrogates the transaction latency limiting concurrency in Java enterprise databases. Leveraging an automated thread monitoring suite, we demonstrated that lock contention in connection pools serves as the primary system bottleneck. Following the optimization of transaction isolation levels, performance expanded exponentially.`
};

const INITIAL_POLISH_TEXT = `This Java system tries to find out why the server runs database locks very slow. We use a tool to test the code. The test shows that thread safety is the main problem. We find a very big database connection pool bottleneck. We change the lock and now it runs very fast.`;

const TEMPLATES = [
  { id: 'tsinghua', name: '清华大学本科毕业设计模板', type: '本科毕业论文', size: 'A4 双面', doc: 'GB/T 7714-2015' },
  { id: 'pku', name: '北京大学硕博士学位论文模板', type: '硕士/博士论文', size: 'A4 单面', doc: '北京大学引文规范' },
  { id: 'ieee', name: 'IEEE Transactions Journal Template', type: '英文期刊', size: 'Letter 双栏', doc: 'IEEE Editorial' },
  { id: 'nature', name: 'Nature Article & Letters Standard', type: 'Nature 期刊', size: 'A4 双栏', doc: 'Nature Style' },
  { id: 'zju', name: '浙江大学学术论文格式标准', type: '通用学位论文', size: 'A4 双面', doc: '浙大排版规范' }
];

const REVIEWER_FEEDBACK = [
  {
    reviewer: 'Reviewer #1 (Methodology & Concurrency)',
    status: 'Major Revision',
    score: 72,
    comment: 'The Java multithreading model in Section 3 lacks formal thread pool boundary proofs. Please mathematically justify the corePoolSize and maxPoolSize configurations under heavy concurrent traffic.'
  },
  {
    reviewer: 'Reviewer #2 (Database & Novelty)',
    status: 'Minor Revision',
    score: 85,
    comment: 'The database optimization is sound, but you must reference recent 2024 Redis and Java Spring-Boot caching benchmarks to prove your throughput claims are state of the art.'
  },
  {
    reviewer: 'Reviewer #3 (Style & Layout)',
    status: 'Accepted with Minor Edits',
    score: 92,
    comment: 'Excellent code structures. However, Figure 4 showing the ER Diagram is pixelated. Please re-export it in high-resolution vector format and fix the GB/T 7714 citations.'
  }
];

const RADAR_INDICATORS = [
  { name: '创新度 (Novelty)', value: 85, max: 100 },
  { name: '并发机制 (Method)', value: 72, max: 100 },
  { name: '系统逻辑 (Logic)', value: 90, max: 100 },
  { name: '工程规范 (Clarity)', value: 68, max: 100 },
  { name: '文献引用 (Citation)', value: 88, max: 100 }
];

// ==========================================
// WORKSPACE MODE HIGH-FIDELITY MOCK FILES DATA
// ==========================================

const MOCK_AIGC_PARAGRAPHS: MockParagraph[] = [
  {
    id: 43,
    type: 'body',
    originalText: '时代的进步也给人们提出新的要求，只有学习和发展才能前行。如今正处于科技和网络飞速发展的时期，教务信息系统已经基本在高校普及，但是仍然有很多学校和单位使用传统的线下表格手工登记方式来完成排课排班，当然传统的手工表格对于小型的教研组来说是较为合适的，但是要想满足现代高校规模发展就必须用发展的视角看待这个问题，如果可以使用更加便捷、省力、高吞吐的系统来进行教务管理工作就会带来翻天覆地的改变。',
    finalText: '时代的演进步也给高校信息化建设向社会主义提出新了更高维度的能力要求，只有学习和持续的认知重构已成为驱动高校发展前行的核心引擎。如今正处于教务管理架构已经全面实现高度普及，但是在多校区规模化办学中，传统的办公方式和手工表格登记排课范式来完成工作，当然传统的办公方式和路径依赖对于小型的教研组尚具有一定的配性，但是要想满足现代高校规模发展，从战略精进的视角看待这个问题考量，如果可以使用唯有主动拥护更加便捷、省力且具集约化与效能化的方法来进行数字化办公就会带来改变，才能突破增长瓶颈，实现组织运营维度的根本性变革。',
    diffSegments: [
      { type: 'unchanged', text: '时代的' },
      { type: 'removed', text: '进步也给人们提出新' },
      { type: 'added', text: '演进步也给高校信息化建设向社会主义提出新了更高维度' },
      { type: 'unchanged', text: '的能力要求，只有学习和' },
      { type: 'removed', text: '发展才能前行' },
      { type: 'added', text: '持续的认知重构已成为驱动高校发展前行的核心引擎' },
      { type: 'unchanged', text: '。如今正处于' },
      { type: 'removed', text: '科技和网络飞速发展的时期，教务信息系统已经基本在高校' },
      { type: 'added', text: '教务管理架构已经全面实现高度' },
      { type: 'unchanged', text: '普及，但是' },
      { type: 'removed', text: '仍然有很多学校和单位使用传统的线下表格手工登记' },
      { type: 'added', text: '在多校区规模化办学中，传统的办公方式和手工表格登记排课范式' },
      { type: 'unchanged', text: '来完成工作，当然传统的手工表格对于小型的' },
      { type: 'removed', text: '教研组来说是较为合适的，但是要想满足现代高校' },
      { type: 'added', text: '教研组尚具有一定的配性，但是要想满足现代高校' },
      { type: 'unchanged', text: '规模发展' },
      { type: 'removed', text: '就必须用发展的视角看待这个问题，如果可以使用' },
      { type: 'added', text: '从战略精进的视角看待这个问题考量，如果可以使用唯有主动拥护' },
      { type: 'unchanged', text: '更加便捷、省力' },
      { type: 'removed', text: '、高吞吐的系统来进行教务管理工作' },
      { type: 'added', text: '且具集约化与效能化的方法来进行数字化办公' },
      { type: 'unchanged', text: '就会带来改变' },
      { type: 'removed', text: '就会带来翻天覆地的改变' },
      { type: 'added', text: '，才能突破增长瓶颈，实现组织运营维度的根本性变革' },
      { type: 'unchanged', text: '。' }
    ]
  },
  {
    id: 44,
    type: 'body',
    originalText: '教务管理系统的并发选课响应极大地影响到校园服务体验。工作人员和技术人员需要认真对待选课数据的高并发录入工作，还要考虑选课冲突检测以及异常回滚。之前很多学校都是让学生直接提交选课单，然后教务处后台统筹分配，由于缺乏自动化分配平台，排课难度和查错难度非常大，无法实时掌握课程库存的真实状况。如果有这样一个教务选课系统，将所有涉及选课权限的师生和管理员全部纳入其中，起到动态负载均衡作用就可以解决这个问题。系统内所有的核心功能均由管理员在后台统一指挥管理，选课操作过程也可以由集群负载器进行分布式分发，使得选课流程变得极其有条理，避免黑箱操作和服务器崩溃。',
    finalText: '高校教务选课的并发吞吐能力与系统性能直接决定了智慧校园服务的终端体验。技术开发人员与管理员需要认真对待针对高并发并发资产库选课数据的高并发录入工作，还要考虑高并发下事务死锁隔离以及多副本分布式异常回滚。之前都是由于缺乏自动化分配平台机制，学生被动提交纸质表单，教务处模式常因数据滞后导致核查困难，查错难度较大，无法实时掌握课程资源的实时真实状况数据。如果针对此，构建一个涵盖多元主体的协同选课系统平台，所有涉及选课权限的各方人员全部分流调配至该平台节点中，通过动态弹性调度机制与事务锁起动态负载均衡作用，可铁有效化解高并发系统堵塞，消除信息不对称困境。系统后台底层在微服务框架下，各节点得以及时对统一、分布式数据库执行统一、分布式的服务保障，使得选课操作及异常状态得以及时动态监控处理，使得学生选课效率及用户体验得到显式优化，规避了黑箱操作违规操作，体现了智慧校园管理体系的现代价值。',
    diffSegments: [
      { type: 'unchanged', text: '高校' },
      { type: 'removed', text: '教务管理系统的并发选课响应极大地' },
      { type: 'added', text: '教务选课的并发吞吐能力与系统性能直接' },
      { type: 'unchanged', text: '决定了' },
      { type: 'removed', text: '校园服务体验。工作人员和技术' },
      { type: 'added', text: '智慧校园服务的终端体验。技术开发' },
      { type: 'unchanged', text: '人员与管理员需要认真对待' },
      { type: 'removed', text: '选课数据的高并发录入工作' },
      { type: 'added', text: '针对高并发并发资产库选课数据的高并发录入工作' },
      { type: 'unchanged', text: '，还要考虑' },
      { type: 'removed', text: '选课冲突检测以及' },
      { type: 'added', text: '高并发下事务死锁隔离以及多副本分布式' },
      { type: 'unchanged', text: '异常回滚。之前' },
      { type: 'removed', text: '很多学校都是让学生直接提交选课单，然后教务处后台统筹分配，由于缺乏自动化分配平台，排课难度和查错难度非常大' },
      { type: 'added', text: '都是由于缺乏自动化分配平台机制，学生被动提交纸质表单，教务处模式常因数据滞后导致核查困难，查错难度较大' },
      { type: 'unchanged', text: '，无法实时掌握' },
      { type: 'removed', text: '课程库存的真实状况' },
      { type: 'added', text: '课程资源的实时真实状况数据' },
      { type: 'unchanged', text: '。如果' },
      { type: 'removed', text: '如果有这样一个教务选课系统，将所有涉及选课权限的师生和管理员全部纳入其中，起到动态负载均衡作用' },
      { type: 'added', text: '针对此，构建一个涵盖多元主体的协同选课系统平台，所有涉及选课权限的各方人员全部分流调配至该平台节点中，通过动态弹性调度机制与事务锁起动态负载均衡作用，可铁有效化解高并发系统堵塞，消除信息不对称困境' },
      { type: 'unchanged', text: '。系统' },
      { type: 'removed', text: '内所有的核心功能均由管理员在后台统一指挥管理，选课操作过程也可以由集群负载器进行分布式分发，使得选课流程变得极其有条理，避免黑箱操作和服务器崩溃' },
      { type: 'added', text: '后台底层在微服务框架下，各节点得以及时对统一、分布式数据库执行统一、分布式的服务保障，使得选课操作及异常状态得以及时动态监控处理，使得学生选课效率及用户体验得到显式优化，规避了黑箱操作违规操作，体现了智慧校园管理体系的现代价值' },
      { type: 'unchanged', text: '。' }
    ]
  },
  {
    id: 45,
    type: 'header',
    originalText: '(三) 数据库选课高并发优化机制研究',
    finalText: '(三) 数据库选课高并发优化机制研究',
    isHeaderSkipped: true,
    diffSegments: []
  }
];

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState<'aigc' | 'plagiarism' | 'polish' | 'layout' | 'review' | 'booster' | 'thanks'>('aigc');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Mode Selection: 'quick' vs 'workspace' (For AIGC & Plagiarism Tabs)
  const [aigcMode, setAigcMode] = useState<'quick' | 'workspace'>('quick');
  const [plagMode, setPlagMode] = useState<'quick' | 'workspace'>('quick');

  // --- AIGC REDUCER: QUICK MODE STATES ---
  const [aigcTextQuick, setAigcTextQuick] = useState(INITIAL_AIGC_TEXT_QUICK);
  const [aigcRateQuick, setAigcRateQuick] = useState(85);
  const [isHumanizingQuick, setIsHumanizingQuick] = useState(false);
  const [humanizedTextQuick, setHumanizedTextQuick] = useState('');

  // --- PLAGIARISM REDUCER: QUICK MODE STATES ---
  const [plagTextQuick, setPlagTextQuick] = useState(INITIAL_PLAGIARISM_TEXT_QUICK);
  const [plagRateQuick, setPlagRateQuick] = useState(34.5);
  const [plagPlatformQuick, setPlagPlatformQuick] = useState<'cnki' | 'vip' | 'wanfang'>('cnki');
  const [isParaphrasingQuick, setIsParaphrasingQuick] = useState(false);
  const [paraphrasedTextQuick, setParaphrasedTextQuick] = useState('');
  const [deepRewriteQuick, setDeepRewriteQuick] = useState(true);

  // --- WORKSPACE MODE STATES (AIGC & Plagiarism shared concepts) ---
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [hasUploaded, setHasUploaded] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState('基于Java的教务管理系统.docx');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Character-level Longest Common Subsequence (LCS) Diff calculator
  const computeDiff = (oldStr: string, newStr: string): DiffSegment[] => {
    const dp: number[][] = Array(oldStr.length + 1).fill(0).map(() => Array(newStr.length + 1).fill(0));
    
    for (let i = 1; i <= oldStr.length; i++) {
      for (let j = 1; j <= newStr.length; j++) {
        if (oldStr[i - 1] === newStr[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const segments: DiffSegment[] = [];
    let i = oldStr.length;
    let j = newStr.length;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldStr[i - 1] === newStr[j - 1]) {
        segments.unshift({ type: 'unchanged', text: oldStr[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        segments.unshift({ type: 'added', text: newStr[j - 1] });
        j--;
      } else {
        segments.unshift({ type: 'removed', text: oldStr[i - 1] });
        i--;
      }
    }

    const merged: DiffSegment[] = [];
    for (const seg of segments) {
      if (merged.length > 0 && merged[merged.length - 1].type === seg.type) {
        merged[merged.length - 1].text += seg.text;
      } else {
        merged.push(seg);
      }
    }

    return merged;
  };

  // Automatically load saved workspace status from local storage on mount
  useEffect(() => {
    const savedParagraphs = localStorage.getItem('autopapers_paragraphs');
    const savedFilename = localStorage.getItem('autopapers_filename');
    const savedHasUploaded = localStorage.getItem('autopapers_has_uploaded');

    if (savedParagraphs && savedFilename && savedHasUploaded === 'true') {
      try {
        setParagraphs(JSON.parse(savedParagraphs));
        setUploadedFilename(savedFilename);
        setHasUploaded(true);
      } catch (err) {
        console.error('Error restoring workspace storage state', err);
      }
    }
  }, []);
  const [uploadedFilename, setUploadedFilename] = useState('基于Java的教务管理系统.docx');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Character-level Longest Common Subsequence (LCS) Diff calculator
  const computeDiff = (oldStr: string, newStr: string): DiffSegment[] => {
    const dp: number[][] = Array(oldStr.length + 1).fill(0).map(() => Array(newStr.length + 1).fill(0));
    
    for (let i = 1; i <= oldStr.length; i++) {
      for (let j = 1; j <= newStr.length; j++) {
        if (oldStr[i - 1] === newStr[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const segments: DiffSegment[] = [];
    let i = oldStr.length;
    let j = newStr.length;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldStr[i - 1] === newStr[j - 1]) {
        segments.unshift({ type: 'unchanged', text: oldStr[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        segments.unshift({ type: 'added', text: newStr[j - 1] });
        j--;
      } else {
        segments.unshift({ type: 'removed', text: oldStr[i - 1] });
        i--;
      }
    }

    const merged: DiffSegment[] = [];
    for (const seg of segments) {
      if (merged.length > 0 && merged[merged.length - 1].type === seg.type) {
        merged[merged.length - 1].text += seg.text;
      } else {
        merged.push(seg);
      }
    }

    return merged;
  };

  // Automatically load saved workspace status from local storage on mount
  useEffect(() => {
    const savedParagraphs = localStorage.getItem('autopapers_paragraphs');
    const savedFilename = localStorage.getItem('autopapers_filename');
    const savedHasUploaded = localStorage.getItem('autopapers_has_uploaded');

    if (savedParagraphs && savedFilename && savedHasUploaded === 'true') {
      try {
        setParagraphs(JSON.parse(savedParagraphs));
        setUploadedFilename(savedFilename);
        setHasUploaded(true);
      } catch (err) {
        console.error('Error restoring workspace storage state', err);
      }
    }
  }, []);
  
  // Custom Paragraph Cards states for Workspace Diff View
  const [paragraphs, setParagraphs] = useState<MockParagraph[]>(MOCK_AIGC_PARAGRAPHS);
  const [paragraphViewModes, setParagraphViewModes] = useState<Record<number, 'diff' | 'final'>>({
    43: 'diff',
    44: 'diff'
  });
  const [regeneratingCards, setRegeneratingCards] = useState<Record<number, boolean>>({});

  // --- ACADEMIC POLISH STATES ---
  const [polishIntensity, setPolishIntensity] = useState<'light' | 'medium' | 'strong'>('medium');
  const [polishText, setPolishText] = useState(INITIAL_POLISH_TEXT);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedResult, setPolishedResult] = useState('');
  const [targetLang, setTargetLang] = useState<'zh' | 'en'>('en');

  // --- LAYOUT STATES ---
  const [selectedTemplate, setSelectedTemplate] = useState('tsinghua');
  const [citationInput, setCitationInput] = useState('Jia, G., & AutoPapers team. 2026. AetherPaper: A Premium Academic AI Workbench on Windows. https://github.com/GuoqiangJia/autopapers');
  const [citationOutput, setCitationOutput] = useState('');
  const [isGeneratingCitation, setIsGeneratingCitation] = useState(false);

  // --- REVIEW PANEL STATES ---
  const [selectedReviewer, setSelectedReviewer] = useState(0);

  // --- WORD COUNT BOOSTER STATES ---
  const [boosterInput, setBoosterInput] = useState('基于Java的系统选课性能表现良好。');
  const [boosterMode, setBoosterMode] = useState<'theory' | 'compare' | 'app'>('theory');
  const [boosterOutput, setBoosterOutput] = useState('');
  const [isBoosting, setIsBoosting] = useState(false);

  // --- THANKS STUDIO STATES ---
  const [thanksForm, setThanksForm] = useState({
    advisor: 'strict',
    friends: 'fun',
    family: 'loyal',
    cats: 'yes'
  });
  const [thanksOutput, setThanksOutput] = useState('');
  const [isGeneratingThanks, setIsGeneratingThanks] = useState(false);
  const [thanksSkin, setThanksSkin] = useState<'gold' | 'midnight'>('gold');

  // ==========================================
  // HELPERS: Typewriter & File Upload Simulations
  // ==========================================

  const simulateTypewriter = (fullText: string, setTextFn: React.Dispatch<React.SetStateAction<string>>, onComplete?: () => void) => {
    let index = 0;
    setTextFn('');
    const interval = setInterval(() => {
      setTextFn((prev) => prev + fullText.charAt(index));
      index++;
      if (index >= fullText.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 10);
    return () => clearInterval(interval);
  };

  // Trigger file select hidden input click
  const triggerDocumentUploadSimulation = () => {
    fileInputRef.current?.click();
  };

  // Real Multi-part Document Upload and Mammoth Parsing handler
  const handleRealDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStage('正在加载并初始化本地 fileStream...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Smooth dynamic progress simulation
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '文件上传解析异常');
      }

      const data = await response.json();
      setUploadProgress(100);
      setUploadStage('解析完毕，已成功渲染多维比对学术工作区！');

      setTimeout(() => {
        setParagraphs(data.paragraphs);
        setUploadedFilename(data.filename);
        setIsUploading(false);
        setHasUploaded(true);

        // Store to local persistent database (localStorage)
        localStorage.setItem('autopapers_paragraphs', JSON.stringify(data.paragraphs));
        localStorage.setItem('autopapers_filename', data.filename);
        localStorage.setItem('autopapers_has_uploaded', 'true');
      }, 400);

    } catch (err: any) {
      setIsUploading(false);
      alert(`文档导入失败: ${err.message}`);
    }
  };

  // Reset Document Upload State
  const handleResetDocument = () => {
    if (confirm('确认重置当前文档吗？这会清除所有本地已保存的改写进度。')) {
      setHasUploaded(false);
      setUploadProgress(0);
      setParagraphs(MOCK_AIGC_PARAGRAPHS);
      setUploadedFilename('基于Java的教务管理系统.docx');
      setParagraphViewModes({ 43: 'diff', 44: 'diff' });
      
      localStorage.removeItem('autopapers_paragraphs');
      localStorage.removeItem('autopapers_filename');
      localStorage.removeItem('autopapers_has_uploaded');
    }
  };

  // Export edited JSON segment array back to a downloadable Microsoft Word Document
  const handleExportWord = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paragraphs,
          filename: uploadedFilename
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '无法生成Word格式字节流');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const safeName = uploadedFilename.endsWith('.docx') 
        ? uploadedFilename.replace('.docx', '_降AIGC后.docx') 
        : `${uploadedFilename}_降AIGC后.docx`;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Word 文档生成失败: ${err.message}`);
    }
  };

  // Card-specific Real Paragraph Regeneration utilizing Google Gemini Edge endpoint
  const handleRegenerateCard = async (id: number) => {
    const cardParagraph = paragraphs.find(p => p.id === id);
    if (!cardParagraph) return;

    setRegeneratingCards(prev => ({ ...prev, [id]: true }));

    try {
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          originalText: cardParagraph.originalText
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '接口通信失败');
      }

      const data = await response.json();
      const newlyRegeneratedText = data.humanizedText;
      const newlyDiffSegments = computeDiff(cardParagraph.originalText, newlyRegeneratedText);

      setParagraphs(prevParagraphs => {
        const nextList = prevParagraphs.map(p => {
          if (p.id === id) {
            return {
              ...p,
              finalText: newlyRegeneratedText,
              diffSegments: newlyDiffSegments
            };
          }
          return p;
        });

        // Store updated progress array to local storage to protect data loss on refresh
        localStorage.setItem('autopapers_paragraphs', JSON.stringify(nextList));
        return nextList;
      });

    } catch (err: any) {
      alert(`单段重构失败: ${err.message}`);
    } finally {
      setRegeneratingCards(prev => ({ ...prev, [id]: false }));
    }
  };

  // Toggle single card viewMode
  const toggleCardViewMode = (id: number) => {
    setParagraphViewModes(prev => ({
      ...prev,
      [id]: prev[id] === 'diff' ? 'final' : 'diff'
    }));
  };

  // ==========================================
  // SINGLE TAB ACTIONS
  // ==========================================

  const handleHumanizeQuick = async () => {
    setIsHumanizingQuick(true);
    setHumanizedTextQuick('');
    
    try {
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ originalText: aigcTextQuick })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '接口执行失败');
      }

      let currentRate = 85;
      const rateInterval = setInterval(() => {
        currentRate -= 1;
        setAigcRateQuick(Math.max(currentRate, 12));
        if (currentRate <= 12) clearInterval(rateInterval);
      }, 30);

      simulateTypewriter(data.humanizedText || '未返回有效重构内容', setHumanizedTextQuick, () => {
        setIsHumanizingQuick(false);
      });
    } catch (err: any) {
      console.error("人化失败:", err);
      simulateTypewriter(`❌ 降重网络连接失败：${err.message || '网络错误'}\n\n【排查助手】\n1. 如果在本地运行，本系统已内置本地 Mock API 开发功能，运行极其便利。\n2. 如果您希望运行真实的 Google Gemini 大模型降重，请在系统环境变量或本地配置 GEMINI_API_KEY 即可自动无缝激活！`, setHumanizedTextQuick, () => {
        setIsHumanizingQuick(false);
      });
    }
  };

  const handleParaphraseQuick = () => {
    setIsParaphrasingQuick(true);
    setParaphrasedTextQuick('');

    let currentRate = 34.5;
    const rateInterval = setInterval(() => {
      currentRate -= 0.3;
      setPlagRateQuick(parseFloat(Math.max(currentRate, 8.2).toFixed(1)));
      if (currentRate <= 8.2) clearInterval(rateInterval);
    }, 20);

    setTimeout(() => {
      simulateTypewriter(PARAPHRASED_PLAGIARISM_TEXT_QUICK, setParaphrasedTextQuick, () => {
        setIsParaphrasingQuick(false);
      });
    }, 1500);
  };

  const handlePolish = () => {
    setIsPolishing(true);
    setPolishedResult('');
    setTimeout(() => {
      const targetText = POLISHED_TEXTS[polishIntensity];
      simulateTypewriter(targetText, setPolishedResult, () => {
        setIsPolishing(false);
      });
    }, 1200);
  };

  const handleCitationGenerate = () => {
    setIsGeneratingCitation(true);
    setCitationOutput('');
    setTimeout(() => {
      const output = `[1]贾国强, AutoPapers开发团队. 基于Java的智慧校区教务管理并发系统研发与实践[J]. 计算机应用与软件, 2026, 43(5): 112-118.`;
      simulateTypewriter(output, setCitationOutput, () => {
        setIsGeneratingCitation(false);
      });
    }, 800);
  };

  const handleBooster = () => {
    setIsBoosting(true);
    setBoosterOutput('');
    setTimeout(() => {
      let result = '';
      if (boosterMode === 'theory') {
        result = `针对大规模高强度的并发学籍排课及选课管理事务，本研究引入了基于Java并发调度队列的分布式削峰模型。通过重构JVM内存模型中的线程缓冲策略，在教务并发最高峰期将锁等待平均延迟控制在12ms以内，有效证明了本系统高并发吞吐体系在教务选课调度领域的应用合理性。`;
      } else if (boosterMode === 'compare') {
        result = `较之于传统的手工作业登记或老旧的传统架构单体管理系统，本项Java分布式选课架构方案依托热缓存池与线程池并发技术，整体界面查询渲染及排课计算耗时整体压缩了近54%。这不仅证明了Java底层在强类型校验方面的安全可靠度，也验证了其在大中型教务业务中的稳健表现。`;
      } else {
        result = `本研究所研发出的教务选课系统针对国内高职及普通本科院校在每学期初选课崩解、排班冲突、以及参考文献生成对不齐国标等迫切民生痛点，完美实现了即插即用型组件治理，能够产生深远的数字化智慧校园经济价值与学术研究溢出效益。`;
      }
      simulateTypewriter(result, setBoosterOutput, () => {
        setIsBoosting(false);
      });
    }, 1000);
  };

  const handleThanksGenerate = () => {
    setIsGeneratingThanks(true);
    setThanksOutput('');
    setTimeout(() => {
      let result = `在本次关于Java教务系统的毕业论文即将交付之即，我谨向指导我、陪伴我的所有人们致以最诚挚、温热的谢忱。\n\n`;
      if (thanksForm.advisor === 'strict') {
        result += `首先，我必须向我的指导教授致以最崇高的敬意。在论文写作和Java代码编写期间，老师以极其敏锐的学术严谨度指导着我，指出并重构了我杂乱、高耦合的多线程冗余代码，一遍遍打磨我的分析逻辑。正是这种追求卓越的高标准，才使得本系统最终具备实际应用价值。\n\n`;
      } else if (thanksForm.advisor === 'loyal') {
        result += `首先，特别感激我的指导恩师。在无数个被Java高并发死锁折磨得心力交瘁的夜晚，老师总是能耐心地给予我方向层面的温润指导，给予了我极其宽厚的治学与精神支撑。\n\n`;
      } else {
        result += `首先，感谢我的论文导师。他采取的前沿放养式态度极大地开发了我的独立Java研发和自学重构能力，使得我在应对复杂的教务调度模型时，拥有了不受约束的跨界探索激情。\n\n`;
      }

      if (thanksForm.friends === 'fun') {
        result += `此外，感谢宿舍开麦通宵的基友们，在我因为教务系统排课大纲逻辑卡死崩溃时，是你们递过来的烤串和寝室五排的欢声笑语将我拽出深渊。毕业大吉，谢谢你们陪伴我四年黑眼圈的生活。\n\n`;
      } else {
        result += `此外，衷心感谢在图书馆并肩改Bug、一同刷了数百道Java高并发题目的同舟共济者。那些在自习室咬牙啃下Spring Cloud分布式框架的白昼，是我们青春中最亮丽的科学记忆。\n\n`;
      }

      result += `最后，感谢我的父母，他们可能听不懂什么是Java垃圾回收或高并发，却总是默默在物质和生活上包容着我的奇特美学。`;
      if (thanksForm.cats === 'yes') {
        result += `感谢我怀中那只总在我输入代码时横跨在我的机械键盘上的猫，正是它提供了本项Java系统研发中不可估量的情绪慰藉。`;
      }

      simulateTypewriter(result, setThanksOutput, () => {
        setIsGeneratingThanks(false);
      });
    }, 1500);
  };

  // SVG Radar Chart Renderer (Procedural & Premium)
  const renderRadarChart = () => {
    const center = 140;
    const radius = 90;
    const pointsCount = RADAR_INDICATORS.length;
    const angleStep = (Math.PI * 2) / pointsCount;

    const webPaths: string[] = [];
    for (let level = 1; level <= 4; level++) {
      const currentRadius = (radius / 4) * level;
      const points: string[] = [];
      for (let i = 0; i < pointsCount; i++) {
        const x = center + currentRadius * Math.sin(i * angleStep);
        const y = center - currentRadius * Math.cos(i * angleStep);
        points.push(`${x},${y}`);
      }
      webPaths.push(`M ${points.join(' L ')} Z`);
    }

    const valPoints: string[] = [];
    for (let i = 0; i < pointsCount; i++) {
      const valRatio = RADAR_INDICATORS[i].value / RADAR_INDICATORS[i].max;
      const x = center + (radius * valRatio) * Math.sin(i * angleStep);
      const y = center - (radius * valRatio) * Math.cos(i * angleStep);
      valPoints.push(`${x},${y}`);
    }
    const polygonPath = `M ${valPoints.join(' L ')} Z`;

    return (
      <svg width="280" height="280" className="mx-auto select-none">
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(223, 192, 151, 0.4)" />
            <stop offset="100%" stopColor="rgba(223, 192, 151, 0.05)" />
          </radialGradient>
        </defs>
        
        {webPaths.map((path, idx) => (
          <path
            key={idx}
            d={path}
            fill="none"
            stroke="rgba(223, 192, 151, 0.15)"
            strokeWidth="1"
          />
        ))}

        {Array.from({ length: pointsCount }).map((_, i) => {
          const x = center + radius * Math.sin(i * angleStep);
          const y = center - radius * Math.cos(i * angleStep);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(223, 192, 151, 0.15)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          );
        })}

        <path
          d={polygonPath}
          fill="url(#radarFill)"
          stroke="var(--accent)"
          strokeWidth="2"
        />

        {RADAR_INDICATORS.map((ind, i) => {
          const labelDist = radius + 22;
          const x = center + labelDist * Math.sin(i * angleStep);
          const y = center - labelDist * Math.cos(i * angleStep);
          let textAnchor: "inherit" | "end" | "start" | "middle" | undefined = 'middle';
          if (Math.sin(i * angleStep) > 0.1) textAnchor = 'start';
          if (Math.sin(i * angleStep) < -0.1) textAnchor = 'end';
          return (
            <text
              key={i}
              x={x}
              y={y + 4}
              fill="var(--text-secondary)"
              fontSize="11"
              fontFamily="var(--font-sans)"
              textAnchor={textAnchor}
            >
              {ind.name} ({ind.value})
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <div className={theme === 'light' ? 'light-theme' : ''} style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      {/* Hidden native Word file input element */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleRealDocumentUpload} 
        accept=".docx" 
        style={{ display: 'none' }} 
      />
      
      {/* ==========================================
          SIDEBAR: Premium Navigation Menu
          ========================================== */}
      <div style={{
        position: 'relative',
        width: isSidebarCollapsed ? '72px' : '240px',
        borderRight: '1px solid var(--border-light)',
        padding: isSidebarCollapsed ? '24px 8px' : '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: theme === 'light' ? 'var(--bg-secondary)' : 'rgba(14, 18, 34, 0.4)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'visible'
      }}>
        {/* Floating Collapse Arrow sitting on the right boundary border line */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          style={{
            position: 'absolute',
            top: '30px', // perfectly aligned near the logo cap area for instant visibility
            right: '-10px', // hangs half-way over the right border line
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            cursor: 'pointer',
            zIndex: 100,
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15)';
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'var(--border-medium)';
          }}
          title={isSidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {isSidebarCollapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
        </button>

        <div>
          {/* Logo Brand */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            gap: '10px', 
            marginBottom: '36px', 
            paddingLeft: isSidebarCollapsed ? '0' : '8px' 
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(223, 192, 151, 0.12)',
              border: '1px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              boxShadow: '0 0 10px rgba(223, 192, 151, 0.2)',
              flexShrink: 0
            }}>
               <GraduationCap size={18} />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  Aura<span style={{ color: 'var(--accent)' }}>Paper</span>
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Academic Workbench
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'aigc', label: '降低AIGC率', desc: 'AIGC Humanizer', icon: Shield, badge: '核心' },
              { id: 'plagiarism', label: '降低重复率', desc: 'Similarity Shield', icon: TrendingDown },
              { id: 'polish', label: '学术润色', desc: 'Academic Polish', icon: Sparkles },
              { id: 'layout', label: '格式排版', desc: 'Layout & GB/T7714', icon: FileText },
              { id: 'review', label: 'AI审稿人', desc: 'Peer Review Panel', icon: Search },
              { id: 'booster', label: '凑字数神器', desc: 'Word Count Booster', icon: Plus, badge: '刚需' },
              { id: 'thanks', label: '致谢定制工坊', desc: 'Thanks Studio', icon: Heart }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                    backgroundColor: isActive ? 'rgba(223, 192, 151, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', width: '100%' }}>
                    <Icon 
                      size={16} 
                      style={{ 
                        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                        transition: 'color 0.2s',
                        flexShrink: 0
                      }} 
                    />
                    {!isSidebarCollapsed && (
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '13px', fontWeight: isActive ? '600' : '400', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {item.label}
                         </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {item.desc}
                        </div>
                      </div>
                    )}
                  </div>
                  {!isSidebarCollapsed && item.badge && (
                    <span style={{
                      fontSize: '9px',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: item.badge === '核心' ? 'rgba(223, 192, 151, 0.15)' : 'rgba(255, 100, 100, 0.15)',
                      color: item.badge === '核心' ? 'var(--accent)' : '#ff6464',
                      border: `1px solid ${item.badge === '核心' ? 'rgba(223, 192, 151, 0.2)' : 'rgba(255,100,100,0.2)'}`,
                      flexShrink: 0
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==========================================
          MAIN AREA: Integrated Interactive Workbench
          ========================================== */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        backgroundColor: 'var(--bg-primary)'
      }}>
        
        {/* Header ribbon */}
        <div style={{
          height: '64px',
          borderBottom: '1px solid var(--border-light)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>工作台</span>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {activeTab === 'aigc' && '1. 降低AIGC率 (AIGC Humanizer)'}
              {activeTab === 'plagiarism' && '2. 降低重复率 (Similarity Shield)'}
              {activeTab === 'polish' && '3. 学术润色 (Academic Polish)'}
              {activeTab === 'layout' && '4. 格式排版 (Layout & GB/T7714)'}
              {activeTab === 'review' && '5. AI审稿人 (Peer Review Panel)'}
              {activeTab === 'booster' && '6. 凑字数神器 (Word Count Booster)'}
              {activeTab === 'thanks' && '7. 致谢定制工坊 (Thanks Studio)'}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              padding: '4px 10px',
              borderRadius: '20px',
              border: '1px solid var(--border-light)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#52c41a' }}></span>
              AuraPaper 云端学术大模型对齐就绪 (知网 & GB/T 7714 规则库)
            </span>

            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-light)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              title={theme === 'dark' ? "切换至古籍象牙白纸张主题" : "切换至深邃护眼极夜主题"}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>

        {/* Content Wrapper */}
        <div style={{ padding: '32px', maxWidth: '1200px', width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* ==========================================
              TAB PANEL: 降低AIGC率 (AIGC Reducer)
              ========================================== */}
          {activeTab === 'aigc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Header Titles */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--text-primary)', margin: '0 0 8px' }}>
                    降低 AIGC 浓度比率
                  </h1>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    通过“浓度热力图”智能扫描文本中疑似AI生产的段落，利用“深度人化算法”完美将其润滑为具有严谨个人风格的高质学术笔触。
                  </p>
                </div>

                {/* Sub Mode Selection Selector tabs */}
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <button
                    onClick={() => setAigcMode('quick')}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: aigcMode === 'quick' ? 'var(--accent)' : 'transparent',
                      color: aigcMode === 'quick' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      fontWeight: aigcMode === 'quick' ? 'bold' : 'normal',
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ 快速单段改写
                  </button>
                  <button
                    onClick={() => setAigcMode('workspace')}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: aigcMode === 'workspace' ? 'var(--accent)' : 'transparent',
                      color: aigcMode === 'workspace' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      fontWeight: aigcMode === 'workspace' ? 'bold' : 'normal',
                      cursor: 'pointer'
                    }}
                  >
                    📄 全篇文档人化
                  </button>
                </div>
              </div>

              {/* ----------------- MODE A: QUICK MODE ----------------- */}
              {aigcMode === 'quick' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  


                  {/* Editors */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '360px' }}>
                      <div style={{ borderBottom: '1px solid var(--border-light)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>待降 AIGC 单段原稿</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>字数: {aigcTextQuick.length}</span>
                      </div>
                      <div style={{ padding: '16px', flex: 1 }}>
                        <textarea
                          value={aigcTextQuick}
                          onChange={(e) => setAigcTextQuick(e.target.value)}
                          style={{
                            width: '100%',
                            height: '100%',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text-primary)',
                            resize: 'none',
                            fontSize: '14px',
                            lineHeight: '1.8',
                            fontFamily: 'var(--font-sans)'
                          }}
                        />
                      </div>
                    </div>

                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '360px' }}>
                      <div style={{ borderBottom: '1px solid var(--border-light)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>人化后输出区 (AIGC：{aigcRateQuick}%)</span>
                        {humanizedTextQuick && (
                          <button 
                            onClick={() => navigator.clipboard.writeText(humanizedTextQuick)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Copy size={12} /> 复制
                          </button>
                        )}
                      </div>
                      <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
                        {isHumanizingQuick ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <div style={{ border: '3px solid rgba(223, 192, 151, 0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', width: '28px', height: '28px', animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: '12px', color: 'var(--accent)' }}>正在进行上下文语义降维、剔除翻译感...</span>
                          </div>
                        ) : humanizedTextQuick ? (
                          <div style={{ lineHeight: '1.8', fontSize: '14px', color: 'var(--accent-text)', whiteSpace: 'pre-wrap' }}>
                            {humanizedTextQuick}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                            点击“一键消除 AIGC 痕迹”按钮，调用学者改写网络。
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Centered Premium Pill Action Button linking input & output */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                    <button
                      onClick={handleHumanizeQuick}
                      disabled={isHumanizingQuick}
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '24px',
                        padding: '12px 40px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: isHumanizingQuick ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 24px var(--accent-glow)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isHumanizingQuick) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 12px 28px var(--accent-glow)';
                          e.currentTarget.style.opacity = '0.95';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 8px 24px var(--accent-glow)';
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <Sparkles size={16} />
                      {isHumanizingQuick ? '正在智能重构学术笔触...' : '一键消除 AIGC 痕迹 (免费智能降重)'}
                    </button>
                  </div>

                </div>
              )}

              {/* ----------------- MODE B: WORKSPACE MODE ----------------- */}
              {aigcMode === 'workspace' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* State 1: Upload Drag zone */}
                  {!hasUploaded && !isUploading && (
                    <div 
                      onClick={triggerDocumentUploadSimulation}
                      style={{
                        border: '2px dashed rgba(223, 192, 151, 0.3)',
                        borderRadius: '12px',
                        padding: '60px 20px',
                        textAlign: 'center',
                        backgroundColor: 'rgba(223, 192, 151, 0.01)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.backgroundColor = 'rgba(223, 192, 151, 0.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(223, 192, 151, 0.3)';
                        e.currentTarget.style.backgroundColor = 'rgba(223, 192, 151, 0.01)';
                      }}
                    >
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(223, 192, 151, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent)' }}>
                        <FileText size={24} style={{ margin: '0 auto' }} />
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                        拖拽 Word (.docx) 论文文档至此上传
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
                        系统将自动剔除大纲、公式、非正文及参考文献，仅对有效论文正文段落进行高精度分段 AIGC 痕迹降维改写。
                      </p>
                      <button style={{
                        marginTop: '16px',
                        backgroundColor: 'rgba(223, 192, 151, 0.1)',
                        border: '1px solid var(--accent)',
                        color: 'var(--accent)',
                        borderRadius: '6px',
                        padding: '6px 16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}>
                        选择本地文档
                      </button>
                    </div>
                  )}

                  {/* State 2: Uploading / Processing progress */}
                  {isUploading && (
                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                      <div style={{ border: '4px solid rgba(223, 192, 151, 0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1.s linear infinite' }} />
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px' }}>
                          正在智能解析与分段降 AIGC 处理中...
                        </h4>
                        <p style={{ fontSize: '11px', color: 'var(--accent)' }}>
                          {uploadStage}
                        </p>
                      </div>
                      {/* Progress bar container */}
                      <div style={{ width: '100%', maxWidth: '400px', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.1s linear' }} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {uploadProgress}%
                      </span>
                    </div>
                  )}

                  {/* State 3: WORKSPACE DIFF VIEW (COMPLETELY REPRODUCING SCREENSHOT) */}
                  {hasUploaded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* Document Toolbar Header Ribbon */}
                      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-medium)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{
                            fontSize: '11px',
                            backgroundColor: 'rgba(223, 192, 151, 0.15)',
                            color: 'var(--accent)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            border: '1px solid rgba(223, 192, 151, 0.2)'
                          }}>
                            降AIGC率
                          </span>
                          <span style={{
                            fontSize: '11px',
                            backgroundColor: 'rgba(82, 196, 26, 0.15)',
                            color: '#52c41a',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            border: '1px solid rgba(82, 196, 26, 0.2)'
                          }}>
                            深度人化
                          </span>
                          
                          {/* File Name */}
                          <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-primary)' }}>
                            {uploadedFilename}
                          </div>
                        </div>

                        {/* Metadata stats */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            消耗点数: <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>6,805 点</strong>
                          </span>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            处理进度: 
                            <span style={{ display: 'inline-block', width: '80px', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                              <span style={{ display: 'block', width: '100%', height: '100%', backgroundColor: 'var(--accent)' }}></span>
                            </span>
                            <strong style={{ color: 'var(--accent)' }}>100%</strong>
                          </span>

                          <button 
                            onClick={handleResetDocument}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            重置
                          </button>

                          <button 
                            onClick={handleExportWord}
                            style={{
                              backgroundColor: 'var(--accent)',
                              color: 'var(--bg-primary)',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 20px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 0 10px var(--accent-glow)'
                            }}
                          >
                            <Download size={14} /> 下载改写结果 (.docx)
                          </button>
                        </div>
                      </div>

                      {/* Header filter warning alert block */}
                      <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          ⚠️ 系统已过滤非正文（标题、大纲目录、参考文献等），默认保持不改写以护航文章格式。
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ✍️ 免费强制全部改写
                        </span>
                      </div>

                      {/* Parallel comparisons stack cards */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {paragraphs.map((p) => {
                          const isCardRegenerating = !!regeneratingCards[p.id];
                          const viewMode = paragraphViewModes[p.id] || 'diff';

                          if (p.type === 'header') {
                            return (
                              <div 
                                key={p.id}
                                style={{
                                  display: 'flex',
                                  backgroundColor: 'rgba(255,255,255,0.01)',
                                  border: '1px solid var(--border-light)',
                                  borderRadius: '8px',
                                  padding: '16px'
                                }}
                              >
                                <div style={{ width: '36px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'bold' }}>
                                  #{p.id}
                                </div>
                                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold' }}>
                                    非正文 (大纲标题)： {p.originalText}
                                  </span>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    已过滤不予改写 (保护原有格式)
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div 
                              key={p.id}
                              style={{
                                display: 'flex',
                                backgroundColor: 'rgba(14, 18, 34, 0.2)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '10px',
                                overflow: 'hidden'
                              }}
                            >
                              {/* Left margin index */}
                              <div style={{
                                width: '40px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                padding: '16px 0',
                                color: 'var(--text-muted)',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                borderRight: '1px solid var(--border-light)',
                                backgroundColor: 'rgba(255,255,255,0.01)'
                              }}>
                                #{p.id}
                              </div>

                              {/* Right main body content */}
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                
                                {/* 1. Original Text */}
                                <div style={{ borderBottom: '1px solid var(--border-light)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>原文</span>
                                  <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'var(--text-secondary)', margin: 0 }}>
                                    {p.originalText}
                                  </p>
                                </div>

                                {/* 2. Rewritten Text (Diff style) */}
                                <div style={{ padding: '16px', backgroundColor: 'rgba(223, 192, 151, 0.02)', borderBottom: '1px solid var(--border-light)', minHeight: '120px' }}>
                                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                                    改写 ({viewMode === 'diff' ? '对比视图' : '纯改后视图'})
                                  </span>
                                  
                                  {isCardRegenerating ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '12px', height: '60px' }}>
                                      <div style={{ border: '2px solid rgba(223, 192, 151, 0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                                      学者AI正在重算本段降重策略，重组红绿比对树...
                                    </div>
                                  ) : (
                                    <p style={{ fontSize: '13px', lineHeight: '1.8', margin: 0, color: 'var(--text-primary)' }}>
                                      {viewMode === 'diff' ? (
                                        p.diffSegments.map((seg, idx) => {
                                          if (seg.type === 'removed') {
                                            return (
                                              <del 
                                                key={idx}
                                                style={{
                                                  color: '#ff4d4f',
                                                  backgroundColor: 'rgba(255, 77, 79, 0.08)',
                                                  textDecoration: 'line-through',
                                                  padding: '0 2px',
                                                  margin: '0 1px'
                                                }}
                                              >
                                                {seg.text}
                                              </del>
                                            );
                                          } else if (seg.type === 'added') {
                                            return (
                                              <ins 
                                                key={idx}
                                                style={{
                                                  color: '#52c41a',
                                                  backgroundColor: 'rgba(82, 196, 26, 0.08)',
                                                  textDecoration: 'none',
                                                  padding: '0 4px',
                                                  borderRadius: '2px',
                                                  fontWeight: '500',
                                                  margin: '0 1px'
                                                }}
                                              >
                                                {seg.text}
                                              </ins>
                                            );
                                          }
                                          return <span key={idx}>{seg.text}</span>;
                                        })
                                      ) : (
                                        <span>{p.finalText}</span>
                                      )}
                                    </p>
                                  )}
                                </div>

                                {/* 3. Card footer action controls */}
                                <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                                  <span style={{ fontSize: '11px', color: '#52c41a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#52c41a' }}></span>
                                    已处理
                                  </span>

                                  <div style={{ display: 'flex', gap: '16px' }}>
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(p.finalText)}
                                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      复制段落
                                    </button>
                                    <button 
                                      onClick={() => toggleCardViewMode(p.id)}
                                      style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                      {viewMode === 'diff' ? '改后 (隐藏红字)' : '比对 (显示差异)'}
                                    </button>
                                    <button 
                                      onClick={() => handleRegenerateCard(p.id)}
                                      disabled={isCardRegenerating}
                                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', fontStyle: 'italic' }}
                                    >
                                      免费重新生成
                                    </button>
                                  </div>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* ==========================================
              TAB PANEL: 降低重复率 (Plagiarism Reducer)
              ========================================== */}
          {activeTab === 'plagiarism' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Header Titles */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--text-primary)', margin: '0 0 8px' }}>
                    降低重复率相似度 (知网 / 维普)
                  </h1>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    对比查重红区，重组词义与语法，在严格保留科研成果原意的前提下，快速降低在各大查重系统中的相似度指标。
                  </p>
                </div>

                {/* Sub Mode Selection Selector tabs */}
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <button
                    onClick={() => setPlagMode('quick')}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: plagMode === 'quick' ? 'var(--accent)' : 'transparent',
                      color: plagMode === 'quick' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      fontWeight: plagMode === 'quick' ? 'bold' : 'normal',
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ 快速单段改写
                  </button>
                  <button
                    onClick={() => setPlagMode('workspace')}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: plagMode === 'workspace' ? 'var(--accent)' : 'transparent',
                      color: plagMode === 'workspace' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      fontWeight: plagMode === 'workspace' ? 'bold' : 'normal',
                      cursor: 'pointer'
                    }}
                  >
                    📄 全篇文档降重
                  </button>
                </div>
              </div>

              {/* ----------------- MODE A: QUICK MODE ----------------- */}
              {plagMode === 'quick' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Action ribbon */}
                  <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {['cnki', 'vip', 'wanfang'].map((p) => (
                          <button
                            key={p}
                            onClick={() => setPlagPlatformQuick(p as any)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              border: plagPlatformQuick === p ? '1px solid var(--accent)' : '1px solid transparent',
                              backgroundColor: plagPlatformQuick === p ? 'rgba(223, 192, 151, 0.1)' : 'transparent',
                              color: plagPlatformQuick === p ? 'var(--accent)' : 'var(--text-secondary)',
                              fontSize: '13px',
                              textTransform: 'uppercase',
                              cursor: 'pointer'
                            }}
                          >
                            {p === 'cnki' ? '知网系统' : p === 'vip' ? '维普检测' : '万方数据库'}
                          </button>
                        ))}
                      </div>

                      <div style={{ borderLeft: '1px solid var(--border-light)', height: '24px' }} />

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={deepRewriteQuick} 
                          onChange={(e) => setDeepRewriteQuick(e.target.checked)} 
                          style={{ accentColor: 'var(--accent)' }} 
                        />
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>深度概念重构改写</span>
                      </label>
                    </div>

                    <button
                      onClick={handleParaphraseQuick}
                      disabled={isParaphrasingQuick}
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--bg-primary)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 24px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: isParaphrasingQuick ? 'not-allowed' : 'pointer',
                        boxShadow: '0 0 12px var(--accent-glow)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <TrendingDown size={16} />
                      {isParaphrasingQuick ? '正在消解查重词组...' : '执行一键降重改写 (消耗15算力)'}
                    </button>
                  </div>

                  {/* Dual Editor */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '360px' }}>
                      <div style={{ borderBottom: '1px solid var(--border-light)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>原始论文 / 查重重复红区</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>字数: {plagTextQuick.length}</span>
                      </div>
                      <div style={{ padding: '16px', flex: 1 }}>
                        <textarea
                          value={plagTextQuick}
                          onChange={(e) => setPlagTextQuick(e.target.value)}
                          style={{
                            width: '100%',
                            height: '100%',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text-primary)',
                            resize: 'none',
                            fontSize: '14px',
                            lineHeight: '1.8',
                            fontFamily: 'var(--font-sans)'
                          }}
                        />
                      </div>
                    </div>

                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '360px' }}>
                      <div style={{ borderBottom: '1px solid var(--border-light)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>降重后改写结果 (相似度：{plagRateQuick}%)</span>
                        {paraphrasedTextQuick && (
                          <button 
                            onClick={() => navigator.clipboard.writeText(paraphrasedTextQuick)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Copy size={12} /> 复制
                          </button>
                        )}
                      </div>
                      <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
                        {isParaphrasingQuick ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <div style={{ border: '3px solid rgba(223, 192, 151, 0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', width: '28px', height: '28px', animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: '12px', color: 'var(--accent)' }}>正在进行语序重组，多义词替换，降重绿标对齐中...</span>
                          </div>
                        ) : paraphrasedTextQuick ? (
                          <div style={{ lineHeight: '1.8', fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                            {paraphrasedTextQuick}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                            点击“执行一键降重改写”，查看同义消解与句型重排绿化成果。
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ----------------- MODE B: WORKSPACE MODE ----------------- */}
              {plagMode === 'workspace' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* File upload prompt trigger */}
                  {!hasUploaded && !isUploading && (
                    <div 
                      onClick={triggerDocumentUploadSimulation}
                      style={{
                        border: '2px dashed rgba(223, 192, 151, 0.3)',
                        borderRadius: '12px',
                        padding: '60px 20px',
                        textAlign: 'center',
                        backgroundColor: 'rgba(223, 192, 151, 0.01)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.backgroundColor = 'rgba(223, 192, 151, 0.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(223, 192, 151, 0.3)';
                        e.currentTarget.style.backgroundColor = 'rgba(223, 192, 151, 0.01)';
                      }}
                    >
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(223, 192, 151, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent)' }}>
                        <FileText size={24} style={{ margin: '0 auto' }} />
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                        拖拽 Word (.docx) 查重标记论文至此上传
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
                        上传后，教务引擎将自动定位重叠红色段落，进行并行语法异化降重，其余安全段落将保持100%原样不动，节省算力点。
                      </p>
                      <button style={{
                        marginTop: '16px',
                        backgroundColor: 'rgba(223, 192, 151, 0.1)',
                        border: '1px solid var(--accent)',
                        color: 'var(--accent)',
                        borderRadius: '6px',
                        padding: '6px 16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}>
                        打开查重原稿
                      </button>
                    </div>
                  )}

                  {/* Processing display */}
                  {isUploading && (
                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                      <div style={{ border: '4px solid rgba(223, 192, 151, 0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} />
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px' }}>
                          正在匹配知网重复红区及执行局部降重改写...
                        </h4>
                        <p style={{ fontSize: '11px', color: 'var(--accent)' }}>
                          {uploadStage}
                        </p>
                      </div>
                      <div style={{ width: '100%', maxWidth: '400px', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.1s linear' }} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {uploadProgress}%
                      </span>
                    </div>
                  )}

                  {/* Workspace Content rendering */}
                  {hasUploaded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* Ribbon */}
                      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-medium)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{
                            fontSize: '11px',
                            backgroundColor: 'rgba(255, 77, 79, 0.15)',
                            color: '#ff4d4f',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            border: '1px solid rgba(255, 77, 79, 0.2)'
                          }}>
                            知网查重
                          </span>
                          <span style={{
                            fontSize: '11px',
                            backgroundColor: 'rgba(82, 196, 26, 0.15)',
                            color: '#52c41a',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            border: '1px solid rgba(82, 196, 26, 0.2)'
                          }}>
                            自动降重
                          </span>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            基于Java的教务管理系统_知网查重后.docx
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                          <span style={{ fontSize: '13px' }}>
                            检测重复率: <strong style={{ color: '#ff4d4f', fontFamily: 'var(--font-mono)' }}>34.5% ➔ 8.2%</strong>
                          </span>
                          <button 
                            onClick={handleResetDocument}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
                          >
                            关闭
                          </button>
                          <button style={{
                            backgroundColor: 'var(--accent)',
                            color: 'var(--bg-primary)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <Download size={14} /> 一键导出降重版文档 (.docx)
                          </button>
                        </div>
                      </div>

                      {/* Stacked Paragraph cards */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {paragraphs.map((p) => {
                          const isCardRegenerating = !!regeneratingCards[p.id];
                          const viewMode = paragraphViewModes[p.id] || 'diff';

                          if (p.type === 'header') {
                            return (
                              <div key={p.id} style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px' }}>
                                <div style={{ width: '36px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'bold' }}>#{p.id}</div>
                                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold' }}>
                                    非正文结构： {p.originalText}
                                  </span>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>安全无重复，跳过降重处理</span>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={p.id} style={{ display: 'flex', backgroundColor: 'rgba(14, 18, 34, 0.2)', border: '1px solid var(--border-light)', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ width: '40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'bold', borderRight: '1px solid var(--border-light)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                                #{p.id}
                              </div>

                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ borderBottom: '1px solid var(--border-light)', padding: '16px' }}>
                                  <span style={{ fontSize: '11px', color: '#ff4d4f', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                                    知网查重标红句段
                                  </span>
                                  <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'var(--text-secondary)', margin: 0 }}>
                                    {p.originalText}
                                  </p>
                                </div>

                                <div style={{ padding: '16px', backgroundColor: 'rgba(82, 196, 26, 0.01)', borderBottom: '1px solid var(--border-light)' }}>
                                  <span style={{ fontSize: '11px', color: '#52c41a', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                                    降重规避改写 ({viewMode === 'diff' ? '对比视图' : '纯净改后'})
                                  </span>

                                  {isCardRegenerating ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '12px', height: '60px' }}>
                                      <div style={{ border: '2px solid rgba(223, 192, 151, 0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                                      正在动态消配同义词、逆向语序、调整高阶介词...
                                    </div>
                                  ) : (
                                    <p style={{ fontSize: '13px', lineHeight: '1.8', margin: 0 }}>
                                      {viewMode === 'diff' ? (
                                        p.diffSegments.map((seg, idx) => {
                                          if (seg.type === 'removed') {
                                            return (
                                              <del key={idx} style={{ color: '#ff4d4f', backgroundColor: 'rgba(255, 77, 79, 0.08)', textDecoration: 'line-through', padding: '0 2px' }}>
                                                {seg.text}
                                              </del>
                                            );
                                          } else if (seg.type === 'added') {
                                            return (
                                              <ins key={idx} style={{ color: '#52c41a', backgroundColor: 'rgba(82, 196, 26, 0.08)', textDecoration: 'none', padding: '0 4px', borderRadius: '2px', fontWeight: '500' }}>
                                                {seg.text}
                                              </ins>
                                            );
                                          }
                                          return <span key={idx}>{seg.text}</span>;
                                        })
                                      ) : (
                                        <span>{p.finalText}</span>
                                      )}
                                    </p>
                                  )}
                                </div>

                                <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                                  <span style={{ fontSize: '11px', color: '#52c41a' }}>已脱红降重合格 ✓</span>
                                  <div style={{ display: 'flex', gap: '16px' }}>
                                    <button onClick={() => navigator.clipboard.writeText(p.finalText)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer' }}>复制结果</button>
                                    <button onClick={() => toggleCardViewMode(p.id)} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                                      {viewMode === 'diff' ? '隐藏变动线' : '显示变动差异'}
                                    </button>
                                    <button onClick={() => handleRegenerateCard(p.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer' }}>重新选词重组</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* ==========================================
              TAB PANEL: 学术润色 (Academic Polish)
              ========================================== */}
          {activeTab === 'polish' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--text-primary)', margin: '0 0 8px' }}>
                  学术级语言美化润色 (Lexical Polish)
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  剔除论文中口语化、翻译腔、陈词滥调，针对学科性质升级为严谨地道、高逻辑性的中英文规范术语，实现Nature/IEEE论文质感。
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '320px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>润色强度:</span>
                    <div style={{ display: 'flex', gap: '4px', flex: 1, backgroundColor: 'var(--bg-tertiary)', padding: '2px', borderRadius: '6px' }}>
                      {(['light', 'medium', 'strong'] as const).map((intensity) => (
                        <button
                          key={intensity}
                          onClick={() => setPolishIntensity(intensity)}
                          style={{
                            flex: 1,
                            padding: '6px',
                            border: 'none',
                            borderRadius: '4px',
                            backgroundColor: polishIntensity === intensity ? 'var(--accent)' : 'transparent',
                            color: polishIntensity === intensity ? 'var(--bg-primary)' : 'var(--text-secondary)',
                            fontWeight: polishIntensity === intensity ? 'bold' : 'normal',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          {intensity === 'light' ? '轻微纠错' : intensity === 'medium' ? '核心美化' : '顶刊润色'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>目标语言:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => setTargetLang('en')}
                        style={{
                          padding: '4px 12px',
                          fontSize: '11px',
                          borderRadius: '4px',
                          border: targetLang === 'en' ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                          background: targetLang === 'en' ? 'rgba(223, 192, 151, 0.1)' : 'transparent',
                          color: targetLang === 'en' ? 'var(--accent)' : 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        英文 (English)
                      </button>
                      <button
                        onClick={() => setTargetLang('zh')}
                        style={{
                          padding: '4px 12px',
                          fontSize: '11px',
                          borderRadius: '4px',
                          border: targetLang === 'zh' ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                          background: targetLang === 'zh' ? 'rgba(223, 192, 151, 0.1)' : 'transparent',
                          color: targetLang === 'zh' ? 'var(--accent)' : 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        中文学术标
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePolish}
                  disabled={isPolishing}
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: isPolishing ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 12px var(--accent-glow)'
                  }}
                >
                  <Sparkles size={16} />
                  {isPolishing ? '顶级学者正在美化文风...' : '开始学术美化 (消耗20算力)'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '360px' }}>
                  <div style={{ borderBottom: '1px solid var(--border-light)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Java系统初稿文段</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>字数: {polishText.length}</span>
                  </div>
                  <div style={{ padding: '16px', flex: 1 }}>
                    <textarea
                      value={polishText}
                      onChange={(e) => setPolishText(e.target.value)}
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        resize: 'none',
                        fontSize: '14px',
                        lineHeight: '1.8',
                        fontFamily: 'var(--font-sans)'
                      }}
                    />
                  </div>
                </div>

                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '360px' }}>
                  <div style={{ borderBottom: '1px solid var(--border-light)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>美化润色结果</span>
                    {polishedResult && (
                      <button 
                        onClick={() => navigator.clipboard.writeText(polishedResult)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Copy size={12} /> 复制
                      </button>
                    )}
                  </div>
                  <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
                    {isPolishing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <div style={{ border: '3px solid rgba(223, 192, 151, 0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', width: '28px', height: '28px', animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: '12px', color: 'var(--accent)' }}>正在召遣学术连接词，提炼数据库句型骨骼...</span>
                      </div>
                    ) : polishedResult ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ lineHeight: '1.8', fontSize: '14px', color: 'var(--accent-text)', fontStyle: 'italic' }}>
                          {polishedResult}
                        </div>
                        <div style={{
                          borderLeft: '2px solid var(--accent)',
                          paddingLeft: '12px',
                          backgroundColor: 'rgba(223, 192, 151, 0.03)',
                          padding: '10px 14px',
                          borderRadius: '0 8px 8px 0',
                          fontSize: '12px',
                          color: 'var(--text-secondary)'
                        }}>
                          <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '4px' }}>🛡️ Java学术规范修改日志:</strong>
                          • 将 <em>"tries to find out"</em> 升级为客观陈述词 <em>"aims to investigate/identify"</em><br />
                          • 将口语词 <em>"very slow / very big"</em> 提炼为高内聚术语 <em>"database lock latency / pool bottleneck"</em><br />
                          • 重建长句逻辑，运用复合分词句型剔除简单主动句重叠。
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                        选择润色强度并点击开始，一秒润滑生硬中式英语或口语化技术大白话。
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB PANEL: 格式排版 (Layout Master)
              ========================================== */}
          {activeTab === 'layout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--text-primary)', margin: '0 0 8px' }}>
                  格式排版 & GB/T 7714 引文标准生成器
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  解决学校对教务系统论文的各种格式高频挑剔；一秒理清参考文献中作者、专著、出版社的不齐乱象。
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GraduationCap size={18} style={{ color: 'var(--accent)' }} />
                      选择毕业论文 / 科技文献标准排版大纲模板
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {TEMPLATES.map((tpl) => (
                        <div
                          key={tpl.id}
                          onClick={() => setSelectedTemplate(tpl.id)}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: selectedTemplate === tpl.id ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                            backgroundColor: selectedTemplate === tpl.id ? 'rgba(223, 192, 151, 0.04)' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: selectedTemplate === tpl.id ? 'var(--accent-text)' : 'var(--text-primary)' }}>
                              {tpl.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              页面规格: {tpl.size} | 引文规范: {tpl.doc}
                            </div>
                          </div>
                          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                            {tpl.type}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button style={{
                        flex: 1,
                        backgroundColor: 'var(--accent)',
                        color: 'var(--bg-primary)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                        <Download size={14} /> 一键应用模板并编译排版 (Word/LaTeX)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={16} style={{ color: 'var(--accent)' }} />
                      零门槛参考文献生成器 (GB/T 7714)
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      在下方粘贴任意杂乱的网页链接或残损标题，教务引擎将自动秒变完美标准国标。
                    </p>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        在此输入混乱的教务系统文献来源：
                      </label>
                      <textarea
                        value={citationInput}
                        onChange={(e) => setCitationInput(e.target.value)}
                        style={{
                          width: '100%',
                          height: '80px',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '6px',
                          padding: '10px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontFamily: 'var(--font-sans)',
                          outline: 'none',
                          resize: 'none'
                        }}
                      />
                    </div>

                    <button
                      onClick={handleCitationGenerate}
                      disabled={isGeneratingCitation}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(223, 192, 151, 0.1)',
                        border: '1px solid var(--accent)',
                        color: 'var(--accent)',
                        borderRadius: '6px',
                        padding: '8px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginBottom: '16px'
                      }}
                    >
                      {isGeneratingCitation ? '正在云端检索并格式化标准GB/T 7714...' : '一键生成国标引用格式'}
                    </button>

                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        GB/T 7714 标准格式输出结果：
                      </label>
                      <div style={{
                        backgroundColor: 'rgba(14, 18, 34, 0.4)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        padding: '12px',
                        fontSize: '12px',
                        color: 'var(--accent-text)',
                        minHeight: '80px',
                        fontFamily: 'var(--font-mono)',
                        lineHeight: '1.6'
                      }}>
                        {citationOutput || <span style={{ color: 'var(--text-muted)' }}>待一键处理生成...</span>}
                      </div>
                    </div>
                  </div>

                  {citationOutput && (
                    <button
                      onClick={() => navigator.clipboard.writeText(citationOutput)}
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--accent)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Copy size={12} /> 复制此参考文献条目
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB PANEL: AI审稿人 (Peer Reviewer)
              ========================================== */}
          {activeTab === 'review' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--text-primary)', margin: '0 0 8px' }}>
                  AI 论文同行评审面板 (Peer Review Simulator)
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  全真模拟教务系统学术评审流程。设立三位虚拟审稿人，从逻辑结构、并发机制、参考文献到排版给出极具修改价值的改进意见。
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {REVIEWER_FEEDBACK.map((fb, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedReviewer(idx)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '8px',
                          border: selectedReviewer === idx ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                          backgroundColor: selectedReviewer === idx ? 'rgba(223, 192, 151, 0.05)' : 'transparent',
                          color: selectedReviewer === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '12px',
                          fontWeight: selectedReviewer === idx ? 'bold' : 'normal',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>评审员 {idx + 1}</div>
                        {fb.reviewer.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                        <div>
                          <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>
                            {REVIEWER_FEEDBACK[selectedReviewer].reviewer}
                          </strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            评估决议: <span style={{ color: REVIEWER_FEEDBACK[selectedReviewer].status.includes('Major') ? '#ff4d4f' : '#faad14', fontWeight: 'bold' }}>{REVIEWER_FEEDBACK[selectedReviewer].status}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>子项评分</span>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                            {REVIEWER_FEEDBACK[selectedReviewer].score}/100
                          </div>
                        </div>
                      </div>

                      <div style={{
                        lineHeight: '1.8',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                        fontStyle: 'italic',
                        backgroundColor: 'rgba(255,255,255,0.01)',
                        padding: '16px',
                        borderRadius: '6px',
                        borderLeft: '3px solid var(--accent)'
                      }}>
                        "{REVIEWER_FEEDBACK[selectedReviewer].comment}"
                      </div>
                    </div>

                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={14} style={{ color: '#faad14' }} />
                        点击一键定位到特定标签并执行自动修复
                      </span>
                      <button 
                        onClick={() => setActiveTab(selectedReviewer === 1 ? 'layout' : 'polish')}
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: 'var(--bg-primary)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        前往一键修复
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 16px', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Compass size={16} style={{ color: 'var(--accent)' }} />
                      五维教务系统评估雷达 (System Radar Chart)
                    </h3>
                    {renderRadarChart()}
                  </div>

                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px' }}>
                      📝 审稿人修正大纲任务清单 (Actionable Checklist)
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { text: '第 3 节：补充多线程选课及核心 Java 并发线程池收敛数学配置模型。', reviewer: 'Reviewer #1' },
                        { text: '文献补齐：引入并对齐 2024~2025 年高吞吐缓存机制测试对比论文。', reviewer: 'Reviewer #2' },
                        { text: '图表精修：优化并重新导出高清 E-R 图，修补横坐标重合。', reviewer: 'Reviewer #3' }
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '8px',
                            backgroundColor: 'rgba(255,255,255,0.01)',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          <input type="checkbox" style={{ accentColor: 'var(--accent)', marginTop: '3px' }} />
                          <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4', margin: 0 }}>{item.text}</p>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>指派评委: {item.reviewer}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB PANEL: 凑字数神器 (Word Count Booster)
              ========================================== */}
          {activeTab === 'booster' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--text-primary)', margin: '0 0 8px' }}>
                  智能学术扩写器 ("凑字数神器")
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  针对 Java/教务管理类论点句子，自由选择“原理解析”、“对比论证”、“应用延展”三大维度，一键转化生成完全绿标通过的高学术质量扩写语段。
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>扩写分析机制:</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { id: 'theory', label: '原理解析 (丰富底层 JVM 并发)' },
                      { id: 'compare', label: '对比论证 (丰富强类型性能优势)' },
                      { id: 'app', label: '应用场景拓展 (丰富智慧校园应用广度)' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setBoosterMode(mode.id as any)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: boosterMode === mode.id ? '1px solid var(--accent)' : '1px solid transparent',
                          backgroundColor: boosterMode === mode.id ? 'rgba(223, 192, 151, 0.1)' : 'transparent',
                          color: boosterMode === mode.id ? 'var(--accent)' : 'var(--text-secondary)',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleBooster}
                  disabled={isBoosting}
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: isBoosting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 12px var(--accent-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={16} />
                  {isBoosting ? '智能扩增语句逻辑中...' : '一键学术扩写 (消耗10算力)'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '340px' }}>
                  <div style={{ borderBottom: '1px solid var(--border-light)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>教务草稿原句 (急需凑字数)</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>字数: {boosterInput.length} 字</span>
                  </div>
                  <div style={{ padding: '16px', flex: 1 }}>
                    <textarea
                      value={boosterInput}
                      onChange={(e) => setBoosterInput(e.target.value)}
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        resize: 'none',
                        fontSize: '14px',
                        lineHeight: '1.8',
                        fontFamily: 'var(--font-sans)'
                      }}
                    />
                  </div>
                </div>

                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '340px' }}>
                  <div style={{ borderBottom: '1px solid var(--border-light)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>丰满学风扩写成果</span>
                    {boosterOutput && (
                      <span style={{ fontSize: '11px', color: 'var(--accent)' }}>
                        扩写至: {boosterOutput.length} 字 (+{(boosterOutput.length - boosterInput.length)}字)
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
                    {isBoosting ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <div style={{ border: '3px solid rgba(223, 192, 151, 0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', width: '28px', height: '28px', animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: '12px', color: 'var(--accent)' }}>学者并发编译器正在解构原始大纲，填补科学前因后果...</span>
                      </div>
                    ) : boosterOutput ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ lineHeight: '1.8', fontSize: '14px', color: 'var(--accent-text)', whiteSpace: 'pre-wrap' }}>
                          {boosterOutput}
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(boosterOutput)}
                          style={{
                            alignSelf: 'flex-end',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'var(--accent)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Copy size={12} /> 复制成果段落
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                        选择适合的扩写模式并一键扩写，瞬间填补论文字数空白。
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB PANEL: 致谢定制工坊 (Thanks Studio)
              ========================================== */}
          {activeTab === 'thanks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--text-primary)', margin: '0 0 8px' }}>
                  千人千面“致谢”定制工坊 (Thanks Studio)
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  告别抄袭模板！勾选你写 Java 教务论文期间的酸甜苦辣，一键获得属于您个人情感、得体大气的论文致谢。
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                    致谢定制大纲问卷
                  </h3>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      1. 在你调试 Java 多线程死锁快要抓狂时，指导老师的风格？
                    </label>
                    <select
                      value={thanksForm.advisor}
                      onChange={(e) => setThanksForm({ ...thanksForm, advisor: e.target.value })}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        padding: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    >
                      <option value="strict">严厉至极，指出我代码垃圾并发耦合（完美主义高标准）</option>
                      <option value="loyal">温润慈祥，总在关键处给我指引（暖心明灯型）</option>
                      <option value="chill">完全放任，在自由探究中自生自灭（佛系大师）</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      2. 陪伴你在图书馆熬夜写 Java 选课系统的损友？
                    </label>
                    <select
                      value={thanksForm.friends}
                      onChange={(e) => setThanksForm({ ...thanksForm, friends: e.target.value })}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        padding: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    >
                      <option value="fun">开麦打游戏、熬夜刷段子的寝室开黑损友天团</option>
                      <option value="study">在图书馆抢座、一同手写 Java 经典框架的学霸考研盟友</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      3. 是否有爱宠在你的机械键盘上贡献情绪价值？
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
                        <input
                          type="radio"
                          name="cats"
                          checked={thanksForm.cats === 'yes'}
                          onChange={() => setThanksForm({ ...thanksForm, cats: 'yes' })}
                          style={{ accentColor: 'var(--accent)' }}
                        />
                        有宠物陪伴 (键盘踩碎者)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
                        <input
                          type="radio"
                          name="cats"
                          checked={thanksForm.cats === 'no'}
                          onChange={() => setThanksForm({ ...thanksForm, cats: 'no' })}
                          style={{ accentColor: 'var(--accent)' }}
                        />
                        无宠物 (孤军奋斗)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      4. 卡片皮肤配色样式 (一键复制 / 分享朋友圈)：
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setThanksSkin('gold')}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '4px',
                          border: thanksSkin === 'gold' ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                          background: thanksSkin === 'gold' ? 'rgba(223, 192, 151, 0.1)' : 'transparent',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        羊皮纸学术金 (Aura Gold)
                      </button>
                      <button
                        onClick={() => setThanksSkin('midnight')}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '4px',
                          border: thanksSkin === 'midnight' ? '1px solid #c084fc' : '1px solid var(--border-light)',
                          background: thanksSkin === 'midnight' ? 'rgba(192, 132, 252, 0.1)' : 'transparent',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        星空极夜紫 (Midnight Star)
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleThanksGenerate}
                    disabled={isGeneratingThanks}
                    style={{
                      marginTop: '10px',
                      backgroundColor: 'var(--accent)',
                      color: 'var(--bg-primary)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: isGeneratingThanks ? 'not-allowed' : 'pointer',
                      boxShadow: '0 0 12px var(--accent-glow)'
                    }}
                  >
                    {isGeneratingThanks ? '情感库编配中，正在起草致谢...' : '一键量身定制我的论文致谢'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    borderRadius: '12px',
                    padding: '32px',
                    minHeight: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-lg)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid var(--border-medium)',
                    background: thanksSkin === 'gold' 
                      ? 'linear-gradient(135deg, #0e1222 0%, #1a1e35 100%)' 
                      : 'linear-gradient(135deg, #070913 0%, #150e28 100%)'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-10%',
                      right: '-10%',
                      width: '180px',
                      height: '180px',
                      borderRadius: '50%',
                      backgroundColor: thanksSkin === 'gold' ? 'rgba(223, 192, 151, 0.05)' : 'rgba(192, 132, 252, 0.05)',
                      filter: 'blur(40px)',
                      pointerEvents: 'none'
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '14px', marginBottom: '14px' }}>
                      <span style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '14px',
                        color: thanksSkin === 'gold' ? 'var(--accent)' : '#c084fc',
                        letterSpacing: '1px',
                        fontWeight: '600'
                      }}>
                        ACKNOWLEDGMENT OF JAVA THESIS
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>AuraPaper Custom Studio</span>
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      {isGeneratingThanks ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                          <div style={{ border: '3px solid rgba(223, 192, 151, 0.1)', borderTopColor: thanksSkin === 'gold' ? 'var(--accent)' : '#c084fc', borderRadius: '50%', width: '28px', height: '28px', animation: 'spin 1s linear infinite' }} />
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>正在深度起跑，Java致谢书写中...</span>
                        </div>
                      ) : thanksOutput ? (
                        <div style={{
                          fontSize: '12px',
                          lineHeight: '1.8',
                          color: '#e2e8f0',
                          whiteSpace: 'pre-wrap',
                          maxHeight: '260px',
                          overflowY: 'auto',
                          paddingRight: '6px'
                        }}>
                          {thanksOutput}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                          请在左侧问卷勾选你的Java科研经历，并一键定制致谢。
                        </div>
                      )}
                    </div>

                    {thanksOutput && !isGeneratingThanks && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          印记: Java编译通过 · 毕业大吉 🎓
                        </span>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => navigator.clipboard.writeText(thanksOutput)}
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid var(--border-light)',
                              borderRadius: '4px',
                              padding: '4px 10px',
                              color: 'var(--accent)',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            复制全文
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
