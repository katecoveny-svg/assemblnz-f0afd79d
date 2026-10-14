import type { Metadata } from 'next';
import { VoiceStudio } from './VoiceStudio';
export const metadata: Metadata={title:{absolute:'Voice studio · assembl'},description:'Create and compare original voice options with the assembl speech engine.',robots:{index:false,follow:false}};
export default function Page(){return <VoiceStudio />;}
