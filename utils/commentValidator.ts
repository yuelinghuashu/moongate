// utils/commentValidator.ts

// 敏感词列表（仅底线词汇）
const blockedKeywords = [
  '广告', '垃圾', '诈骗', '赌博', '色情', '暴力', 'fuck', 'shit', 'damn'
];

// 技术白名单（豁免词汇，需与敏感词冲突时使用）
const technicalWhitelist = [
  '暴力破解', '暴力枚举', '攻击向量', '死锁', '死循环', '垃圾回收', '垃圾收集'
];

// 构建正则表达式（大小写不敏感，自动转义）
const sensitiveRegex = new RegExp(
  blockedKeywords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i'
);

export interface ValidationResult {
  valid: boolean;
  message?: string;
  foundWords?: string[];
}

/**
 * 验证评论内容
 * @param content 用户输入的文本
 * @param maxLength 最大长度，默认 5000
 */
export function validateComment(content: string, maxLength: number = 5000): ValidationResult {
  // 1. 空内容检查
  if (!content?.trim()) {
    return { valid: false, message: '评论内容不能为空' };
  }

  // 2. 长度限制
  if (content.length > maxLength) {
    return { valid: false, message: `评论内容不能超过 ${maxLength} 个字符` };
  }

  // 3. 移除白名单词汇，避免误判
  let text = content;
  for (const word of technicalWhitelist) {
    text = text.replace(new RegExp(word, 'gi'), '');
  }

  // 4. 敏感词检测
  const matches = text.match(sensitiveRegex);
  if (matches) {
    const found = [...new Set(matches)];
    return {
      valid: false,
      message: `包含敏感词: ${found.join(', ')}`,
      foundWords: found
    };
  }

  return { valid: true };
}