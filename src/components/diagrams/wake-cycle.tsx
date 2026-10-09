/**
 * Diagrams for the LLM cold-start series (content/experiments/llm-cold-start).
 * Plain HTML, so the text stays legible at any width: a row on a wide page, a
 * column on a narrow one.
 */

type Item =
  | { state: true; kind: string; name: string; sub: string; tone: "cool" | "warm" | "sacred" }
  | { state: false; who: string; what: string };

const ASLEEP: Item = {
  state: true,
  kind: "Asleep",
  name: "0 replicas",
  sub: "The card is free for experiments.",
  tone: "cool",
};
const SERVING: Item = {
  state: true,
  kind: "Serving",
  name: "About 12 GB of the card",
  sub: "OpenAI-style requests from any app or agent.",
  tone: "sacred",
};

/** `first` is the cycle as step 1 built it; `now` is where the series left it. */
const CYCLES: Record<"first" | "now", Item[]> = {
  first: [
    ASLEEP,
    {
      state: false,
      who: "A request",
      what: "The LLM gateway scales the model 0 → 1 and answers 503 until it's up.",
    },
    {
      state: true,
      kind: "Waking",
      name: "Ready in about 145 s",
      sub: "Kueue admits the pod into the one-LLM slot.",
      tone: "warm",
    },
    {
      state: false,
      who: "Ready",
      what: "A client retrying every 10 s got its first answer at 151 s.",
    },
    SERVING,
  ],
  now: [
    ASLEEP,
    {
      state: false,
      who: "A request",
      what: "The LLM gateway scales the model 0 → 1 and holds the request, up to 60 s.",
    },
    {
      state: true,
      kind: "Waking",
      name: "Ready in about 35 s",
      sub: "Kueue admits the pod into the one-LLM slot. The driver's kernel cache is read back from the volume.",
      tone: "warm",
    },
    { state: false, who: "Ready", what: "The gateway forwards the held request. First token at 36.5 s." },
    SERVING,
  ],
};

/** The 7B's life cycle: asleep at zero, woken by a request, put back to sleep by the idle reaper. */
export function WakeCycle({ stage = "now" }: { stage?: string }) {
  const cycle = CYCLES[stage === "first" ? "first" : "now"];
  return (
    <div className="nb-cycle">
      <ol className="nb-cycle__grid">
        {cycle.map((it) =>
          it.state ? (
            <li key={it.kind} className={`nb-cycle__state nb-cycle__state--${it.tone}`}>
              <span className="nb-cycle__kind">{it.kind}</span>
              <span className="nb-cycle__name">{it.name}</span>
              <span className="nb-cycle__sub">{it.sub}</span>
            </li>
          ) : (
            <li key={it.who} className="nb-cycle__edge">
              <span className="nb-cycle__who">{it.who}</span>
              <span className="nb-cycle__arrow" aria-hidden />
              <span className="nb-cycle__what">{it.what}</span>
            </li>
          ),
        )}
      </ol>
      <div className="nb-cycle__return">
        <span className="nb-cycle__label">
          <span className="nb-cycle__who">60 idle minutes</span>{" "}
          <span className="nb-cycle__what">The idle reaper scales it back to 0.</span>
        </span>
      </div>
    </div>
  );
}
