/** Web-only DO identity exports from the user-locked glass original. */
import { writeFile } from 'node:fs/promises';
import { glassIcon, glassIconSvg } from './glass-identity-assets.mjs';
for(const size of [16,32,48,128,180,192,512])await writeFile(`public/do/icons/do-${size}.png`,await glassIcon('do',size));
for(const name of ['do-mark.svg','do-spark.svg','do-tiny.svg'])await writeFile(`public/do/icons/${name}`,await glassIconSvg('do'));
console.log('DO web identity exported from locked glass artwork. Native packages untouched; supply these exports to their owner.');
