import { z } from 'zod';
import { NzServiceError } from './auth';
import { entryDate } from './freight';
const id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/);
const text = z.string().max(2000);
const doc = z.object({ id, lineage_id: id, revision: z.string().max(64), issue_date: entryDate.optional(),
    state: z.enum(['current', 'baseline', 'superseded', 'unknown']), supplied_sha256: z.string().regex(/^[a-f0-9]{64}$/).optional() }).strict();
export const rfiInput = z.object({ schema_version: z.literal('1.0'), case_label: id,
    questions: z.array(z.object({ id, parent_id: id.optional(), source_number: z.string().min(1).max(64), text: text.min(1) }).strict()).min(1).max(100),
    documents: z.array(doc).max(200),
    evidence: z.array(z.object({ id, document_id: id, page_1_based: z.number().int().min(1).max(100000), sheet_label: z.string().max(64).optional(),
        statement: text, fact_key: z.string().min(1).max(128).optional(), fact_value: text.optional() }).strict()).max(500),
    mappings: z.array(z.object({ question_id: id, evidence_ids: z.array(id).max(500), response_draft: text.optional(), reviewer_note: text.optional() }).strict()).max(100),
    required_attachments: z.array(z.object({ question_id: id, expected_document_id: id, description: text }).strict()).max(200),
}).strict();
export type RfiRegister = z.infer<typeof rfiInput>;
export const RFI_NOTICE = 'Draft coordination record — source documents and response adequacy require professional review. Stateless user-supplied register; no PDF inspection, certification, code assessment or council submission.';
const unsafe = /(?:\b(?:sk-[A-Za-z0-9_-]{15,}|eyJ[A-Za-z0-9_-]{15,})\b|-----BEGIN [A-Z ]*PRIVATE KEY-----|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|https?:\/\/\S+[?&](?:token|signature|key|sig)=)/i;
export const RFI_LIMITS={inputBytes:262144,textBytes:65536,mappingEdges:500,projectionBytes:131072,resultBytes:524288} as const;
function jsonBytes(value:unknown){try{return Buffer.byteLength(JSON.stringify(value)??'','utf8');}catch{throw new NzServiceError('invalid_input');}}
const deny=():never=>{throw new NzServiceError('invalid_input');};
export function validateRfi(raw: unknown): RfiRegister {
    if(jsonBytes(raw)>RFI_LIMITS.inputBytes)deny();
    const parsed=rfiInput.safeParse(raw);if(!parsed.success)throw new NzServiceError('invalid_input');const p=parsed.data;
    if(unsafe.test(JSON.stringify(p)))deny();
    let textBytes=0;const countText=(v:unknown)=>{if(typeof v==='string')textBytes+=Buffer.byteLength(v,'utf8');else if(Array.isArray(v))v.forEach(countText);else if(v&&typeof v==='object')Object.values(v).forEach(countText);};countText(p);
    const edges=p.mappings.reduce((n,m)=>n+m.evidence_ids.length,0);
    if(textBytes>RFI_LIMITS.textBytes||edges>RFI_LIMITS.mappingEdges)deny();
    for(const rows of [p.questions,p.documents,p.evidence])if(new Set(rows.map(x=>x.id)).size!==rows.length)deny();
    const qs=new Set(p.questions.map(q=>q.id)),ds=new Set(p.documents.map(d=>d.id)),es=new Set(p.evidence.map(e=>e.id));
    if(new Set(p.mappings.map(m=>m.question_id)).size!==p.mappings.length||p.questions.some(q=>q.parent_id&&(!qs.has(q.parent_id)||q.parent_id===q.id))||p.evidence.some(e=>!ds.has(e.document_id)||(e.fact_key===undefined)!==(e.fact_value===undefined))||p.mappings.some(m=>!qs.has(m.question_id)||m.evidence_ids.some(e=>!es.has(e))||new Set(m.evidence_ids).size!==m.evidence_ids.length)||p.required_attachments.some(a=>!qs.has(a.question_id)))deny();
    const em=new Map(p.evidence.map(e=>[e.id,e])),dm=new Map(p.documents.map(d=>[d.id,d]));
    const predicted=p.mappings.reduce((n,m)=>n+m.evidence_ids.reduce((v,eid)=>v+jsonBytes(em.get(eid))+jsonBytes(dm.get(em.get(eid)!.document_id))+256,0),0);
    if(predicted>RFI_LIMITS.projectionBytes)deny();
    for(const q of p.questions){const seen=new Set<string>();let cur:typeof q|undefined=q;while(cur){if(seen.has(cur.id))deny();seen.add(cur.id);cur=p.questions.find(x=>x.id===cur?.parent_id);}}
    return p;
}
type Finding = {
    code: string;
    question_ids: string[];
    evidence_ids: string[];
    document_ids: string[];
    explanation: string;
    action: string;
};
const normal = (v: string) => v.trim().replace(/\s+/g, ' ').toLowerCase();
export function prepareRfi(raw: unknown) {
    const p = validateRfi(raw);
    const findings: Finding[] = [];
    const add = (code: string, question_ids: string[], evidence_ids: string[], document_ids: string[], explanation: string) => findings.push({ code, question_ids, evidence_ids, document_ids, explanation, action: 'Resolve with the document owner and professional reviewer; retain unresolved items in the response matrix.' });
    const affected = (eids: string[]) => p.mappings.filter(m => m.evidence_ids.some(e => eids.includes(e))).map(m => m.question_id);
    for (const q of p.questions)
        if (!p.mappings.find(m => m.question_id === q.id)?.evidence_ids.length)
            add('unmapped_question', [q.id], [], [], 'No evidence is mapped to this supplied question.');
    for (const a of p.required_attachments)
        if (!p.documents.some(d => d.id === a.expected_document_id))
            add('missing_attachment', [a.question_id], [], [a.expected_document_id], 'A user-declared attachment is absent from the supplied register.');
    for (const d of p.documents) {
        const eids = p.evidence.filter(e => e.document_id === d.id).map(e => e.id);
        const qids = affected(eids);
        if (['baseline', 'superseded'].includes(d.state) && qids.length)
            add('noncurrent_evidence', qids, eids, [d.id], 'Mapped evidence uses a document declared noncurrent by the user.');
        if (d.state === 'unknown' || !d.revision.trim())
            add('metadata_review_required', qids, eids, [d.id], 'State or revision requires review.');
    }
    for (const lineage of new Set(p.documents.map(d => d.lineage_id))) {
        const current = p.documents.filter(d => d.lineage_id === lineage && d.state === 'current');
        if (current.length > 1) {
            const es = p.evidence.filter(e => current.some(d => d.id === e.document_id)).map(e => e.id);
            add('ambiguous_current_revision', affected(es), es, current.map(d => d.id), 'Multiple records in one lineage are declared current.');
        }
        for (const revision of new Set(p.documents.filter(d => d.lineage_id === lineage).map(d => d.revision))) {
            const rows = p.documents.filter(d => d.lineage_id === lineage && d.revision === revision);
            if (new Set(rows.map(d => d.supplied_sha256).filter(Boolean)).size > 1) {
                const es = p.evidence.filter(e => rows.some(d => d.id === e.document_id)).map(e => e.id);
                add('revision_identity_conflict', affected(es), es, rows.map(d => d.id), 'The same supplied lineage/revision has differing supplied hashes; no file hash was verified.');
            }
        }
    }
    const facts = p.evidence.filter(e => e.fact_key && p.documents.find(d => d.id === e.document_id)?.state === 'current');
    for (const key of new Set(facts.map(e => e.fact_key))) {
        const es = facts.filter(e => e.fact_key === key);
        if (new Set(es.map(e => normal(e.fact_value!))).size > 1)
            add('conflicting_fact', affected(es.map(e => e.id)), es.map(e => e.id), [...new Set(es.map(e => e.document_id))], `User-supplied values conflict for ${key}; no value was chosen.`);
    }
    const evidence_dictionary=Object.fromEntries(p.evidence.map(e=>{
        const d=p.documents.find(d=>d.id===e.document_id)!;
        return [e.id,{id:e.id,document_id:e.document_id,page_1_based:e.page_1_based,sheet_label:e.sheet_label,revision:d.revision,document_state:d.state,supplied_sha256:d.supplied_sha256??null,provenance_origin:'user_supplied' as const,source_content_verified:false as const,hash_verified_against_file:false as const}];
    }));
    const rows=p.questions.map(q=>{
        const m=p.mappings.find(x=>x.question_id===q.id),evidence_ids=m?.evidence_ids??[],flags=findings.filter(f=>f.question_ids.includes(q.id)).map(f=>f.code);
        const conflict=flags.some(f=>['conflicting_fact','revision_identity_conflict','ambiguous_current_revision'].includes(f));
        const status=conflict?'blocked_by_conflict':!evidence_ids.length?'unmapped':flags.length?'source_review_required':'mapped_for_review';
        const claim=/\b(?:approved|certif(?:ied|ication)|compliant|ready to lodge|structurally safe)\b/i.test(m?.response_draft??'');
        return {...q,status,evidence_ids,unresolved_flags:flags,user_response_draft:m?.response_draft??'',unsupported_claim_requires_review:claim,
            draft_template:evidence_ids.length?`For review: see ${evidence_ids.map(id=>{const e=evidence_dictionary[id];return `${e.document_id}, revision ${e.revision||'(unknown)'}, page ${e.page_1_based}`;}).join('; ')}. [Reviewer to confirm this addresses the request.]`:'[Reviewer to supply a response and evidence.]',reviewer_note:m?.reviewer_note??''};
    });
    return {notice:RFI_NOTICE,canonical_register:p,evidence_dictionary,rows,findings,counts:{questions:rows.length,mapped:rows.filter(r=>r.evidence_ids.length).length,unresolved:rows.filter(r=>r.unresolved_flags.length||r.unsupported_claim_requires_review).length},privacy_notice:'In-process transformation; no request-body logging. Obvious secret/email detection is incomplete; redact private/licensed material before transfer.'};
}

export const compareRfiInput = z.object({ baseline: rfiInput, candidate: rfiInput,
    reviewer_decisions: z.array(z.object({ question_id: id, evidence_ids: z.array(id).max(500), prior_dependencies: z.array(z.object({ evidence_id: id, document_id: id, revision: z.string().max(64), supplied_sha256: z.string().regex(/^[a-f0-9]{64}$/).nullable() }).strict()).max(500) }).strict()).max(100).optional() }).strict();
const ordered=<T extends {id:string}>(rows:T[])=>[...rows].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
function reviewContext(p:RfiRegister,report:ReturnType<typeof prepareRfi>,qid:string){
    const chain:typeof p.questions=[];let q=p.questions.find(q=>q.id===qid);while(q){chain.push(q);q=p.questions.find(x=>x.id===q?.parent_id);}
    const mapping=p.mappings.find(m=>m.question_id===qid)??null,attachments=p.required_attachments.filter(a=>a.question_id===qid);
    const findings=report.findings.filter(f=>f.question_ids.includes(qid));
    const eids=new Set([...(mapping?.evidence_ids??[]),...findings.flatMap(f=>f.evidence_ids)]);
    const evidence=ordered(p.evidence.filter(e=>eids.has(e.id)));
    const dids=new Set([...evidence.map(e=>e.document_id),...findings.flatMap(f=>f.document_ids),...attachments.map(a=>a.expected_document_id)]);
    return {case_label:p.case_label,question_chain:chain,mapping,attachments,evidence,documents:ordered(p.documents.filter(d=>dids.has(d.id))),findings,row:report.rows.find(r=>r.id===qid)??null};
}
export function compareRfi(raw:unknown){
    if(jsonBytes(raw)>RFI_LIMITS.inputBytes*2)deny();
    const parsed=compareRfiInput.safeParse(raw);if(!parsed.success)throw new NzServiceError('invalid_input');
    const a=validateRfi(parsed.data.baseline),b=validateRfi(parsed.data.candidate);if(a.case_label!==b.case_label)deny();
    const decisions=parsed.data.reviewer_decisions??[];
    if(new Set(decisions.map(d=>d.question_id)).size!==decisions.length||decisions.reduce((n,d)=>n+d.evidence_ids.length+d.prior_dependencies.length,0)>RFI_LIMITS.mappingEdges*2)deny();
    const before=prepareRfi(a),candidate=prepareRfi(b);
    const diff=<T extends {id:string}>(x:T[],y:T[])=>({added:y.filter(v=>!x.some(o=>o.id===v.id)),removed:x.filter(v=>!y.some(o=>o.id===v.id)),changed:y.filter(v=>x.some(o=>o.id===v.id&&JSON.stringify(o)!==JSON.stringify(v)))});
    const deps=(p:RfiRegister,qid:string)=>(p.mappings.find(m=>m.question_id===qid)?.evidence_ids??[]).map(eid=>{const e=p.evidence.find(e=>e.id===eid)!,d=p.documents.find(d=>d.id===e.document_id)!;return {evidence_id:eid,document_id:d.id,revision:d.revision,supplied_sha256:d.supplied_sha256??null};});
    const reviewer_decisions=decisions.map(d=>{
        if(!a.questions.some(q=>q.id===d.question_id)||d.evidence_ids.some(e=>!a.evidence.some(x=>x.id===e)))deny();
        const prior=deps(a,d.question_id),next=deps(b,d.question_id);
        const changed=JSON.stringify(reviewContext(a,before,d.question_id))!==JSON.stringify(reviewContext(b,candidate,d.question_id))||JSON.stringify(prior)!==JSON.stringify(d.prior_dependencies)||JSON.stringify(prior.map(e=>e.evidence_id))!==JSON.stringify(d.evidence_ids);
        return {question_id:d.question_id,review_required:changed,hashes_unknown:next.some(e=>!e.supplied_sha256),source_content_verified:false as const};
    });
    return {notice:RFI_NOTICE,questions:diff(a.questions,b.questions),documents:diff(a.documents,b.documents),evidence:diff(a.evidence,b.evidence),altered_mappings:b.mappings.filter(m=>JSON.stringify(m)!==JSON.stringify(a.mappings.find(o=>o.question_id===m.question_id))),removed_mappings:a.mappings.filter(m=>!b.mappings.some(o=>o.question_id===m.question_id)),reviewer_decisions,candidate};
}

export const exportRfiInput = z.object({ register: rfiInput, format: z.enum(['csv', 'json']) }).strict();
const csvCell = (value: string) => { const safe = /^[\s\u0000-\u001f]*[=+\-@]|^[\u0000-\u001f]/.test(value) ? `'${value}` : value; return `"${safe.replace(/"/g, '""')}"`; };
export function exportRfi(raw:unknown){
    const p=exportRfiInput.safeParse(raw);if(!p.success)throw new NzServiceError('invalid_input');const report=prepareRfi(p.data.register);
    const headings=['row_type','question_id','source_number','question','status','candidate_evidence','document_revisions','source_pages','user_response_draft','unresolved_flags','reviewer_note','source_content_verified','finding_code','finding_document_ids','finding_evidence_ids','explanation','action'];
    const rows=report.rows.map(r=>['question',r.id,r.source_number,r.text,r.status,r.evidence_ids.join('; '),r.evidence_ids.map(id=>{const e=report.evidence_dictionary[id];return `${e.document_id}:${e.revision}`;}).join('; '),r.evidence_ids.map(id=>{const e=report.evidence_dictionary[id];return `${e.document_id}:${e.page_1_based}`;}).join('; '),r.user_response_draft,[...r.unresolved_flags,...(r.unsupported_claim_requires_review?['unsupported_claim_requires_review']:[])].join('; '),r.reviewer_note,'false','','','','','']);
    const findingRows=report.findings.map(f=>['finding',f.question_ids.join('; '),'','','','','','','',f.code,'','false',f.code,f.document_ids.join('; '),f.evidence_ids.join('; '),f.explanation,f.action]);
    const matrix={notice:RFI_NOTICE,rows:report.rows,evidence_dictionary:report.evidence_dictionary,findings:report.findings};
    return {...matrix,mime_type:p.data.format==='csv'?'text/csv;charset=utf-8':'application/json',suggested_filename:`${p.data.register.case_label}-rfi-draft.${p.data.format}`,content:p.data.format==='json'?JSON.stringify(matrix,null,2):[[RFI_NOTICE],headings,...rows,...findingRows].map(row=>row.map(csvCell).join(',')).join('\r\n')};
}
