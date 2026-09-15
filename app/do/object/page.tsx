import type {Metadata} from 'next';
import DoObjectEmbed from './DoObjectEmbed';
export const metadata:Metadata={title:'DO · portable object',robots:{index:false,follow:false}};
export default function Page(){return <DoObjectEmbed/>;}
