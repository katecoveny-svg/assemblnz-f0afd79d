import type {Metadata} from 'next';
import {ProductLanding} from '@/components/site/assembl-the-work/ProductLanding';
export const metadata:Metadata={title:'Pursuit · find it. · assembl',description:'Research the opportunity, develop a credible idea and prepare the next conversation with assembl Pursuit.',alternates:{canonical:'/pursuit'}};
export default function PursuitPage(){return <ProductLanding product="pursuit"/>;}
