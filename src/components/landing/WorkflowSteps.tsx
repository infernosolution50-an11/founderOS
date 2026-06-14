const steps = [
  ["Name your opportunity", "Give it a name. Ember reads it and introduces itself. Your whiteboard is live in under 30 seconds."],
  ["Research and score it", "Rate problem strength, size the market, score your moat. The live Opportunity Score updates as your thinking sharpens."],
  ["Ask Ember the hard questions", "Upload a brief, ask for market analysis, stress-test the thesis. Ember uses everything you've entered to give you specific answers — not templates."],
  ["Execute from the same tool", "Switch to Execute mode. Set 90-day targets. Track tasks by phase. One tool, the full journey."]
];

export function WorkflowSteps() {
  return (
    <section className="px-4 py-20 md:px-8">
      <div className="mx-auto max-w-[760px]">
        <p className="font-display text-os-xs font-medium uppercase tracking-[0.18em] text-os-indigo">How it works</p>
        <h2 className="mt-3 font-display text-[22px] font-bold text-os-text md:text-[28px]">From idea to traction in four moves</h2>
        <div className="relative mt-10 grid gap-8">
          <div className="absolute bottom-12 left-5 top-12 w-px bg-os-border" aria-hidden="true" />
          {steps.map(([title, body], index) => (
            <div key={title} className="relative grid grid-cols-[40px_1fr] gap-4">
              <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-os-indigo bg-os-indigo/15 font-display text-sm font-semibold text-os-indigo">
                {index + 1}
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-os-text">{title}</h3>
                <p className="mt-2 text-os-sm leading-6 text-os-sub">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
