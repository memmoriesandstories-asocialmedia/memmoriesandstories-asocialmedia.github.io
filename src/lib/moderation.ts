/**
 * 髒話與不當用語防止系統 (Profanity and Vulgarity Prevention System)
 * 支援繁體中文、簡體中文、英文及常見符號繞過檢測。
 */

// 白名單詞彙（包含敏感字但屬正常用詞）
const WHITELIST_WORDS = [
  '幹部',
  '幹事',
  '骨幹',
  '樹幹',
  '幹勁',
  '幹嘛',
  '公幹',
  '才幹',
  '幹練',
  '實幹',
  '主幹',
  '大幹一場',
  '苦幹',
  '高幹',
  '軀幹',
  '草泥馬', // 有時被當成羊駝，但如需封鎖亦可加入黑名單
];

// 中文不雅用語、辱罵、人身攻擊黑名單
const CHINESE_PROFANITY_LIST = [
  // 嚴重心態/親屬侮辱
  '幹你娘',
  '幹妳娘',
  '幹您娘',
  '幹你媽',
  '幹妳媽',
  '幹你全家',
  '操你媽',
  '操妳媽',
  '操你全家',
  '肏你媽',
  '日你媽',
  '操你大爺',
  '草泥馬的',
  '他媽的',
  '去你媽的',
  '媽的',
  '去死吧',
  '去死',
  '死全家',
  '死雜種',
  '狗娘養',
  '狗雜種',
  '雜種',
  '賤種',
  '賤人',
  '賤貨',
  '婊子',
  '臭婊子',
  '騷貨',
  '王八蛋',
  '王八羔子',
  '混蛋',
  '混帳',
  '吃屎',
  '吃大便',
  '死胖子',
  '下賤',

  // 粗鄙器官與動作
  '幹死',
  '強姦',
  '輪姦',
  '雞掰',
  '機掰',
  '擊敗人',
  '機掰人',
  '老二',
  '懶叫',
  '懶趴',
  '生殖器',
  '陰莖',
  '陰道',
  '打手槍',
  '自慰',
  '破鞋',
  '妓女',
  '嫖妓',
  '約炮',
  '約砲',

  // 人身侮辱與歧視
  '白痴',
  '白癡',
  '智障',
  '腦殘',
  '低能',
  '低能兒',
  '弱智',
  '腦子進水',
  '神經病',
  '瘋子',
  '畜生',
  '畜牲',
  '禽獸',
  '垃圾人',
  '廢物',
  '死人',
  '閉嘴滾',
  '滾遠點',
  '不要臉',

  // 台語音譯與網路縮寫
  '靠北',
  '靠杯',
  '靠妖',
  '靠夭',
  '三小',
  '林北',
  '林娘',
  '恁娘',
  '恁老母',
  '哭爸',
  '哭夭',
  'ㄍㄢˋ',
  'ㄐㄅ',
  'ㄎㄅ',
  'ㄙㄢㄒㄧㄠˇ',
  '87分不能再高',

  // 大陸常見髒話
  '傻逼',
  '煞筆',
  '牛逼哄哄',
  '裝逼',
  '逼樣',
  '二逼',
  '逼逼賴賴',
  '扯犢子',
  '滚犊子',
];

// 英文不雅用語、髒話、仇恨歧視黑名單
const ENGLISH_PROFANITY_LIST = [
  'fuck',
  'fucker',
  'fucking',
  'motherfucker',
  'shit',
  'shitty',
  'bullshit',
  'bitch',
  'bitches',
  'bastard',
  'asshole',
  'ass',
  'dick',
  'dickhead',
  'cock',
  'cunt',
  'pussy',
  'whore',
  'slut',
  'nigger',
  'nigga',
  'retard',
  'faggot',
  'dumbass',
  'jackass',
  'stfu',
  'kill yourself',
];

// 特殊單字（僅在未命中白名單時檢測，如「幹」）
const SENSITIVE_SINGLE_CHARS = ['幹', '操', '肏'];

export interface ModerationResult {
  isClean: boolean;
  flaggedWords: string[];
  cleanText: string;
  originalText: string;
  hasProfanity: boolean;
}

/**
 * 移除干擾字元（如空格、符號、特殊符號、點），但保留原文本長度或結構以利正規比對
 */
function normalizeForComparison(text: string): string {
  // 將常見替換符號還原或清理
  return text
    .toLowerCase()
    .replace(/[0o]/g, 'o')
    .replace(/[1li|]/g, 'l')
    .replace(/[@a]/g, 'a')
    .replace(/[\$s]/g, 's')
    .replace(/[\s\-_.*~`!@#$%^&()+=|\\\[\]{};:'",<>/?]+/g, '');
}

/**
 * 檢查輸入字串是否包含不雅用語，並回傳檢測結果與遮蔽後文字
 */
export function checkProfanity(text: string): ModerationResult {
  if (!text || typeof text !== 'string') {
    return {
      isClean: true,
      flaggedWords: [],
      cleanText: text || '',
      originalText: text || '',
      hasProfanity: false,
    };
  }

  const flaggedWordsSet = new Set<string>();
  let cleanText = text;

  // 1. 先暫時替換白名單詞彙以保護正常詞
  const whitelistPlaceholders: { placeholder: string; original: string }[] = [];
  let protectedText = text;

  WHITELIST_WORDS.forEach((word, idx) => {
    if (protectedText.includes(word)) {
      const placeholder = `__SAFE_WORD_${idx}__`;
      whitelistPlaceholders.push({ placeholder, original: word });
      protectedText = protectedText.split(word).join(placeholder);
    }
  });

  // 2. 檢測中文片語黑名單
  CHINESE_PROFANITY_LIST.forEach((word) => {
    // 建立允許中間包含非中文字元（如「幹.你.娘」）的正規表示式
    const escapedChars = word.split('').map((char) => {
      return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    });
    const regexPattern = escapedChars.join('[\\s\\-_.*~`!@#$%^&()+=|<>?,/]*');
    const regex = new RegExp(regexPattern, 'gi');

    if (regex.test(protectedText)) {
      flaggedWordsSet.add(word);
      // 替換為星號
      cleanText = cleanText.replace(regex, (match) => '*'.repeat(match.length));
      protectedText = protectedText.replace(regex, (match) => '*'.repeat(match.length));
    }
  });

  // 3. 檢測英文黑名單
  ENGLISH_PROFANITY_LIST.forEach((word) => {
    const escapedChars = word.split('').map((char) => {
      return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    });
    // 允許 letter 之間有空格或標點，且前後有單詞邊界或非英文字母
    const regexPattern = `(?:^|[^a-zA-Z0-9])(${escapedChars.join('[\\s\\-_.*~`!@#$%^&()+=|<>?,/]*')})(?=[^a-zA-Z0-9]|$)`;
    const regex = new RegExp(regexPattern, 'gi');

    let match;
    while ((match = regex.exec(protectedText)) !== null) {
      const matchedStr = match[1];
      if (matchedStr) {
        flaggedWordsSet.add(word);
        cleanText = cleanText.replace(matchedStr, '*'.repeat(matchedStr.length));
        protectedText = protectedText.replace(matchedStr, '*'.repeat(matchedStr.length));
      }
    }
  });

  // 4. 針對單一強烈粗口字元（如獨立出現的「幹」）進行語意保護過濾
  SENSITIVE_SINGLE_CHARS.forEach((char) => {
    const regex = new RegExp(char, 'g');
    if (regex.test(protectedText)) {
      // 確保不是剛才被替換的白名單標記
      flaggedWordsSet.add(char);
      cleanText = cleanText.replace(regex, '*');
      protectedText = protectedText.replace(regex, '*');
    }
  });

  // 5. 還原白名單詞彙
  whitelistPlaceholders.forEach(({ placeholder, original }) => {
    cleanText = cleanText.split(placeholder).join(original);
  });

  const flaggedWords = Array.from(flaggedWordsSet);
  const hasProfanity = flaggedWords.length > 0;

  return {
    isClean: !hasProfanity,
    flaggedWords,
    cleanText,
    originalText: text,
    hasProfanity,
  };
}

/**
 * 產生針對使用者的友善警示提示語
 */
export function getProfanityWarning(flaggedWords: string[]): string {
  if (flaggedWords.length === 0) return '';
  const wordList = flaggedWords.slice(0, 3).map((w) => `「${w}」`).join('、');
  const moreText = flaggedWords.length > 3 ? ` 等 ${flaggedWords.length} 個詞彙` : '';
  return `內容偵測到不當用語 ${wordList}${moreText}，請修改文字以維持友善的交流環境。`;
}

/**
 * 快速遮罩字串中的不雅字（回傳乾淨文字）
 */
export function sanitizeText(text: string): string {
  return checkProfanity(text).cleanText;
}
