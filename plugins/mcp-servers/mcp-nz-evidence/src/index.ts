import { serveStdio, StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { createSpecialistServer } from './server';
const domain = process.argv[process.argv.indexOf('--domain') + 1];
if (domain !== 'freight' && domain !== 'architecture')
    throw new Error('Supply --domain freight|architecture');
serveStdio(() => createSpecialistServer(domain), { legacy: 'serve', transport: new StdioServerTransport(process.stdin, process.stdout, { maxBufferSize: 1024 * 1024 + 8192 }), maxSubscriptions: 0, onerror: () => { } });
