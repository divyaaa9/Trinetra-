import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { McqQuestion } from "../../data/assessments";
import { MCQ_MARKS } from "../../lib/scoring";
import { ProgressBar } from "../ui";

/** One question at a time. Parent should render with key={question.id}. */
export default function McqStep({
  question, index, total, onAnswer,
}: { question: McqQuestion; index: number; total: number; onAnswer: (selected: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const last = index + 1 === total;

  const submit = () => {
    if (locked || selected === null) return;
    setLocked(true); // prevents double-click / duplicate scoring
    onAnswer(selected);
  };

  return (
    <div className="cn-card">
      <div className="cn-meta" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <span className="cn-pill">Question {index + 1} of {total}</span>
        <span className="cn-pill">{MCQ_MARKS} marks</span>
      </div>
      <ProgressBar value={(index / total) * 100} label={`Theory progress: question ${index + 1} of ${total}`} />
      <fieldset className="cn-fieldset">
        <legend><h2 style={{ fontSize: "1.3rem" }}>{question.prompt}</h2></legend>
        {question.options.map((opt, i) => (
          <label key={i} className="cn-opt" data-selected={selected === i}>
            <input type="radio" name={question.id} checked={selected === i}
              onChange={() => setSelected(i)} disabled={locked} />
            <span>{opt}</span>
          </label>
        ))}
      </fieldset>
      <button type="button" className="cn-btn" onClick={submit} disabled={selected === null || locked}>
        {last ? "Continue to posture section" : "Next question"} <ArrowRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
