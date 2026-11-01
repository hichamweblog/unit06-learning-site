import { useEffect, useState } from 'react';
import { studentPracticeQuestions } from '../data';
import { PageHeading } from '../components/PageHeading';
import { useProgress } from '../context/useProgress';

type EvaluationState = 'mastered' | 'partial' | 'review';

const practiceHints: Record<string, string> = {
  'practice-01': 'تأمل ألفاظ الحديث الثلاثة: الزنا بعد إحصان، المحاربة لله ورسوله، وقتل النفس عمداً. اربط كل واحدة بحدها ومقصدها الشرعي.',
  'practice-02': 'فرّق بوضوح بين الجناية العمدية (القصاص والدية بديلة عند العفو) والخطأ (الدية والكفارة ولا قصاص فيه) والإتلاف المالي (التعزير).',
  'practice-03': 'الدماء عمدًا = قصاص، الزور = تعزير يقدّره القاضي، قذف المحصنات = حدّ مقدّر (80 جلدة لحفظ العرض).',
  'practice-04': 'تذكّر قاعدة الحدود: إذا بلغت الحاكم/القاضي وثبتت، حَرُمت الشفاعة لأن الحق العام لله تعالى غالب.',
  'practice-05': 'ترويع الناس بالسلاح وسلب الأموال هو حد الحرابة، وعقوباتها الأربع وردت في سورة المائدة.',
  'practice-06': 'قارن من 3 زوايا: نوع العقوبة (حدّ مقابل قصاص)، قبول العفو والشفاعة، والحق الغالب (حق الله مقابل حق الأولياء).',
  'practice-07': 'كلاهما اعتداء على المال، لكن السرقة جريمة مقدّرة بحد شرعي بشروطها، والربا يُعاقب عليه تعزيرًا.',
  'practice-08': 'المسكرات تغيّب العقل، والمقصد هو حفظ العقل، ونوع العقوبة حدّ شرب الخمر.',
  'practice-09': 'المنهج الوقائي يسبق الجريمة: تقوية الإيمان والوازع الديني، والحث على العبادات ومكارم الأخلاق.',
  'practice-10': 'التعزير عقوبة غير مقدرة شرعاً ويُفوّض تقديرها للقاضي بما يناسب زمان الجريمة ومكانها والمصلحة.',
  'practice-11': 'الحكمة من تشريع العقوبات: حفظ النظام العام، الردع والزجر، وتطهير الجاني وتطييب نفس المجني عليه.',
  'practice-12': 'خصائص العقوبات الأربع: الشرعية، المساواة، العدالة وشخصية العقوبة، والرحمة.',
  'practice-13': 'العقوبة البديلة في القتل العمد عند عفو الأولياء هي الدية، ومقصد تشريع القصاص هو حفظ النفس.',
};

function getSavedEvaluations(): Record<string, EvaluationState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('unit06_bac_evaluations');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getSavedAttempts(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('unit06_bac_attempts');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function BacPage({ embedded }: { embedded?: boolean } = {}) {
  const { markSectionComplete } = useProgress();
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationState>>(getSavedEvaluations);
  const [attempts, setAttempts] = useState<Record<string, string>>(getSavedAttempts);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [hintIds, setHintIds] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'mastered' | 'review' | 'pending'>('all');

  const totalQuestions = studentPracticeQuestions.length;
  const evaluatedCount = Object.keys(evaluations).length;
  const masteredCount = Object.values(evaluations).filter((s) => s === 'mastered').length;
  const partialCount = Object.values(evaluations).filter((s) => s === 'partial').length;
  const reviewCount = Object.values(evaluations).filter((s) => s === 'review').length;

  useEffect(() => {
    try {
      localStorage.setItem('unit06_bac_evaluations', JSON.stringify(evaluations));
    } catch {
      // storage unavailable
    }
    if (evaluatedCount >= 3) {
      markSectionComplete('bac-practice');
    }
  }, [evaluations, evaluatedCount, markSectionComplete]);

  useEffect(() => {
    try {
      localStorage.setItem('unit06_bac_attempts', JSON.stringify(attempts));
    } catch {
      // storage unavailable
    }
  }, [attempts]);

  function handleEvaluate(id: string, state: EvaluationState) {
    setEvaluations((prev) => ({ ...prev, [id]: state }));
  }

  function handleAttemptChange(id: string, text: string) {
    setAttempts((prev) => ({ ...prev, [id]: text }));
  }

  function toggleReveal(id: string) {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleHint(id: string) {
    setHintIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function resetEvaluations() {
    if (window.confirm('هل تريد إعادة تعيين تقييماتك لتدريبات البكالوريا؟')) {
      setEvaluations({});
      try {
        localStorage.removeItem('unit06_bac_evaluations');
      } catch {
        // ignore
      }
    }
  }

  const filteredQuestions = studentPracticeQuestions.filter((q) => {
    if (filter === 'mastered') return evaluations[q.id] === 'mastered';
    if (filter === 'review') return evaluations[q.id] === 'review' || evaluations[q.id] === 'partial';
    if (filter === 'pending') return !evaluations[q.id];
    return true;
  });

  return (
    <div className={`bac-page${embedded ? ' bac-page--embedded' : ' page-wrap inner-page'}`}>
      {!embedded && (
        <PageHeading
          eyebrow="التحضير للبكالوريا"
          title="تدريبات وتطبيقات البكالوريا"
          description="تدرّب على أسئلة الامتحان: دوّن محاولتك، استعن بالتلميح عند الحاجة، ثم قارن مع الإجابة النموذجية وقَيّم نفسك."
          action={
            <button className="button button--outline print-button" type="button" onClick={() => window.print()}>
              طباعة الصفحة <span aria-hidden="true">⎙</span>
            </button>
          }
        />
      )}

      {/* Interactive Progress Dashboard */}
      <section className="bac-dashboard" aria-label="ملخص إنجاز تدريبات البكالوريا">
        <div className="bac-dashboard__stats">
          <div className="bac-stat">
            <span className="bac-stat__num"><bdi>{evaluatedCount}</bdi> / <bdi>{totalQuestions}</bdi></span>
            <span className="bac-stat__label">تم تقييمها</span>
          </div>
          <div className="bac-stat bac-stat--mastered">
            <span className="bac-stat__num"><bdi>{masteredCount}</bdi></span>
            <span className="bac-stat__label">إجابة تامة</span>
          </div>
          <div className="bac-stat bac-stat--partial">
            <span className="bac-stat__num"><bdi>{partialCount}</bdi></span>
            <span className="bac-stat__label">إجابة جزئية</span>
          </div>
          <div className="bac-stat bac-stat--review">
            <span className="bac-stat__num"><bdi>{reviewCount}</bdi></span>
            <span className="bac-stat__label">تحتاج مراجعة</span>
          </div>
        </div>

        <div className="bac-dashboard__filters" role="group" aria-label="تصفية التدريبات">
          <button
            type="button"
            className={`bac-filter-btn ${filter === 'all' ? 'bac-filter-btn--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            الكل ({totalQuestions})
          </button>
          <button
            type="button"
            className={`bac-filter-btn ${filter === 'mastered' ? 'bac-filter-btn--active' : ''}`}
            onClick={() => setFilter('mastered')}
          >
            المتقنة ({masteredCount})
          </button>
          <button
            type="button"
            className={`bac-filter-btn ${filter === 'review' ? 'bac-filter-btn--active' : ''}`}
            onClick={() => setFilter('review')}
          >
            للمراجعة ({partialCount + reviewCount})
          </button>
          <button
            type="button"
            className={`bac-filter-btn ${filter === 'pending' ? 'bac-filter-btn--active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            غير المقيّمة ({totalQuestions - evaluatedCount})
          </button>
          {evaluatedCount > 0 && (
            <button
              type="button"
              className="bac-filter-btn bac-filter-btn--reset"
              onClick={resetEvaluations}
              title="إعادة تعيين تقييماتي"
            >
              إعادة البدء
            </button>
          )}
        </div>
      </section>

      {/* Practice Cards List */}
      <section className="practice-list" aria-label="أسئلة وتطبيقات الوحدة">
        {filteredQuestions.length === 0 ? (
          <div className="practice-empty-state">
            <p>لا توجد تدريبات تطابق هذا التصنيف حالياً.</p>
            <button className="button button--small button--outline" type="button" onClick={() => setFilter('all')}>
              عرض كل التدريبات
            </button>
          </div>
        ) : (
          filteredQuestions.map((question) => {
            const originalIndex = studentPracticeQuestions.findIndex((q) => q.id === question.id);
            const evaluation = evaluations[question.id];
            const isRevealed = Boolean(revealedIds[question.id]);
            const isHintOpen = Boolean(hintIds[question.id]);
            const currentAttempt = attempts[question.id] || '';
            const hintText = practiceHints[question.id];

            return (
              <article
                className={`practice-card ${evaluation ? `practice-card--${evaluation}` : ''}`}
                key={question.id}
                id={`practice-${question.id}`}
              >
                <header className="practice-card__header">
                  <div className="practice-card__meta">
                    <span className="practice-card__number"><bdi>{String(originalIndex + 1).padStart(2, '0')}</bdi></span>
                    <span className="practice-card__topic">{question.topic}</span>
                  </div>
                  {evaluation && (
                    <span className={`practice-status-badge practice-status-badge--${evaluation}`}>
                      {evaluation === 'mastered' ? '✓ أتقنت الإجابة' : evaluation === 'partial' ? '◐ إجابة جزئية' : '↺ للمراجعة'}
                    </span>
                  )}
                </header>

                <div className="practice-card__body">
                  {question.passage && (
                    <blockquote className="practice-passage">
                      <span className="practice-passage__tag">النص الشرعي</span>
                      <p>{question.passage}</p>
                    </blockquote>
                  )}

                  <p className="practice-prompt">{question.prompt}</p>

                  {/* Student Scratchpad / Draft Area */}
                  <div className="practice-scratchpad">
                    <label htmlFor={`draft-${question.id}`} className="practice-scratchpad__label">
                      <span>مسودة المحاولة الشخصية</span>
                      <small>(اكتب أفكارك أو كلماتك المفتاحية قبل كشف الحل)</small>
                    </label>
                    <textarea
                      id={`draft-${question.id}`}
                      className="practice-scratchpad__input"
                      placeholder="اكتب عناصر إجابتك هنا..."
                      rows={2}
                      value={currentAttempt}
                      onChange={(e) => handleAttemptChange(question.id, e.target.value)}
                    />
                  </div>

                  {/* Interactive Action Controls */}
                  <div className="practice-actions">
                    {hintText && (
                      <button
                        type="button"
                        className={`button button--small ${isHintOpen ? 'button--copper' : 'button--outline'}`}
                        onClick={() => toggleHint(question.id)}
                        aria-expanded={isHintOpen}
                      >
                        {isHintOpen ? 'إخفاء التلميح' : 'تلميح منهجي 💡'}
                      </button>
                    )}

                    <button
                      type="button"
                      className="button button--small button--navy"
                      onClick={() => toggleReveal(question.id)}
                      aria-expanded={isRevealed}
                    >
                      {isRevealed ? 'إخفاء الإجابة' : 'عرض الإجابة وسلم التنقيط ←'}
                    </button>
                  </div>

                  {/* Hint Drawer */}
                  {isHintOpen && hintText && (
                    <div className="practice-hint-box" role="note" aria-label="تلميح للمساعدة">
                      <strong>تلميح منهجي:</strong> {hintText}
                    </div>
                  )}

                  {/* Model Answer & Self-Grading */}
                  {isRevealed && (
                    <div className="practice-model-answer">
                      <h3 className="practice-model-answer__title">عناصر الإجابة النموذجية المعتمدة:</h3>
                      <ol className="practice-model-answer__list">
                        {question.modelAnswer.map((point) => (
                          <li key={point}>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ol>

                      <div className="practice-self-evaluation">
                        <p className="practice-self-evaluation__title">قيّم إجابتك بناءً على المقارنة أعلاه:</p>
                        <div className="practice-self-evaluation__btns">
                          <button
                            type="button"
                            className={`eval-btn eval-btn--mastered ${evaluation === 'mastered' ? 'eval-btn--active' : ''}`}
                            onClick={() => handleEvaluate(question.id, 'mastered')}
                          >
                            ✓ أصبت الإجابة كاملة
                          </button>
                          <button
                            type="button"
                            className={`eval-btn eval-btn--partial ${evaluation === 'partial' ? 'eval-btn--active' : ''}`}
                            onClick={() => handleEvaluate(question.id, 'partial')}
                          >
                            ◐ أصبت جزئياً
                          </button>
                          <button
                            type="button"
                            className={`eval-btn eval-btn--review ${evaluation === 'review' ? 'eval-btn--active' : ''}`}
                            onClick={() => handleEvaluate(question.id, 'review')}
                          >
                            ↺ أحتاج للمراجعة
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
