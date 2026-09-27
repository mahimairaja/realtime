// Everything the pages say comes from README.md (src/data/readme.json, written by
// scripts/sync.mjs). The only words that live here are the site's own chrome.
import readme from '../data/readme.json';

export const data = readme;
export const REPO = readme.repo;
export type Section = (typeof readme.sections)[number];
export type Matrix = typeof readme.matrix;
export type Path = (typeof readme.paths)[number];

export const sectionHref = (s: Pick<Section, 'slug'>) => `/${s.slug}/`;

/** Days since the README's review date, against the reader's clock or the build's. */
export function daysSince(date: string, now = new Date()): number {
  return Math.floor((now.getTime() - Date.parse(`${date}T00:00:00Z`)) / 86_400_000);
}
