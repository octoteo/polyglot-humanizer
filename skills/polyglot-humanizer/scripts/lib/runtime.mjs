import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RULE_DIR = path.resolve(__dirname, '../../references/rules');

export const severityWeight = { P0: 4, P1: 3, P2: 2, P3: 1 };

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

export function scanText(input, forcedLocale='auto') {
  const { text } = protectText(input);
  const findings = [];
  const blocks = splitBlocks(text);
  for (const block of blocks) {
    const locale = forcedLocale === 'auto' ? detectLocale(block.text) : forcedLocale;
    const rules = loadRules(locale);
    for (const rule of rules) {
      const re = compileRule(rule);
      for (const m of block.text.matchAll(re)) {
        findings.push({
          id: rule.id, locale, category: rule.category, severity: rule.severity, evidence: rule.evidence,
          start: block.start + m.index, end: block.start + m.index + m[0].length,
          text: m[0], message: rule.message, rewrite: rule.rewrite
        });
      }
    }
    for (const f of repeatedOpeners(block.text, locale)) findings.push(f);
  }
  findings.sort((a,b)=>(severityWeight[b.severity]-severityWeight[a.severity]) || ((a.start??1e9)-(b.start??1e9)));
  const score = findings.reduce((s,f)=>s+severityWeight[f.severity],0);
  const strong = findings.filter(f=>f.severity==='P0'||f.severity==='P1').length;
  return { version:'1.0.0', blocks: blocks.map(b=>({locale: forcedLocale==='auto'?detectLocale(b.text):forcedLocale, start:b.start,end:b.end})), score, strongFindings: strong, findings };
}

export function extractInvariants(text) {
  const bag = new Map();
  const occupied = new Uint8Array(text.length);
  const add=(kind,val)=>{ const k=`${kind}:${val}`; bag.set(k,(bag.get(k)||0)+1); };
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

  collect('md-target', /\[[^\]]+\]\(([^)]+)\)/g, m=>m[1]);
  collect('url', /https?:\/\/[^\s)\]}>]+/g, m=>m[0], v=>v.replace(/[.,;:!?]+$/,''));
  collect('email', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi);
  collect('inline-code', /`[^`\n]+`/g);
  collect('date', /\b20\d{2}[-\/.年](?:0?[1-9]|1[0-2])(?:[-\/.月](?:0?[1-9]|[12]\d|3[01])日?)?\b/g);
  collect('version', /\bv?\d+\.\d+(?:\.\d+)?(?:[-+][A-Za-z0-9.-]+)?\b/g);
  collect('number', /(?<![\w.])[-+]?\d+(?:\.\d+)?(?:%|％|ms|s|kg|g|GB|MB|TB|V|W|kW|MHz|GHz|°C|℃)?(?!\w)/g);
  return bag;
}

export function verifyPreservation(before, after) {
  const a=extractInvariants(before), b=extractInvariants(after);
  const missing=[], added=[];
  for (const [k,n] of a) if ((b.get(k)||0)<n) missing.push({token:k,count:n-(b.get(k)||0)});
  for (const [k,n] of b) if ((a.get(k)||0)<n) added.push({token:k,count:n-(a.get(k)||0)});
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
