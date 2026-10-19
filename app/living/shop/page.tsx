import type { Metadata } from 'next';
import EditorialStore from './EditorialStore';
export const metadata:Metadata={title:'Assembl Living · Spaces that work harder',description:'Personalised modular organisers, starter sets and useful accessories for your room, desk, vanity, home and pets. Explore the collection and save your design.',robots:{index:false,follow:false},openGraph:{title:'Assembl Living · Spaces that work harder',description:'Show us what you love. Make it yours. Explore the modular living collection.',type:'website'}};
export default function ShopPage(){return <EditorialStore/>;}
