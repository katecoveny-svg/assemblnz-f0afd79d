import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { shipmentReviewInput, reviewShipmentDocuments, officialSourcesInput, getFreightSources } from '../../../../lib/nz-evidence/freight';
import { createCustomsReferences, tariffInput, fxInput } from '../../../../lib/nz-evidence/customs-public';
import { prepareRfi, compareRfi, exportRfi, rfiInput, compareRfiInput, exportRfiInput } from '../../../../lib/nz-evidence/architecture';
import { shipmentOutput, tariffOutput, fxOutput, sourcesOutput, rfiOutput, compareOutput, exportOutput } from './output-schemas';
const references = createCustomsReferences();
export const MAX_TOOL_RESULT_BYTES=512*1024-8192;
const result=(value:Record<string,unknown>)=>({structuredContent:value,content:[{type:'text' as const,text:'Bounded preparation/reference result returned in structuredContent. Professional review and source limitations remain applicable.'}]});
export function createSpecialistServer(domain: 'freight' | 'architecture') {
    const server = new McpServer({ name: `assembl-nz-${domain}`, version: '0.1.0' }, { capabilities: { tools: {} } });
    let active=0;
    const catalog:Record<string,unknown>[]=[];
    // No body/error logging; finite per-process concurrency. HTTP edge quotas are a release gate.
    const tool = (name: string, description: string, inputSchema: z.ZodObject<any>, outputSchema: z.ZodObject<any>, openWorldHint: boolean, run: (args: unknown) => unknown) => {
        const securitySchemes=[{type:'noauth'}];
        const annotations={readOnlyHint:true,destructiveHint:false,openWorldHint,idempotentHint:true};
        catalog.push({name,title:name.replace(/_/g,' '),description,inputSchema:z.toJSONSchema(inputSchema,{io:'input'}),outputSchema:z.toJSONSchema(outputSchema),annotations,securitySchemes,_meta:{securitySchemes}});
        server.registerTool(name, { title: name.replace(/_/g, ' '), description, inputSchema,
            outputSchema, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint, idempotentHint: true },
            _meta: { securitySchemes: [{ type: 'noauth' }] } }, async (args) => {
            if (active >= 4)
                return { isError: true, content: [{ type: 'text' as const, text: 'temporarily_unavailable' }] };
            active++;
            try {
                if (Buffer.byteLength(JSON.stringify(args), 'utf8') > 1024 * 1024)
                    throw new Error();
                const value = outputSchema.parse(await run(args));
                const output=result(value as Record<string,unknown>);
                if(Buffer.byteLength(JSON.stringify(output),'utf8')>MAX_TOOL_RESULT_BYTES)throw new Error('output_budget_exceeded');
                return output;
            }
            catch {
                return { isError: true, content: [{ type: 'text' as const, text: 'invalid_input_budget_or_unavailable: use the documented redacted schema; RFI limits256KiB/register,64KiB totaltext,500mappingedges,128KiB predictedprojection,512KiB result; no private/licensed material.' }] };
            }
            finally {
                active--;
            }
        });
    };
    if (domain === 'freight') {
        tool('freight_check_evidence', 'Stateless NZ sea-container broker preparation from non-identifying user-reported document/fact fields. Does not establish clearance, origin, classification, authenticity or compliance.', shipmentReviewInput, shipmentOutput, false, reviewShipmentDocuments);
        tool('freight_lookup_tariff_code', 'Retrieve an exact user-supplied NZ ten-digit statistical item and optional check letter, effective on entryDate, from the bounded official public Customs archive. No description classification, duties or preference eligibility.', tariffInput, tariffOutput, true, args => references.tariff(args));
        tool('freight_get_customs_exchange_rate', 'Retrieve official Customs FX for a supplied intended lodgement entryDate. Rates are foreign currency per NZD. No market fallback or conversion. Historical dates before 2020 are out of supported range.', fxInput, fxOutput, true, args => references.fx(args));
        tool('freight_get_official_sources', 'Return curated Customs/MPI public reference URLs; runtime guidance freshness and historical applicability are unknown.', officialSourcesInput, sourcesOutput, false, getFreightSources);
    }
    else {
        tool('prepare_rfi_register', 'Stateless redacted RFI coordination over supplied question/evidence mappings. Preserve all subparts and unresolved items. User-supplied page/hash provenance only; no PDF reading, source verification, code assessment or certification. Do not send private/licensed material.', rfiInput, rfiOutput, false, prepareRfi);
        tool('compare_rfi_registers', 'Compare two supplied redacted registers and recheck reviewer decisions when evidence/document revision/hash/question dependencies change. No source-file or geometry comparison; no persistence.', compareRfiInput, compareOutput, false, compareRfi);
        tool('export_rfi_matrix', 'Revalidate and export every question and unresolved flag as JSON or formula-safe CSV. Return content only; no storage, email or council upload. Supplied citations remain unverified.', exportRfiInput, exportOutput, false, exportRfi);
    }
    // SDK2 typed registration lacks OpenAI's primary securitySchemes extension; expose it through the public request-handler API, retaining SDK tool execution/validation.
    server.server.setRequestHandler('tools/list',async()=>({tools:catalog as any}));
    return server;
}
