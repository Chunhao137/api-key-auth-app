"use client";

export default function PlanBanner() {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#f6d3b8] via-[#f290c6] to-[#6fa9ff] p-8 shadow-md sm:p-10 md:p-12">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="inline-flex items-center rounded-full bg-white/20 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
            Current plan
          </div>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Researcher
          </h1>
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <span>API Usage</span>
              <span className="text-xs opacity-90">ⓘ</span>
            </div>
            <p className="text-sm text-white/95">Monthly plan</p>
            <div className="h-2 overflow-hidden rounded-full bg-white/35">
              <div className="h-full w-[4%] rounded-full bg-white/80" />
            </div>
            <div className="flex items-center justify-between text-sm text-white">
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex h-5 w-9 items-center rounded-full bg-white/35 px-1">
                  <span className="inline-block h-3.5 w-3.5 rounded-full bg-white" />
                </span>
                <span className="font-medium">Pay as you go</span>
                <span className="text-xs opacity-90">ⓘ</span>
              </div>
              <span className="text-sm">0 / 1,000 Credits</span>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-stretch gap-3 text-sm text-white md:mt-0 md:w-64 md:items-end">
          <button className="inline-flex items-center justify-center rounded-full bg-white/15 px-5 py-2 text-xs font-medium text-white backdrop-blur-sm ring-1 ring-white/30 transition hover:bg-white/25">
            Manage Plan
          </button>
        </div>
      </div>
    </section>
  );
}

