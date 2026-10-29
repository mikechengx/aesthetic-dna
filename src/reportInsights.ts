import { photoScene, photoView } from './photoScenarios.ts';
import { COLOR_VARIANTS, QUESTIONS } from './content.ts';
import { analyze, cropRect, type Session } from './core.ts';
import { choiceReason, type Motive } from './questionDetails.ts';
import { translate, type Locale } from './i18n/translate.ts';
export type PersonalInsight = {
  id: string;
  title: string;
  text: string;
  evidenceIds: string[];
  questionIds: string[];
  kind: 'comparison' | 'self-report' | 'creation';
  metric?: string;
  metricLabel?: string;
};
export type PersonalReport = {
  headline?: string;
  headlineEvidenceIds: string[];
  cardTitle?: [string, string];
  summary: string;
  contexts: { questionId: string; label: string; variant: string; choice: string }[];
  insights: PersonalInsight[];
  nextSteps: PersonalInsight[];
  reasonCount: number;
};
/** Personalization is grounded in confirmed answers, never session IDs or random prose. */
export function personalReport(
  s: Session,
  r: ReturnType<typeof analyze>,
  locale: Locale,
): PersonalReport {
  const l = (zh: string, en: string) => (locale === 'zh' ? zh : en);
  const contexts = ['q03', 'q07', 'q16'].flatMap((id, i) => {
    const a = s.answers[id];
    if (a?.type !== 'pair') return [];
    const v = COLOR_VARIANTS.find((v) => v.id === a.value);
    return v
      ? [
          {
            questionId: id,
            label: l(
              ['住的空间', '穿的颜色', '海报表达'][i],
              ['The space you live in', 'The colors you wear', 'The poster you choose'][i],
            ),
            variant: l(
              v.label,
              ['Soft neutrals', 'Clear cool tones', 'Warm statement', 'High-energy contrast'][
                COLOR_VARIANTS.indexOf(v)
              ],
            ),
            choice: v.id,
          },
        ]
      : [];
  });
  const insights: PersonalInsight[] = [],
    nextSteps: PersonalInsight[] = [];
  const point = (
    id: string,
    title: string,
    text: string,
    ids: string[],
    kind: PersonalInsight['kind'],
    extra: Partial<PersonalInsight> = {},
  ): PersonalInsight => ({
    id,
    title,
    text,
    evidenceIds: ids,
    questionIds: [...new Set(ids.map((id) => id.slice(0, 3)))],
    kind,
    ...extra,
  });
  let headlineEvidenceIds: string[] = [];
  let headline: string | undefined, cardTitle: [string, string] | undefined;
  const room = contexts.find((c) => c.questionId === 'q03'),
    outfit = contexts.find((c) => c.questionId === 'q07');
  if (contexts.length >= 2) {
    const different = new Set(contexts.map((c) => c.choice)).size > 1;
    const text = contexts.map((c) => `${c.label}：${c.variant}`).join('；');
    insights.push(
      point(
        'context',
        different
          ? l('你把颜色，分给了不同的生活。', 'Different settings, different color voices.')
          : l('换了场景，你仍然认这组颜色。', 'A color language that travels with you.'),
        text +
          l(
            '。把这些放在一起看，才能看见你为不同场景保留的语气。',
            '. Together, they show the different voices you leave for different settings.',
          ),
        contexts.map((c) => c.questionId + '-choice'),
        'comparison',
      ),
    );
    if (room && outfit && room.choice !== outfit.choice) {
      headlineEvidenceIds = ['q03-choice', 'q07-choice'];
      const quietRoom = ['a', 'b'].includes(room.choice),
        quietOutfit = ['a', 'b'].includes(outfit.choice);
      if (quietRoom && !quietOutfit) {
        headline = l('住进安静，穿出声量。', 'Quiet room. Loud entrance.');
        cardTitle = [l('安静住下，', 'Quiet room.'), l('热烈出场。', 'Loud entrance.')];
      } else if (!quietRoom && quietOutfit) {
        headline = l('热烈留给空间，克制穿在身上。', 'Bold surroundings. A quieter silhouette.');
        cardTitle = [l('空间热烈，', 'A vivid world.'), l('衣着从容。', 'A quiet self.')];
      } else {
        headline = l(
          '同一种声量，你也分得出不同语气。',
          'Even quiet colors have different voices.',
        );
        cardTitle = [l('声量相近，', 'Similar volume.'), l('语气不同。', 'Different voices.')];
      }
    }
    if (different)
      nextSteps.push(
        point(
          'swap-context',
          l('把两种生活，交换一次颜色。', 'Swap the color settings.'),
          l(
            `你在${contexts[0].label}选了「${contexts[0].variant}」，在${contexts.find((c) => c.choice !== contexts[0].choice)!.label}用了另一种方向。给同一张空间草图试两套颜色，比较你愿意长期相处的，和只想看一眼的。`,
            `You chose ${contexts[0].variant.toLowerCase()} for ${contexts[0].label.toLowerCase()}, and another direction elsewhere. Try both palettes on one room sketch. Compare a mood you would live with and one you enjoy for a moment.`,
          ),
          contexts.map((c) => c.questionId + '-choice'),
          'comparison',
        ),
      );
  }
  const motivations = new Map<Motive, { labels: string[]; ids: string[] }>();
  for (const q of QUESTIONS) {
    const a = s.answers[q.id];
    if (a?.type !== 'pair' || !['a', 'b', 'c', 'd'].includes(a.value)) continue;
    const reason = choiceReason(q.id, a.reason);
    if (!reason) continue;
    const group = motivations.get(reason.motive) ?? { labels: [], ids: [] };
    group.labels.push(l(reason.label, reason.english));
    group.ids.push(q.id + '-reason');
    motivations.set(reason.motive, group);
  }
  const ranked = [...motivations.entries()].sort(
    (a, b) => b[1].ids.length - a[1].ids.length || a[0].localeCompare(b[0]),
  );
  const motives: Record<
    Motive,
    {
      title: [string, string];
      headline: [string, string];
      card: [[string, string], [string, string]];
      action: [string, string];
    }
  > = {
    clarity: {
      title: ['你反复照顾的是：看得清楚。', 'You keep making room for clarity.'],
      headline: ['把世界排清楚，再让重点发光。', 'Make it clear. Let the focal point shine.'],
      card: [
        ['先看清楚，', 'Clarity first.'],
        ['再让它发光。', 'Then let it shine.'],
      ],
      action: [
        '给同一份活动信息做两个版本：一个只留一个大标题，一个让三个信息同样醒目。请人看两秒，说出第一眼记住了什么。',
        'Make two versions of one event notice: a single dominant headline, and three equally loud pieces of information. Show each for two seconds and ask what stayed.',
      ],
    },
    atmosphere: {
      title: ['你在判断：我想不想待在这里。', 'You notice how an image makes you feel.'],
      headline: ['好看的前提，是情绪对得上。', 'First, the feeling has to fit.'],
      card: [
        ['情绪对上了，', 'A feeling fits.'],
        ['目光就留下。', 'The eye stays.'],
      ],
      action: [
        '保留同一张图的构图，只换冷暖两套颜色。写下它们各适合哪一个时间、什么样的心情，再决定你要哪种气氛。',
        'Keep one composition and try a warm and a cool palette. Name a time of day and a mood for each before deciding which atmosphere you want.',
      ],
    },
    rhythm: {
      title: ['你反复听见了画面里的节奏。', 'You keep noticing visual rhythm.'],
      headline: ['目光走过的地方，要有自己的节奏。', 'Give the wandering eye a rhythm.'],
      card: [
        ['目光游走，', 'An eye wanders.'],
        ['自有节奏。', 'A rhythm holds.'],
      ],
      action: [
        '用五个相同的矩形排两次：先等距重复，再只改变一个间隔。比较哪一个停顿最能让你的眼睛慢下来。',
        'Arrange five identical rectangles twice: first equally spaced, then with one changed gap. Notice which pause slows your eye down.',
      ],
    },
    surprise: {
      title: ['你会为一点意外，多看一眼。', 'A little surprise earns a second look.'],
      headline: ['日常有秩序，目光偏爱意外。', 'A little unexpected. A little more you.'],
      card: [
        ['熟悉之间，', 'Inside the familiar,'],
        ['留一点意外。', 'leave a surprise.'],
      ],
      action: [
        '给一张规则网格海报只破一次例：移动一个元素，其他全部保持。比较这一次意外是在帮助重点，还是分散注意。',
        'Break just one rule in a grid poster: move a single element and keep everything else. Does the surprise support the focus or distract from it?',
      ],
    },
    story: {
      title: ['你想留下的不只是画面，还有线索。', 'You keep the clues that let a story unfold.'],
      headline: ['细节留下来，故事才有地方发生。', 'Leave the details. Let a story happen.'],
      card: [
        ['细节留下，', 'Keep the details.'],
        ['故事发生。', 'Let stories happen.'],
      ],
      action: [
        '给同一场景做一张只留主体的裁切，再做一张保留两条环境线索的。分别用一句话说出它们在讲什么。',
        'Crop the same scene twice: isolate the subject, then keep two environmental clues. Give each frame a one-sentence story.',
      ],
    },
    tactility: {
      title: ['你的眼睛，也在想象触碰。', 'Your eyes imagine the touch.'],
      headline: ['先被质感叫住，再慢慢看清形状。', 'Texture first. Shape reveals itself.'],
      card: [
        ['目光靠近，', 'Come closer.'],
        ['质感发声。', 'Feel the surface.'],
      ],
      action: [
        '找一件有明显纹理的物品，用正面光和侧面光各拍一次。保留同样距离，比较什么光让触感更容易被想象。',
        'Photograph one textured object in frontal and side light at the same distance. Compare which light makes its surface easier to imagine.',
      ],
    },
  };
  if (ranked[0]?.[1].ids.length >= 2) {
    const [id, group] = ranked[0],
      m = motives[id];
    const tied = ranked[1]?.[1].ids.length === group.ids.length;
    insights.push(
      point(
        'motive',
        l(m.title[0], m.title[1]),
        group.labels.map((label) => `“${label}”`).join(l('、', ', ')) +
          l(
            `。这 ${group.ids.length} 次是你自己的解释，让反复出现的关注点更清楚。`,
            `. These ${group.ids.length} explanations make your recurring interests easier to see.`,
          ),
        group.ids,
        'self-report',
      ),
    );
    if (!headline && !tied) {
      headlineEvidenceIds = group.ids;
      headline = l(...m.headline);
      cardTitle = m.card.map((pair) => l(...pair)) as [string, string];
    }
    nextSteps.push(
      point(
        'motive-practice',
        l('把你最在意的，单独试一次。', 'Put your recurring interest to the test.'),
        l(...m.action),
        group.ids,
        'self-report',
      ),
    );
  }
  const c = s.answers.q05;
  if (c?.type === 'crop' && c.value.frozen && c.value.rig) {
    const v = c.value,
      rig = v.rig!;
    insights.push(
      point(
        'crop',
        l('这一张，是你走出来的视角。', 'You walked into this point of view.'),
        l(
          `在${photoScene(v)?.name}，你从「${photoView(v)?.name}」出发，把相机放在 ${rig.height.toFixed(2)} m 高度，站位 X ${rig.x.toFixed(1)} / Z ${rig.z.toFixed(1)} m，使用 ${Math.round(28 * v.zoom)} mm 焦距与 ${v.ratio} 画幅。你希望「${v.intent}」。这些是你的拍摄决定，不直接等同于审美能力或人格。`,
          `In ${photoScene(v)?.english}, you started from ${photoView(v)?.english.toLowerCase()}. Your camera is ${rig.height.toFixed(2)} m high at X ${rig.x.toFixed(1)} / Z ${rig.z.toFixed(1)} m, using a ${Math.round(28 * v.zoom)} mm lens and ${v.ratio} frame. Your intention: “${translate('en', v.intent)}”. These are observed shooting decisions, not a score of ability or personality.`,
        ),
        ['q05-crop'],
        'creation',
        {
          metric: `${Math.round(28 * v.zoom)} mm`,
          metricLabel: l('拍摄焦距', 'shooting focal length'),
        },
      ),
    );
    nextSteps.push(
      point(
        'frame-practice',
        l('换个站位，再拍一次。', 'Walk somewhere else. Shoot again.'),
        l(
          '保留焦距，走到人物另一侧；观察人物与地标的遮挡、间隔和大小怎样变化，再决定哪张更接近你的意图。',
          'Keep the lens and walk to the other side of the person. Compare overlap, separation and scale before deciding which photograph tells your story.',
        ),
        ['q05-crop'],
        'creation',
      ),
    );
  }
  if (c?.type === 'crop' && c.value.frozen && !c.value.rig) {
    const rect = cropRect(c.value),
      kept = Math.round(((rect.w * rect.h) / 1080000) * 100);
    insights.push(
      point(
        'crop',
        kept < 30
          ? l('你靠近了，也主动舍弃了。', 'A closer frame leaves things behind.')
          : l('你给环境，留了一个位置。', 'You leave room for the setting.'),
        l(
          `${photoScene(c.value) ? `在${photoScene(c.value)!.name}使用「${photoView(c.value)!.name}」。` : ''}你的 ${c.value.ratio} 画幅保留了原场景约 ${kept}% 的面积，取景目标是「${c.value.intent || '尚未说明'}」。当画幅收紧时，周围环境线索也会随之减少。`,
          `${photoScene(c.value) ? `${photoScene(c.value)!.english}, ${photoView(c.value)!.english.toLowerCase()}. ` : ''}Your ${c.value.ratio} frame keeps about ${kept}% of the source. Your intention is “${c.value.intent ? translate('en', c.value.intent) : 'not specified'}”. A tighter frame also leaves fewer clues about the surroundings.`,
        ),
        ['q05-crop'],
        'creation',
        { metric: `${kept}%`, metricLabel: l('原场景保留面积', 'of the source area retained') },
      ),
    );
    nextSteps.push(
      point(
        'frame-practice',
        l('给这一次取景，做一张反方向副本。', 'Make the opposite frame.'),
        kept < 30
          ? l(
              '这次你留下的面积不到三成。下一张把画面拉宽，至少多保留一条环境线索，再比较故事怎样改变。',
              'You kept less than a third of the source. Widen the next frame to include one more environmental clue and compare the story.',
            )
          : l(
              '这次你给环境留了空间。下一张更紧地裁切，让一个重点占据更多面积，再比较失去的线索是否值得。',
              'You left room for the setting. Crop tighter next time so one focal point takes more space. Decide whether the lost clues are worth it.',
            ),
        ['q05-crop'],
        'creation',
      ),
    );
  }
  const p = s.answers.q08;
  if (p?.type === 'palette') {
    const i = p.value.areas.indexOf(Math.max(...p.value.areas));
    const roles = l('背景|主体|点缀', 'background|main|accent').split('|');
    insights.push(
      point(
        'palette',
        l('你用面积，决定谁先开口。', 'You use area to decide which color speaks first.'),
        l(
          `${roles[i]}色 ${p.value.colors[i].toUpperCase()} 占 ${p.value.areas[i]}%，三色面积是 ${p.value.areas.join(' / ')}。你用颜色的面积，安排了画面的主次。`,
          `Your ${roles[i]} color ${p.value.colors[i].toUpperCase()} covers ${p.value.areas[i]}%; the full split is ${p.value.areas.join(' / ')}. These proportions arrange the visual hierarchy of your colors.`,
        ),
        ['q08-palette'],
        'creation',
        {
          metric: p.value.areas.join(' : '),
          metricLabel: l('三色面积分配', 'three-color area split'),
        },
      ),
    );
    if (nextSteps.length < 3)
      nextSteps.push(
        point(
          'palette-practice',
          l('颜色不换，只让主次换班。', 'Keep the colors. Change who leads.'),
          l(
            `保留 ${p.value.colors.map((c) => c.toUpperCase()).join('、')}，把最大与最小面积互换。比较「安静但不无聊」是否还是同一种感觉。`,
            `Keep ${p.value.colors.map((c) => c.toUpperCase()).join(', ')} and swap the largest and smallest areas. Does “quiet, never boring” still feel the same?`,
          ),
          ['q08-palette'],
          'creation',
        ),
      );
  }
  const poster = s.answers.q10;
  if (poster?.type === 'poster') {
    const a = poster.value;
    insights.push(
      point(
        'poster',
        l('你让标题，站在了这里。', 'This is where you place the headline.'),
        l(
          `${a.custom ? ['你选择了规则网格', '你选择了偏心排版', '你选择了自由叠放'][a.layout] : '你保留了起始布局'}，标题锚点位于画布横向 ${Math.round(a.x * 100)}%、纵向 ${Math.round(a.y * 100)}% 的位置，字号 ${a.size}。可以对照自己的作品，看看这个位置怎样引导第一眼。`,
          `${a.custom ? ['You selected the grid', 'You selected an off-center layout', 'You selected free layers'][a.layout] : 'You kept the starting layout'}. The title anchor is ${Math.round(a.x * 100)}% across and ${Math.round(a.y * 100)}% down the canvas, at size ${a.size}. Look back at your work and notice how this placement guides the first glance.`,
        ),
        ['q10-poster'],
        'creation',
      ),
    );
  }
  if (
    !headline &&
    r.axes[0].count >= 2 &&
    r.axes[1].count >= 2 &&
    !r.axes[0].mixed &&
    !r.axes[1].mixed
  ) {
    headlineEvidenceIds = [...r.axes[0].evidence, ...r.axes[1].evidence].map((e) => e.id);
    const ordered = r.axes[0].score < 0,
      vivid = r.axes[1].score > 0;
    headline = ordered
      ? vivid
        ? l('热烈有骨架，偏心有章法。', 'Bold color. A considered structure.')
        : l('先把关系排稳，再让画面呼吸。', 'Set the structure. Leave room to breathe.')
      : vivid
        ? l('颜色敢说，构图敢走。', 'Color speaks. Composition wanders.')
        : l('低声量的画面，也有自由的想法。', 'Quiet colors. A freer arrangement.');
  }
  const summary =
    contexts.length >= 2
      ? contexts.map((c) => `${c.label} / ${c.variant}`).join(l('；', ' · '))
      : (insights[0]?.title ??
        l(
          '多留几次选择，让你的取舍慢慢显影。',
          'Make a few more choices. Let your point of view develop.',
        ));
  return {
    headline,
    headlineEvidenceIds,
    cardTitle,
    summary,
    contexts,
    insights,
    nextSteps: nextSteps.slice(0, 3),
    reasonCount: [...motivations.values()].reduce((n, v) => n + v.ids.length, 0),
  };
}
