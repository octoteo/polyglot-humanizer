import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RULE_DIR = path.resolve(__dirname, '../../references/rules');

export const severityWeight = { P0: 4, P1: 3, P2: 2, P3: 1 };
export const runtimeVersion = '1.2.0';

export function loadRules(locale) {
  const p = path.join(RULE_DIR, `${locale}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function loadManifest() {
  return JSON.parse(fs.readFileSync(path.join(RULE_DIR, 'manifest.json'), 'utf8'));
}

export function protectText(text) {
  const spans = [];
  const patterns = [
    /```[\s\S]*?```/g,
    /`[^`\n]+`/g,
    /https?:\/\/[^\s)\]}>]+/g,
    /\[[^\]]+\]\(([^)]+)\)/g,
    /(?:^|\s)(?:[A-Za-z]:\\[^\s]+|\/(?:[^\s/]+\/)+[^\s]*)/gm,
  ];
  let masked = text;
  const mask = Array.from(text, ch => ch === '\n' ? '\n' : ' ');
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const start = m.index;
      const end = start + m[0].length;
      spans.push({ start, end, text: m[0] });
      for (let i = start; i < end; i++) if (mask[i] !== '\n') mask[i] = ' ';
    }
  }
  masked = mask.join('');
  const protectedMask = new Uint8Array(text.length);
  for (const s of spans) for (let i=s.start;i<s.end;i++) protectedMask[i]=1;
  const chars = Array.from(text);
  for (let i=0;i<chars.length;i++) if (protectedMask[i]) chars[i]=mask[i];
  return { text: chars.join(''), spans };
}

export function splitBlocks(text) {
  const blocks = [];
  const re = /(?:^|\n\s*\n)([^\n][\s\S]*?)(?=\n\s*\n|$)/g;
  for (const m of text.matchAll(re)) {
    const raw = m[1];
    const start = m.index + m[0].indexOf(raw);
    blocks.push({ text: raw, start, end: start + raw.length });
  }
  if (!blocks.length && text.trim()) blocks.push({ text, start: 0, end: text.length });
  return blocks;
}

export function detectLocale(text) {
  const han = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  if (han >= 4 && han >= latin * 0.25) return 'zh-CN';
  return 'en-US';
}

function compileRule(rule) {
  const flags = [...new Set((rule.flags || 'g').split('').concat('g'))].join('');
  return new RegExp(rule.pattern, flags);
}

function repeatedOpeners(block, locale) {
  const findings = [];
  const sentences = locale === 'zh-CN'
    ? block.split(/(?<=[。！？])/).map(s=>s.trim()).filter(Boolean)
    : block.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(Boolean);
  if (sentences.length < 3) return findings;
  const opener = s => locale === 'zh-CN'
    ? (s.match(/^([\u4e00-\u9fff]{1,4})/) || [,''])[1]
    : (s.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)?)/) || [,''])[1].toLowerCase();
  for (let i=0;i<=sentences.length-3;i++) {
    const a=opener(sentences[i]), b=opener(sentences[i+1]), c=opener(sentences[i+2]);
    if (a && a===b && b===c) findings.push({
      id: `${locale.toLowerCase()}-heuristic-repeated-opener`, locale, category:'rhythm', severity:'P2', evidence:'E1',
      text: sentences.slice(i,i+3).join(' '), message:'Three consecutive sentences share the same opening pattern.',
      rewrite:'Keep rhetorical repetition only when intentional; otherwise vary sentence structure.'
    });
  }
  return findings;
}

export function detectRegister(text, locale='zh-CN') {
  if (locale !== 'zh-CN') return 'general';
  const signals = [
    /申诉|复核/g,
    /证据|凭证|截图|记录/g,
    /争议|纠纷/g,
    /约定|履行|违约/g,
    /退款|退货|售后/g,
    /民法典|第\s*\d+\s*条|平台规则/g,
    /小法庭|人工判定|人工复核/g,
  ];
  let hits = 0;
  for (const re of signals) if (re.test(text)) hits++;
  return hits >= 3 ? 'legal-appeal' : 'general';
}

function applyRegisterGuards(blockText, locale, blockFindings, inheritedRegister='general') {
  const register = inheritedRegister !== 'general' ? inheritedRegister : detectRegister(blockText, locale);
  if (register !== 'legal-appeal') return blockFindings;
  const legalIssueContrast = /(?:退款|退货|反悔|无理由|虚拟商品|履行|约定|承诺|实际操作|实际结果|教程)/;
  const legalEnum = /(?:证据|凭证|截图|记录|页面|商品描述|聊天|约定|履行|救济|重作|退货|减少价款|报酬|第\s*\d+\s*条)/;
  return blockFindings.map(f => {
    if (['zh-contrast-001','zh-contrast-002','zh-contrast-003'].includes(f.id) && legalIssueContrast.test(f.text)) {
      return { ...f, severity:'P3', message:'法律/申诉语域中的真实争议区分；通常保留，除非只是重复强调。' };
    }
    if (f.id === 'zh-triad-001' && (legalEnum.test(f.text) || register === 'legal-appeal')) {
      return { ...f, severity:'P3', message:'法律/申诉语域中的证据、救济或条件枚举；通常属于必要结构。' };
    }
    return f;
  });
}

function aggregateBlockFindings(blockText, locale, blockFindings) {
  if (locale !== 'zh-CN') return [];
  const aggregates = [];
  const countById = new Map();
  for (const f of blockFindings) countById.set(f.id, (countById.get(f.id) || 0) + 1);

  if ((countById.get('zh-jargon-001') || 0) >= 3) {
    aggregates.push({
      id: 'zh-heuristic-jargon-cluster', locale, category: 'semantic-emptiness', severity: 'P1', evidence: 'E1',
      text: blockText, message: '同一段出现三个以上抽象业务词，语义被黑话遮蔽的风险较高。',
      rewrite: '恢复主体、动作、对象和可观察结果；不要用同义黑话互换。'
    });
  }

  const marketingCount = blockFindings.filter(f => f.id === 'zh-marketing-002').length;
  if (marketingCount >= 3) {
    aggregates.push({
      id: 'zh-heuristic-marketing-cluster', locale, category: 'marketing', severity: 'P1', evidence: 'E1',
      text: blockText, message: '同一段聚集多个宣传性形容词，可能在用情绪替代信息。',
      rewrite: '保留可验证特色，删除没有信息增量的宣传性修饰。'
    });
  }

  const academicIds = new Set(['zh-academic-001', 'zh-foundation-001', 'zh-transition-001']);
  const academicSignals = blockFindings.filter(f => academicIds.has(f.id));
  if (academicSignals.some(f => f.id === 'zh-academic-001') && academicSignals.length >= 3) {
    aggregates.push({
      id: 'zh-heuristic-academic-cluster', locale, category: 'translationese', severity: 'P1', evidence: 'E1',
      text: blockText, message: '同一段聚集多个学术模板信号，可能用框架性措辞代替研究内容。',
      rewrite: '优先写研究对象、方法和来源已有的结论，删除没有信息增量的“深入/关键/未来基础”包装。'
    });
  }
  return aggregates;
}

export function scanText(input, forcedLocale='auto') {
  const { text } = protectText(input);
  const findings = [];
  const blocks = splitBlocks(text);
  const documentRegister = detectRegister(text, 'zh-CN');
  for (const block of blocks) {
    const locale = forcedLocale === 'auto' ? detectLocale(block.text) : forcedLocale;
    const rules = loadRules(locale);
    const register = (locale === 'zh-CN' && documentRegister !== 'general') ? documentRegister : detectRegister(block.text, locale);
    const blockFindings = [];
    for (const rule of rules) {
      const re = compileRule(rule);
      for (const m of block.text.matchAll(re)) {
        blockFindings.push({
          id: rule.id, locale, category: rule.category, severity: rule.severity, evidence: rule.evidence,
          start: block.start + m.index, end: block.start + m.index + m[0].length,
          text: m[0], message: rule.message, rewrite: rule.rewrite
        });
      }
    }
    for (const f of repeatedOpeners(block.text, locale)) blockFindings.push(f);
    const guardedFindings = applyRegisterGuards(block.text, locale, blockFindings, register);
    findings.push(...guardedFindings);
    findings.push(...aggregateBlockFindings(block.text, locale, guardedFindings));
  }
  findings.sort((a,b)=>(severityWeight[b.severity]-severityWeight[a.severity]) || ((a.start??1e9)-(b.start??1e9)));
  const score = findings.reduce((s,f)=>s+severityWeight[f.severity],0);
  const strong = findings.filter(f=>f.severity==='P0'||f.severity==='P1').length;
  return { version:runtimeVersion, documentRegister, blocks: blocks.map(b=>{ const locale=forcedLocale==='auto'?detectLocale(b.text):forcedLocale; const register=(locale==='zh-CN' && documentRegister!=='general')?documentRegister:detectRegister(b.text, locale); return {locale, register, start:b.start,end:b.end}; }), score, strongFindings: strong, findings };
}

export function extractInvariants(text) {
  const bag = new Map();
  const occupied = new Uint8Array(text.length);
  const add=(kind,val)=>{
    const k=`${kind}:${val}`; bag.set(k,(bag.get(k)||0)+1);
  };
  const mark=(start,end)=>{ for(let i=start;i<end;i++) occupied[i]=1; };
  const overlaps=(start,end)=>{ for(let i=start;i<end;i++) if(occupied[i]) return true; return false; };
  const collect=(kind,re,valueFn=(m)=>m[0],normalize=(v)=>v)=>{
    for(const m of text.matchAll(re)) {
      const start=m.index, end=start+m[0].length;
      if(overlaps(start,end)) continue;
      add(kind, normalize(valueFn(m)));
      mark(start,end);
    }
  };

  // Ignore list/outline numbering as structure, not factual numeric content.
  for (const m of text.matchAll(/(?:^|\n)[ \t]*(?:\d{1,3}|[一二三四五六七八九十]{1,3})[.．、)](?=[ \t])/g)) {
    const local = m[0].search(/(?:\d|[一二三四五六七八九十])/);
    const start = m.index + Math.max(local, 0);
    mark(start, m.index + m[0].length);
  }

  collect('md-target', /\[[^\]]+\]\(([^)]+)\)/g, m=>m[1]);
  collect('url', /https?:\/\/[^\s)\]}>]+/g, m=>m[0], v=>v.replace(/[.,;:!?]+$/,''));
  collect('email', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi);
  collect('inline-code', /`[^`\n]+`/g);
  collect('relative-time', /(?:今天|昨天|明天|前天|后天|本周|上周|下周|这周|本月|上月|下月|这个月|上个月|下个月|今年|去年|明年|前年|后年)/g);
  collect('zh-number-range', /[零〇一二两三四五六七八九十百千万亿]+(?:到|至|[-—–])[零〇一二两三四五六七八九十百千万亿]+(?:年|个月|月|日|天|小时|分钟|秒|件|例|人|次|项|篇|台|元|万元|亿元|%|％)/g);
  collect('zh-number', /[零〇一二两三四五六七八九十百千万亿]+(?:年|个月|月|日|天|小时|分钟|秒|件|例|人|次|项|篇|台|元|万元|亿元|%|％)/g);
  collect('date', /\b20\d{2}[-\/.年](?:0?[1-9]|1[0-2])(?:[-\/.月](?:0?[1-9]|[12]\d|3[01])日?)?\b/g);
  collect('version', /\bv?\d+\.\d+(?:\.\d+)?(?:[-+][A-Za-z0-9.-]+)?\b/g);
  collect('number', /(?<![\w.])[-+]?\d+(?:\.\d+)?(?:%|％|ms|s|kg|g|GB|MB|TB|V|W|kW|MHz|GHz|°C|℃)?(?!\w)/g);
  return bag;
}

export function verifyPreservation(before, after) {
  const a=extractInvariants(before), b=extractInvariants(after);
  const missing=[], added=[];
  // Deterministic preservation protects the presence of unique factual tokens,
  // not their repetition count. Humanizing often removes duplicate mentions.
  // Claim-level completeness is enforced separately by the semantic claim ledger.
  for (const [k] of a) if (!b.has(k)) missing.push({token:k,count:1});
  for (const [k] of b) if (!a.has(k)) added.push({token:k,count:1});
  return { pass: missing.length===0 && added.length===0, missing, added };
}

export function validateRuleObject(r) {
  const required=['id','locale','category','severity','evidence','type','pattern','flags','message','rewrite'];
  const errors=[];
  for (const k of required) if (!(k in r)) errors.push(`missing ${k}`);
  if (!['zh-CN','en-US'].includes(r.locale)) errors.push('invalid locale');
  if (!['P0','P1','P2','P3'].includes(r.severity)) errors.push('invalid severity');
  if (!['E0','E1','E2','E3'].includes(r.evidence)) errors.push('invalid evidence');
  if (r.type !== 'regex') errors.push('invalid type');
  try { compileRule(r); } catch(e) { errors.push(`invalid regex: ${e.message}`); }
  return errors;
}
