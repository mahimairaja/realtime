import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { animate, stagger } from 'animejs';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Section 2's quick matrix, one control at a time. Every cell keeps the README's source link, and
// a "?" stays visible as "Not documented" rather than being hidden or read as "no".

type Cell = { html: string; unknown: boolean };
type Model = { name: string; href: string | null; cells: Cell[] };

export default function ControlMatrix({ controls, models }: { controls: string[]; models: Model[] }) {
  const [view, setView] = useState<'control' | 'table'>('control');
  const [col, setCol] = useState(0);
  const list = useRef<HTMLUListElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current || !list.current || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      first.current = false;
      return;
    }
    animate(list.current.querySelectorAll('[data-cell]'), { opacity: [0, 1], translateY: [6, 0], duration: 420, delay: stagger(40), ease: 'outExpo' });
  }, [col]);

  const documented = models.filter((m) => !m.cells[col]?.unknown).length;

  return (
    <div className="matrix">
      <div className="matrix__bar">
        <ToggleGroup.Root type="single" value={view} onValueChange={(v) => v && setView(v as 'control' | 'table')} aria-label="View" className="seg">
          <ToggleGroup.Item value="control" className="seg__item">
            By control
          </ToggleGroup.Item>
          <ToggleGroup.Item value="table" className="seg__item">
            Full matrix
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>

      {view === 'control' ? (
        <>
          <ToggleGroup.Root
            type="single"
            value={String(col)}
            onValueChange={(v) => v && setCol(Number(v))}
            aria-label="Control"
            className="matrix__controls"
          >
            {controls.map((c, i) => (
              <ToggleGroup.Item key={c} value={String(i)} className="chip">
                {c}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
          <p className="matrix__count mono" aria-live="polite">
            {controls[col]}: documented for {documented} of {models.length} models
          </p>
          <ul className="matrix__list" ref={list}>
            {models.map((m) => {
              const cell = m.cells[col]!;
              return (
                <li key={m.name} className="matrix__row" data-source={m.name}>
                  {m.href ? (
                    <a className="matrix__model" href={m.href} rel="noopener" target="_blank">
                      {m.name} <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="matrix__model">{m.name}</span>
                  )}
                  <span className="matrix__cell" data-cell data-unknown={cell.unknown || undefined} dangerouslySetInnerHTML={{ __html: cell.html }} />
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="matrix__scroll">
          <table className="matrix__table">
            <thead>
              <tr>
                <th>Model</th>
                {controls.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.name} data-source={m.name}>
                  <th scope="row">{m.href ? <a href={m.href} rel="noopener" target="_blank">{m.name}</a> : m.name}</th>
                  {m.cells.map((c, i) => (
                    <td key={i} data-unknown={c.unknown || undefined} dangerouslySetInnerHTML={{ __html: c.html }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
