import { AXES, QUESTIONS, SOURCE_NOTE } from './content.ts';
import { type Session } from './core.ts';
import { localizedReport } from './i18n/report.ts';
import { translate, type Locale } from './i18n/translate.ts';
export function downloadBlob(blob: Blob, name: string) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 10000);
}
export async function downloadPNG(source: string, name: string) {
  await document.fonts.ready;
  const u = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error('图片生成失败，请重试'));
      img.src = u;
    });
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('当前浏览器无法生成图片');
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob>((res, rej) =>
      c.toBlob((b) => (b ? res(b) : rej(new Error('图片导出失败'))), 'image/png'),
    );
    downloadBlob(blob, name);
  } finally {
    URL.revokeObjectURL(u);
  }
}
export function markdown(s: Session, locale: Locale = 'zh') {
  if (locale === 'en') return englishMarkdown(s);
  const r = localizedReport(s, 'zh');
  return `# 审美 DNA\n\n## ${r.title}\n\n${r.signature}\n\n日期：${new Date(s.createdAt).toLocaleDateString('zh-CN')}\n\n已完成 ${r.answered} / 16 步。本报告只描述本次选择，不是能力排名或固定人格。\n\n${personalMarkdown(r, 'zh')}## 创作性格 · 趣味解读\n\n### ${r.temperament.title}\n\n${r.temperament.tagline}\n\n${r.temperament.text}\n\n依据：${r.temperament.evidenceIds.join('、') || '当前线索不足'}\n\n## 你的侧重\n\n${r.focus.map((c) => `### ${c.title}\n\n${c.text}\n\n依据：${c.evidenceIds.join('、')}`).join('\n\n')}\n\n## 你的创作思路\n\n${r.thinking.map((c) => `### ${c.title}\n\n${c.text}\n\n依据：${c.evidenceIds.join('、')}`).join('\n\n')}\n\n## 偏好画像\n\n${r.axes.map((a) => `- ${AXES[a.id].name}：${a.label}（${a.count} 份独立方向证据）`).join('\n')}\n\n## 选择里的线索\n\n${r.claims.map((c) => `### ${c.title}\n\n${c.text}\n\n依据：${c.evidenceIds.join('、')}`).join('\n\n')}\n\n## 全部观察证据\n\n${r.evidence.map((e) => `- [${e.id}] 第 ${QUESTIONS.findIndex((q) => q.id === e.questionId) + 1} 题：${e.fact}`).join('\n')}\n\n## 三个小练习\n\n${r.exercises.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\n## 我的作品\n\n${[
    ['q05', '定格照片.png'],
    ['q08', '我的配色卡.png'],
    ['q10', '慢一拍海报.png'],
  ]
    .filter(([id]) => s.answers[id] && s.answers[id].type !== 'skip')
    .map(([, name]) => `- ${name}：请从报告页单独下载，保存到本文件旁。`)
    .join(
      '\n',
    )}\n\n## 关于本实验\n\n${SOURCE_NOTE}\n\n题库版本 ${s.questionSetVersion ?? 1} · 分析版本 ${s.analysisVersion} · 会话 ${s.id}\n`;
}

function englishMarkdown(s: Session) {
  const r = localizedReport(s, 'en');
  const claims = (items: typeof r.focus) =>
    items
      .map(
        (c) =>
          `### ${c.title}\n\n${c.text}\n\nEvidence: ${c.evidenceIds.join(', ') || 'More evidence needed'}`,
      )
      .join('\n\n');
  return `# Aesthetic DNA\n\n## ${r.title}\n\n${r.signature}\n\nDate: ${new Date(s.createdAt).toLocaleDateString('en-GB')}\n\n${r.answered} / 16 steps completed. This describes this session, not a fixed personality or ability ranking.\n\n${personalMarkdown(r, 'en')}## Your creative portrait\n\n### ${r.temperament.title}\n\n${r.temperament.tagline}\n\n${r.temperament.text}\n\nEvidence: ${r.temperament.evidenceIds.join(', ') || 'More evidence needed'}\n\n## What you notice\n\n${claims(r.focus)}\n\n## How you create\n\n${claims(r.thinking)}\n\n## Preference directions\n\n${r.axes.map((a) => `- ${a.name}: ${a.label} (${a.count} independent observations)`).join('\n')}\n\n## Patterns in your choices\n\n${claims(r.claims)}\n\n## All observation evidence\n\n${r.evidence.map((e) => `- [${e.id}] Step ${QUESTIONS.findIndex((q) => q.id === e.questionId) + 1}: ${e.fact}`).join('\n')}\n\n## Three small experiments\n\n${r.exercises.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\n## Your artworks\n\n${[
    ['q05', 'My-frame.png'],
    ['q08', 'My-color-story.png'],
    ['q10', 'My-screening-poster.png'],
  ]
    .filter(([id]) => s.answers[id] && s.answers[id].type !== 'skip')
    .map(([, name]) => `- ${name}: download separately from the report and save beside this file.`)
    .join(
      '\n',
    )}\n\n## About this experiment\n\n${translate('en', SOURCE_NOTE)}\n\nQuestion set ${s.questionSetVersion ?? 1} · Analysis ${s.analysisVersion} · Session ${s.id}\n`;
}

function personalMarkdown(r: ReturnType<typeof localizedReport>, locale: Locale) {
  if (!r.personal.insights.length) return '';
  const title = locale === 'zh' ? '只属于这次的细节' : 'The details that make this session yours';
  return `## ${title}\n\n${r.personal.insights.map((c) => `### ${c.title}\n\n${c.text}\n\n${locale === 'zh' ? '依据' : 'Evidence'}: ${c.evidenceIds.join(', ')}`).join('\n\n')}\n\n`;
}
