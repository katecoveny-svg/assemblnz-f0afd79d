const esbuild = require('../../../node_modules/.pnpm/esbuild@0.28.0/node_modules/esbuild');
esbuild.buildSync({entryPoints:[__dirname+'/entry.tsx'],bundle:true,outfile:__dirname+'/bundle.js',jsx:'automatic',tsconfig:__dirname+'/../../../tsconfig.json',loader:{'.css':'local-css'}});
