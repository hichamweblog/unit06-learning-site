import type { RawUnitContent } from './contentSchema';

type RawQuizItem = RawUnitContent['quiz'][number];

const reviewedQuizText: Record<string, (question: RawQuizItem) => RawQuizItem> = {
  '6': (question) => {
    const answer = 'الحدود حق عام لا يقبل العفو بعد بلوغ الحاكم، بينما في القصاص يغلب حق العبد ويجوز العفو إلى الدية أو دونها.';
    return {
      ...question,
      question: 'ما الفرق بين الحدود والقصاص من حيث العفو والحق الغالب؟',
      options: question.options.map((option, index) => index === 1 ? answer : option),
      correct_answer: answer,
    };
  },
  '7': (question) => {
    const answer = 'قطع اليد اليمنى من الرسغ عند أخذ نصاب خفية من حرز | مقصد حفظ المال.';
    return {
      ...question,
      options: question.options.map((option, index) => index === 1 ? answer : index === 0 ? 'حدّ شرب المسكرات | مقصد حفظ العقل.' : option),
      correct_answer: answer,
    };
  },
  '9': (question) => {
    const options = question.options.map((option, index) => index === 2 ? 'كلاهما يعاقبان بالعقوبة نفسها دون اعتبار الحالة الشرعية.' : option);
    return { ...question, options };
  },
  '10': (question) => {
    const options = question.options.map((option, index) => index === 2 ? 'هي شرب المسكرات علنًا | عقوبتها حدّ.' : option);
    return { ...question, options };
  },
  '17': (question) => {
    const answer = 'درء الحد أو عدم إقامته عند وجود شبهة معتبرة في الإثبات.';
    return {
      ...question,
      options: question.options.map((option, index) => index === 1 ? answer : option),
      correct_answer: answer,
      hint: 'ركّز على معنى «الدرء» عند وجود شبهة معتبرة.',
      explanation: 'تتجلى الرحمة في درء الحد عند وجود شبهة معتبرة؛ وهذا هو المقصود بالقاعدة المذكورة في السؤال.',
    };
  },
  '19': (question) => ({
    ...question,
    question: 'ما الفرق بين استنتاج المنهج الوقائي والمنهج العلاجي من نص؟',
    hint: 'ابحث عن ألفاظ الإيمان والعبادات في أحدهما، والعقوبات والجرائم في الآخر.',
    explanation: 'يُستدل على الوقائي بذكر الإيمان والتقوى والعبادات والأخلاق، وعلى العلاجي بذكر الجرائم والعقوبات.',
  }),
  '20': (question) => {
    const answer = 'من حكم العقوبات: تطهير الجاني وكفارة إثمه.';
    return {
      ...question,
      question: 'أيّ عبارة تذكر حكمة من حكم تشريع العقوبات؟',
      options: question.options.map((option, index) => index === 1 ? answer : option),
      correct_answer: answer,
      hint: 'تذكّر حكم التشريع التي تتصل بحفظ المصالح والردع وتطييب خاطر المجني عليه والتطهير.',
      explanation: 'يُذكر تطهير الجاني وكفارة إثمه ضمن حكم تشريع العقوبات.',
    };
  },
};

export const reviewedPenaltyDefinition = 'زواجر وضعها الله تعالى للردع عن ارتكاب ما حظر أو ترك ما أمر.';

export function reviewQuizItem(question: RawQuizItem): RawQuizItem {
  return reviewedQuizText[String(question.id)]?.(question) ?? question;
}

export function reviewPenaltyDetail(detail: RawUnitContent['full_unit_text']['section_3_curative_method_penalties']['types_of_penalties'][number]['crimes_and_details'][number]) {
  if (detail.crime === 'شرب الخمر') return { ...detail, penalty: 'حدّ (80 جلدة)' };
  if (detail.crime === 'السرقة') return { ...detail, penalty: 'قطع اليد اليمنى من الرسغ عند تحقق شروط حد السرقة.' };
  if (detail.crime === 'القتل العمد والجناية العمدية') return { ...detail, penalty: 'القصاص بالمماثلة (وتجب الدية إذا عفا الأولياء).' };
  if (detail.crime === 'القتل الخطأ والجناية الخطأ') return { ...detail, penalty: 'الدية المسلمة والكفارة الشرعية (بديلة عن القصاص ولا قصاص في الخطأ إطلاقاً).' };
  return detail;
}

export function reviewFlashcard(card: RawUnitContent['flashcards'][number]) {
  if (card.card_id === 'FC_U6_03') return { ...card, category: 'إثراء', front: 'معلومة إضافية: اذكر بعض الأسباب التي قد تسهم في الانحراف.' };
  if (card.card_id === 'FC_U6_05') return { ...card, back: reviewedPenaltyDefinition };
  if (card.card_id === 'FC_U6_07') return { ...card, back: 'العقوبة: قطع اليد اليمنى من الرسغ عند تحقق شروط حد السرقة.\nالمقصد الشرعي: حفظ المال.' };
  if (card.card_id === 'FC_U6_10') return { ...card, front: 'ما المقصد الشرعي من تحريم شرب الخمر؟', back: 'حفظ العقل.' };
  if (card.card_id === 'FC_U6_12') return {
    ...card,
    category: 'القصاص',
    front: 'عرّف «القصاص» و«الدية» والمقصد الشرعي المقترن بهما.',
    back: 'القصاص: معاقبة الجاني بمثل ما فعل بالمجني عليه (في النفس وما دونها).\nالدية (عقوبة بديلة): مال معوض يؤدى للمجني عليه أو أوليائه عند العفو أو القتل الخطأ.\nالمقصد الشرعي: حفظ النفس.',
  };
  if (card.card_id === 'FC_U6_19') return {
    ...card,
    front: 'كيف تميّز المنهج الوقائي عند قراءة نص؟',
    back: 'يُستدل عليه بألفاظ الإيمان والتقوى والعبادات ومكارم الأخلاق في النص.',
  };
  if (card.category === 'القصاص والدية') return { ...card, category: 'القصاص' };
  return card;
}
