import type {RunRequest} from './contract';
export const OWNER_RUN_BODY_BYTES=180000;
/** The exact current wire body, checked before any fetch. A successful brand
 * Apply does not promise later edited/prepared requests will fit this bound. */
export function serializeOwnerRunBody(input:RunRequest&{runId:string;actionId:string}){
 const body=JSON.stringify(input);if(new TextEncoder().encode(body).length>OWNER_RUN_BODY_BYTES)throw Error('Current run request exceeds 180KB. Keep the saved draft and reduce selected inputs or raster size; no provider request was sent.');return body;
}
