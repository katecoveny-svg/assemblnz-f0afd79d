import {z} from "zod/v3";
export const radarContextSchema=z.object({buyer:z.string().trim().min(1).max(120),scope:z.enum(["client","government"])}).strict();
export type RadarContext=z.infer<typeof radarContextSchema>;
export function radarContextKey(c:RadarContext){return c.scope==="government"?"government":c.buyer.trim().toLowerCase();}
