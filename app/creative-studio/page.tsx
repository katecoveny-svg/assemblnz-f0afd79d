import type {Metadata} from 'next';
import {ProductLanding} from '@/components/site/assembl-the-work/ProductLanding';
export const metadata:Metadata={title:'Studio · show it. · assembl',description:'Creative direction, campaigns, film and interactive experiences. Open your existing assembl Creative Studio or discuss a scoped engagement.',alternates:{canonical:'/creative-studio'}};
export default function CreativeStudioPage(){return <ProductLanding product="studio"/>;}
