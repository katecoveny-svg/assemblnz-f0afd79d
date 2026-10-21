import { isCustomerWorkspace, isAlphassembl, isAssemblBills, isStandaloneHealth, isMotionStudio, isCreativeStudio, isAgentMarketplace } from '@/components/site/site-header';
/** Public company drafting never overlaps owner, product, tenant or auth workspaces. */
export function publicDoAssistantIsolated(pathname: string) {
  return /^\/(do|pursuit|admin|auth|echo|studio|start|signup|login|build-an-agent)(\/|$)/.test(pathname) || pathname === '/preview/home' || pathname === '/preview/the-work' || /^\/living(\/(shop|studio)(\/|$)|$)/.test(pathname) || /^\/living\/widget(\/|$)/.test(pathname) || /^\/agents\/[^/]+\/chat(\/|$)/.test(pathname) || isCustomerWorkspace(pathname) || isAlphassembl(pathname) || isAssemblBills(pathname) || isStandaloneHealth(pathname) || isMotionStudio(pathname) || isCreativeStudio(pathname) || isAgentMarketplace(pathname);
}
