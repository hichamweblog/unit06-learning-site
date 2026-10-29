import { useEffect, useMemo, useState } from 'react';
import { unitContent } from '../data';
import { useProgress } from '../context/useProgress';
import { shuffleItems } from '../lib/quiz';
import { PageHeading } from '../components/PageHeading';
import { ProgressBar } from '../components/ProgressBar';

export function FlashcardsPage({ embedded }: { embedded?: boolean } = {}) {
  const { progress, markFlashcard } = useProgress();
  const [cards, setCards] = useState(unitContent.flashcards);
  const [filter, setFilter] = useState<'all' | 'review' | 'unrated'>('all');
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [notice, setNotice] = useState('');

  const masteredSet = useMemo(() => new Set(progress.masteredFlashcardIds), [progress.masteredFlashcardIds]);
  const reviewSet = useMemo(() => new Set(progress.reviewFlashcardIds), [progress.reviewFlashcardIds]);
  const masteredCount = unitContent.flashcards.filter((card) => masteredSet.has(card.cardId)).length;

  const deck = useMemo(() => {
    if (filter === 'review') {
      return cards.filter((card) => reviewSet.has(card.cardId));
    }
    if (filter === 'unrated') {
      return cards.filter((card) => !masteredSet.has(card.cardId) && !reviewSet.has(card.cardId));
    }
    return cards;
  }, [cards, filter, reviewSet, masteredSet]);

  const safeIndex = deck.length > 0 ? Math.min(index, deck.length - 1) : 0;
  const current = deck[safeIndex];
  const currentState = current ? masteredSet.has(current.cardId) ? 'mastered' : reviewSet.has(current.cardId) ? 'review' : null : null;

  function toggleReveal() {
    setRevealed((prev) => !prev);
  }

  function move(nextIndex: number) {
    setIndex(Math.min(Math.max(nextIndex, 0), deck.length - 1));
    setRevealed(false);
    setNotice('');
  }

  function shuffleDeck() {
    setCards(shuffleItems(unitContent.flashcards));
    setIndex(0);
    setRevealed(false);
    setNotice('');
  }

  function restartDeck() {
    setCards(unitContent.flashcards);
    setIndex(0);
    setRevealed(false);
    setNotice('بدأت المجموعة من البطاقة الأولى.');
  }

  function mark(state: 'mastered' | 'review') {
    if (!current) return;
    markFlashcard(current.cardId, state);
    setNotice(state === 'mastered' ? 'حُفظت البطاقة ضمن البطاقات المتقنة على هذا الجهاز.' : 'حُفظت البطاقة ضمن ما تريد مراجعته لاحقًا على هذا الجهاز.');
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (safeIndex < deck.length - 1) {
          move(safeIndex + 1);
        }
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (safeIndex > 0) {
          move(safeIndex - 1);
        }
      } else if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        toggleReveal();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeIndex, deck.length, revealed]);

  return (
    <div className={`flashcards-page${embedded ? ' flashcards-page--embedded' : ' page-wrap inner-page'}`}>
      {!embedded && (
        <PageHeading
          eyebrow={`استرجاع نشط · ${unitContent.flashcards.length} بطاقة`}
          title="البطاقات التعليمية"
          description="اقرأ السؤال وحاول الاسترجاع من الذاكرة، ثم اكشف الإجابة وسجّل تقدّمك."
        />
      )}
      <div className="flashcards-toolbar">
        <ProgressBar value={masteredCount} max={unitContent.flashcards.length} label="البطاقات التي علّمتها متقنة" />
        <div className="flashcard-filter">
          <button className={`button button--small ${filter === 'all' ? 'button--navy' : 'button--outline'}`} onClick={() => { setFilter('all'); setIndex(0); setRevealed(false); }}>الكل</button>
          <button className={`button button--small ${filter === 'review' ? 'button--copper' : 'button--outline'}`} onClick={() => { setFilter('review'); setIndex(0); setRevealed(false); }}>للمراجعة</button>
          <button className={`button button--small ${filter === 'unrated' ? 'button--outline button--active' : 'button--outline'}`} onClick={() => { setFilter('unrated'); setIndex(0); setRevealed(false); }}>غير مقيّمة</button>
        </div>
        <div className="flashcards-toolbar__actions">
          <button className="button button--outline button--small" type="button" onClick={shuffleDeck}>خلط البطاقات</button>
          <button className="button button--text button--small" type="button" onClick={restartDeck}>إعادة بدء المجموعة</button>
        </div>
      </div>
      {current ? <section className="flashcard-shell" aria-label="بطاقة تعليمية">
        <div className="flashcard-topline"><span className="flashcard-counter">البطاقة <bdi>{safeIndex + 1}</bdi> من <bdi>{deck.length}</bdi></span>{current.category && <span className="flashcard-category">{current.category}</span>}</div>
        <div className="flashcard-scene">
          <div
            className={`flashcard${revealed ? ' flashcard--flipped' : ''}`}
            onClick={toggleReveal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleReveal();
              }
            }}
            aria-label={revealed ? 'انقر للعودة إلى السؤال' : 'انقر لكشف الإجابة'}
          >
            <div className="flashcard__face flashcard__face--front">
              <div className="flashcard__body">
                <p className="eyebrow">سؤال للمراجعة</p>
                <h2>{current.front}</h2>
                <span className="flashcard__hint" aria-hidden="true">انقر على البطاقة لكشف الإجابة ↻</span>
              </div>
            </div>
            <div className="flashcard__face flashcard__face--back">
              <div className="flashcard__body">
                <p className="eyebrow">الإجابة</p>
                <h2>{current.back}</h2>
                <span className="flashcard__hint" aria-hidden="true">انقر على البطاقة للعودة للسؤال ↺</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flashcard-main-action"><button className="button button--navy button--wide" type="button" aria-expanded={revealed} onClick={toggleReveal}>{revealed ? 'أخفِ الإجابة' : 'اكشف الإجابة'}</button></div>
        {revealed && <div className="flashcard-rating"><p>كيف تقيّم استرجاعك؟</p><div className="button-row"><button className={`button ${currentState === 'mastered' ? 'button--success' : 'button--outline'}`} type="button" aria-pressed={currentState === 'mastered'} onClick={() => mark('mastered')}>✓ أتقنتها</button><button className={`button ${currentState === 'review' ? 'button--copper' : 'button--outline'}`} type="button" aria-pressed={currentState === 'review'} onClick={() => mark('review')}>أراجعها لاحقًا</button></div></div>}
        {notice && <p className="flashcard-notice" role="status" aria-live="polite">{notice}</p>}
        <div className="flashcard-navigation"><button className="button button--outline" type="button" disabled={safeIndex === 0} onClick={() => move(safeIndex - 1)}>السابق</button><span className="flashcard-navigation__state">{currentState === 'mastered' ? '✓ متقنة' : currentState === 'review' ? '↻ للمراجعة' : 'لم تُقيّم بعد'}</span><button className="button button--outline" type="button" disabled={safeIndex === deck.length - 1} onClick={() => move(safeIndex + 1)}>التالي <span aria-hidden="true">←</span></button></div>
        <p className="keyboard-hint">← → للتنقل · مسافة للكشف</p>
        <p className="flashcard-privacy">حالة البطاقة محفوظة محليًا في هذا المتصفح فقط.</p>
      </section> : <div className="empty-state"><h2>لا توجد بطاقات لعرضها</h2><p>لا توجد بطاقات متاحة الآن.</p></div>}
    </div>
  );
}
