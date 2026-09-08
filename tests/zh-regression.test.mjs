import test from 'node:test';
import assert from 'node:assert/strict';
import { scanText, verifyPreservation } from '../skills/polyglot-humanizer/scripts/lib/runtime.mjs';

const realLikeCases = [
  {
    name: 'business abstraction plus unsupported significance',
    text: '本次功能升级以用户体验为核心抓手，通过上线订单页自助退款入口，进一步赋能售后服务提质增效。上线后，每天需要人工处理的退款工单从 120 件降到 45 件，充分彰显了团队持续创新的卓越能力。',
    expectIds: ['zh-inflation-002', 'zh-heuristic-jargon-cluster']
  },
  {
    name: 'marketing adjective cluster and forced triad',
    text: '坐落在风景如画的杭州市中心，这家咖啡馆拥有丰富的文化底蕴和令人叹为观止的装饰。它作为城市咖啡文化的焦点，为顾客提供无缝、直观和充满活力的体验。',
    expectIds: ['zh-heuristic-marketing-cluster', 'zh-triad-001']
  },
  {
    name: 'generic academic inflation',
    text: '本研究深入探讨了机器学习在医疗诊断中的关键作用，突出了其在不断演变的医疗格局中的重要性。此外，它为该领域的未来发展奠定了坚实的基础。',
    expectIds: ['zh-academic-001', 'zh-foundation-001', 'zh-heuristic-academic-cluster']
  },
  {
    name: 'cross-clause fake contrast with vague authority',
    text: '人工智能不仅仅是一种技术，它是我们思考未来的方式的革命。行业专家认为这将对整个社会产生持久影响。',
    expectIds: ['zh-contrast-003', 'zh-attribution-001']
  }
];

for (const c of realLikeCases) {
  test(`zh regression: ${c.name}`, () => {
    const result = scanText(c.text);
    assert.equal(result.version, '1.1.0');
    const ids = new Set(result.findings.map(x => x.id));
    for (const id of c.expectIds) assert.ok(ids.has(id), `missing ${id}`);
    assert.ok(result.strongFindings >= 1, 'expected at least one strong finding');
  });
}

test('legitimate transition and real three-item list remain weak-only', () => {
  const text = '此外，附件列出了三项实测指标：延迟、吞吐量和错误率。三项数据都来自同一轮压力测试。';
  const result = scanText(text);
  assert.equal(result.strongFindings, 0);
});

test('named expert is not treated as vague attribution by the deterministic pattern', () => {
  const text = '专家张伟在论文中指出，该方法在测试集上的准确率为 92%。';
  const result = scanText(text);
  assert.ok(!result.findings.some(x => x.id === 'zh-attribution-001'));
});

test('preservation catches newly invented Chinese-number chronology', () => {
  const before = '这家咖啡馆位于杭州市中心。';
  const after = '这家咖啡馆在杭州市中心开了三年。';
  const result = verifyPreservation(before, after);
  assert.equal(result.pass, false);
  assert.ok(result.added.some(x => x.token === 'zh-number:三年'));
});

test('preservation catches newly invented relative time', () => {
  const before = '有人讨论人工智能对工作的影响。';
  const after = '上周有人讨论人工智能对工作的影响。';
  const result = verifyPreservation(before, after);
  assert.equal(result.pass, false);
  assert.ok(result.added.some(x => x.token === 'relative-time:上周'));
});

test('concrete foundation statement remains weak-only', () => {
  const text = '完成硬件标定后，团队获得了后续温漂实验所需的基线参数，为第二阶段测试奠定了基础。';
  const result = scanText(text);
  assert.equal(result.strongFindings, 0);
  assert.ok(result.findings.some(x => x.id === 'zh-foundation-001'));
});

test('single legitimate academic phrase remains weak-only', () => {
  const text = '本研究深入分析了三种算法的误差来源，结果见表 2。';
  const result = scanText(text);
  assert.equal(result.strongFindings, 0);
});
