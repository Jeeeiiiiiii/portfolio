import { pipelineSteps, type PipelineStep, type StepState } from '@/lib/visitors/pipeline';

/**
 * The eight stages of a visitor card, drawn as a numbered rail. With no
 * `states` it is the static explainer; with states it is the live tracker.
 */

const marker: Record<StepState, string> = {
  done: 'bg-ink border-ink',
  active: 'border-ink status-dot bg-ink',
  failed: 'border-ink bg-background',
  pending: 'border-gray-300 bg-background',
  skipped: 'border-gray-200 bg-background',
};

const text: Record<StepState, string> = {
  done: 'text-ink',
  active: 'text-ink',
  failed: 'text-ink line-through decoration-gray-400',
  pending: 'text-gray-500',
  skipped: 'text-gray-400 line-through decoration-gray-300',
};

const stateLabel: Record<StepState, string> = {
  done: 'done',
  active: 'in progress',
  failed: 'failed',
  pending: 'waiting',
  skipped: 'skipped',
};

export default function PipelineView({
  states,
  extras,
}: {
  states?: Record<PipelineStep['id'], StepState>;
  /** optional trailing content per step, e.g. a link to the PR or preview */
  extras?: Partial<Record<PipelineStep['id'], React.ReactNode>>;
}) {
  return (
    <ol className="relative border-l border-gray-200 ml-2">
      {pipelineSteps.map((step, i) => {
        const state = states?.[step.id];
        return (
          <li key={step.id} className="relative pl-6 pb-5 last:pb-0">
            <span
              aria-hidden
              className={`absolute -left-[5px] top-[5px] w-[9px] h-[9px] rounded-full border ${
                state ? marker[state] : 'border-gray-300 bg-background'
              }`}
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="micro !text-[9px]">{String(i + 1).padStart(2, '0')}</span>
              <span className={`font-mono text-[13px] ${state ? text[state] : 'text-ink'}`}>{step.label}</span>
              {state && (
                <span className="micro !text-[9px]" aria-live={state === 'active' ? 'polite' : undefined}>
                  {stateLabel[state]}
                </span>
              )}
              {extras?.[step.id]}
            </div>
            <p className="text-[12px] text-gray-500 mt-0.5">{step.detail}</p>
          </li>
        );
      })}
    </ol>
  );
}
