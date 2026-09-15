#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';

const errors = [];
const read = (path) => readFileSync(path, 'utf8');
const homeRoute = read('app/page.tsx');
const home = read('components/site/assembl-the-work/AssemblTheWorkHome.tsx');
const homeCss = read('components/site/assembl-the-work/assembl-the-work-current.css');
const doRoute = read('app/do/page.tsx');

function requireMatch(label, text, pattern) {
  if (!pattern.test(text)) errors.push(`${label}: missing ${pattern}`);
}
function forbidMatch(label, text, pattern) {
  if (pattern.test(text)) errors.push(`${label}: retired pattern ${pattern}`);
}

requireMatch('homepage route', homeRoute, /AssemblTheWorkHome/);
requireMatch('homepage', home, /assembl-the-work-current\.css/);
requireMatch('homepage current CSS', homeCss, /#240b21/i);
requireMatch('homepage current CSS', homeCss, /Instrument Sans/i);
requireMatch('DO route', doRoute, /DoHomeCurrent/);

for (const [label, text] of [
  ['homepage', home],
  ['homepage current CSS', homeCss],
  ['DO route', doRoute],
]) {
  forbidMatch(label, text, /OceanMedia|ocean-assembly|cinematic-nature/i);
  forbidMatch(label, text, /Cormorant|#BFA37A|champagne|canary/i);
}

forbidMatch('homepage', home, /assembl-the-work\.css|brand-rescue\.css/);
forbidMatch('homepage current CSS', homeCss, /Georgia|Times New Roman/i);

if (existsSync('components/site/assembl-the-work/OceanMedia.tsx')) {
  errors.push('retired OceanMedia.tsx still exists in the active homepage package');
}

if (errors.length) {
  console.error('public-front-door-guard: public brand/product drift detected:\n');
  for (const error of errors) console.error(`  ${error}`);
  console.error('\nHomepage canon: current plum / Instrument Sans Assembl system. DO canon: portable workforce via DoHomeCurrent.');
  process.exit(1);
}

console.log('public-front-door-guard: clean — homepage and DO use current public front doors');
