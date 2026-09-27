import { createTimeline, type Timeline } from 'animejs';
import { useEffect, useRef } from 'react';

// Section 1's "Audio paths" diagram, drawn from the README's own text block. Every path starts
// and ends as audio; a pulse walks each one stop by stop, so the stops in between are what the
// eye counts. All three take the same time end to end: this shows shape, not speed.

type Path = { label: string; stages: string[] };

export default function AudioPaths({ paths }: { paths: Path[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tl: Timeline | undefined;
    const build = () => {
      tl?.revert();
      tl = createTimeline({ loop: true, autoplay: false, defaults: { ease: 'inOutSine' } });
      const rows = [...el.querySelectorAll<HTMLElement>('[data-path]')];
      rows.forEach((row, r) => {
        const nodes = [...row.querySelectorAll<HTMLElement>('[data-stage]')];
        const dot = row.querySelector<HTMLElement>('[data-dot]');
        if (!dot || nodes.length < 2) return;
        const base = row.getBoundingClientRect().left;
        const xs = nodes.map((n) => {
          const b = n.getBoundingClientRect();
          return b.left - base + b.width / 2;
        });
        const hop = 2400 / (nodes.length - 1);
        const at = r * 180;
        tl!.set(dot, { x: xs[0], opacity: 1 }, at);
        xs.slice(1).forEach((x, i) => {
          tl!.add(dot, { x, duration: hop * 0.7 }, at + i * hop);
          tl!.add(nodes[i + 1]!, { scale: [1, 1.08, 1], duration: hop * 0.3 }, at + i * hop + hop * 0.7);
        });
        tl!.add(dot, { opacity: 0, duration: 300 }, at + 2400);
      });
      tl.add({}, { duration: 900 });
    };
    build();
    const io = new IntersectionObserver(([e]) => (e?.isIntersecting ? tl?.play() : tl?.pause()), { threshold: 0.2 });
    io.observe(el);
    const onResize = () => {
      build();
      tl?.play();
    };
    window.addEventListener('resize', onResize);
    return () => {
      io.disconnect();
      window.removeEventListener('resize', onResize);
      tl?.revert();
    };
  }, [paths]);

  return (
    <div className="paths" ref={root}>
      {paths.map((p) => (
        <div key={p.label} className="paths__row">
          <p className="paths__label">
            {p.label} <span className="mono">{p.stages.length - 2 === 1 ? '1 model' : `${p.stages.length - 2} stages`}</span>
          </p>
          <ol className="paths__track" data-path>
            <span className="paths__wire" aria-hidden="true" />
            <span className="paths__dot" data-dot aria-hidden="true" />
            {p.stages.map((s, i) => (
              <li key={`${s}-${i}`} data-stage className="paths__stage" data-end={i === 0 || i === p.stages.length - 1 || undefined}>
                {s}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
