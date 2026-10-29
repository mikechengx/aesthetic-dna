/** Follow-ups describe a choice; they never add a second preference-axis vote. */
export type Motive = 'clarity' | 'atmosphere' | 'rhythm' | 'surprise' | 'story' | 'tactility';
export type ChoiceReason = { id: string; label: string; english: string; motive: Motive };
const reason = (id: string, label: string, english: string, motive: Motive): ChoiceReason => ({
  id,
  label,
  english,
  motive,
});
export const QUESTION_DETAILS: Record<
  string,
  { prompt: string; english: string; reasons: ChoiceReason[] }
> = {
  q02: {
    prompt: '这张海报，究竟哪一点留住了你？',
    english: 'What makes this poster work for you?',
    reasons: [
      reason('read-first', '第一眼就读得清楚', 'I can read it at a glance', 'clarity'),
      reason('type-rhythm', '字与图之间有节奏', 'The type and image have a rhythm', 'rhythm'),
      reason(
        'break-pattern',
        '不太按常理，但有记忆点',
        'Unexpected, and hard to forget',
        'surprise',
      ),
    ],
  },
  q03: {
    prompt: '如果真的住进去，你最在意什么？',
    english: 'If you lived here, what would matter most?',
    reasons: [
      reason('restful-room', '能让我放松下来', 'It helps me unwind', 'atmosphere'),
      reason(
        'room-focus',
        '家具和重点看得清楚',
        'The furniture and focal points read clearly',
        'clarity',
      ),
      reason(
        'room-surprise',
        '每天看见都有一点新鲜',
        'It keeps everyday life interesting',
        'surprise',
      ),
    ],
  },
  q04: {
    prompt: '这本杂志，你会为了什么再翻一次？',
    english: 'What would bring you back to this magazine?',
    reasons: [
      reason('cover-breath', '阅读时有停顿和呼吸', 'The pauses and breathing room', 'rhythm'),
      reason('cover-story', '细节里藏着更多故事', 'More stories hidden in the details', 'story'),
      reason('cover-focus', '第一眼就知道看哪里', 'I know where to look first', 'clarity'),
    ],
  },
  q06: {
    prompt: '这面建筑，什么让你愿意停下来？',
    english: 'What makes you linger at this facade?',
    reasons: [
      reason(
        'facade-rhythm',
        '重复或错落形成的节奏',
        'The rhythm of repetition or offsets',
        'rhythm',
      ),
      reason('facade-clarity', '结构关系很清楚', 'Its structure is easy to read', 'clarity'),
      reason('facade-surprise', '有一处打破预期', 'Something breaks the expectation', 'surprise'),
    ],
  },
  q07: {
    prompt: '这身颜色，你希望它替你做什么？',
    english: 'What should these colors do for you?',
    reasons: [
      reason('outfit-mood', '照顾今天的心情', 'Reflect the mood I am in', 'atmosphere'),
      reason(
        'outfit-focus',
        '把注意力放在一个重点上',
        'Draw attention to one focal point',
        'clarity',
      ),
      reason(
        'outfit-surprise',
        '让日常有一点不一样',
        'Make the everyday feel different',
        'surprise',
      ),
    ],
  },
  q09: {
    prompt: '这件外套，你会因为什么穿得更久？',
    english: 'What would make you keep wearing this coat?',
    reasons: [
      reason('coat-line', '轮廓与线条的关系', 'The relationship between its lines', 'rhythm'),
      reason('coat-feel', '想象中穿在身上的触感', 'How it might feel to wear', 'tactility'),
      reason('coat-character', '它有一点不一样的性格', 'Its unexpected character', 'surprise'),
    ],
  },
  q11: {
    prompt: '你想靠近这种表面，是因为……',
    english: 'What draws you closer to this surface?',
    reasons: [
      reason(
        'surface-feel',
        '想象它碰到指尖的感觉',
        'Imagining it under my fingertips',
        'tactility',
      ),
      reason(
        'surface-history',
        '像是留下了使用和时间',
        'The sense of use and passing time',
        'story',
      ),
      reason('surface-mood', '它让画面有一种气氛', 'The atmosphere it creates', 'atmosphere'),
    ],
  },
  q13: {
    prompt: '如果在这里待一下午，你更需要……',
    english: 'For an afternoon here, what would you want?',
    reasons: [
      reason('garden-rest', '让眼睛和心情都休息', 'A rest for my eyes and my mood', 'atmosphere'),
      reason('garden-story', '慢慢发现细节的乐趣', 'Details to discover slowly', 'story'),
      reason('garden-rhythm', '视线有一条舒服的路线', 'A comfortable route for my eyes', 'rhythm'),
    ],
  },
  q16: {
    prompt: '最后这一眼，你留下它的理由是？',
    english: 'One last look. Why keep this one?',
    reasons: [
      reason('final-mood', '它的气氛刚好对上我', 'Its mood feels right', 'atmosphere'),
      reason('final-focus', '重点直接跳到眼前', 'The focal point comes through', 'clarity'),
      reason(
        'final-surprise',
        '颜色之间有意外的关系',
        'The colors meet in an unexpected way',
        'surprise',
      ),
    ],
  },
};
export function choiceReason(questionId: string, id?: string) {
  return QUESTION_DETAILS[questionId]?.reasons.find((r) => r.id === id);
}
