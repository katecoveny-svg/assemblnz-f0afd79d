import { serveStdio, StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { createSpecialistServer } from './server';
class BoundedStdioTransport extends StdioServerTransport {
    override async send(message:Parameters<StdioServerTransport['send']>[0]) {
        if(Buffer.byteLength(JSON.stringify(message),'utf8')>512*1024){await this.close();return;}
        await super.send(message);
    }
}
const domain = process.argv[process.argv.indexOf('--domain') + 1];
if (domain !== 'freight' && domain !== 'architecture')
    throw new Error('Supply --domain freight|architecture');
serveStdio(() => createSpecialistServer(domain), { legacy: 'serve', transport: new BoundedStdioTransport(process.stdin, process.stdout, { maxBufferSize: 1024 * 1024 + 8192 }), maxSubscriptions: 0, onerror: () => { } });
