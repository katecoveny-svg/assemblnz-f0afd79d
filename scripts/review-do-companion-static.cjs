/** Server-render the real companion for local review. No browser, account or provider calls. */
const { createRequire } = require('node:module');
const esbuild = createRequire(require.resolve('tsx'))('esbuild');
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const output = path.join(root, 'docs/reviews/do-companion-local');
(async () => {
  fs.mkdirSync(output, { recursive: true });
  await esbuild.build({ stdin: { contents: `import React from 'react'; import { renderToStaticMarkup } from 'react-dom/server'; import { DoCompanionConversation } from './components/do/DoCompanionConversation'; export const markup = renderToStaticMarkup(React.createElement(DoCompanionConversation,{snapshot:'Fictional selected text: the library opens at 9am.',talkOpened:true,visible:true,focusRequest:0,onDraft:()=>false,onShoppingDraft:()=>false}));`, resolveDir: root, loader: 'tsx' }, outfile: path.join(output, 'render.cjs'), bundle: true, platform: 'node', format: 'cjs', packages: 'external', loader: { '.css': 'local-css' }, logLevel: 'silent' });
  const { markup } = require(path.join(output, 'render.cjs'));
  const css = fs.readFileSync(path.join(output, 'render.css'), 'utf8');
  fs.writeFileSync(path.join(output, 'preview.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DO companion · static local review</title><style>${css}body{margin:24px auto;max-width:430px;background:#FFFDFB;color:#492B3E;font:16px/1.5 system-ui;padding:16px}button,textarea,input,select{font:inherit;max-width:100%}textarea{width:100%;box-sizing:border-box}svg{max-width:32px}pre{white-space:pre-wrap}</style><h1>DO companion</h1><p><strong>Static local review.</strong> Actual server-rendered component; controls are inactive. No microphone, provider, account or browser access.</p>${markup}</html>`);
  fs.unlinkSync(path.join(output, 'render.cjs')); fs.unlinkSync(path.join(output, 'render.css'));
  console.log('Static companion preview rendered without browser or provider access.');
})().catch(error => { console.error(error); process.exitCode = 1; });
