/* Registers the resolve hook beside this file. Pascal's built dist uses
   extensionless relative imports; node ESM needs the extension. */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
register('./pascal-loader.mjs', pathToFileURL(import.meta.dirname + '/'));
