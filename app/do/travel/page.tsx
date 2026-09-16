import { redirect } from 'next/navigation';
import LiveDo from '../live/LiveDo';
export const metadata={title:'Travel DO',robots:{index:false,follow:false}};
export default function Page(){ if(process.env.NODE_ENV !== 'development') redirect('/do?task=plan'); return <LiveDo initialAgent="travel"/>; }
