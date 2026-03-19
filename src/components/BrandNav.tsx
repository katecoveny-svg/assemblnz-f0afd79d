import { Link } from "react-router-dom";
import AssemblLogo from "@/components/AssemblLogo";
import AccountDropdown from "@/components/AccountDropdown";

const BrandNav = () => {
  return (
    <header className="flex items-center gap-3 px-6 py-4 border-b border-border">
      <Link to="/" className="flex items-center gap-3">
        <AssemblLogo size={28} />
        <div className="flex items-baseline gap-1">
          <span className="text-foreground font-extrabold tracking-[2.5px] uppercase text-sm">ASSEMBL</span>
          <span className="font-mono-jb text-[11px]" style={{ color: '#ffffff22' }}>.co.nz</span>
        </div>
      </Link>
      <div className="flex-1" />
      <nav className="flex items-center gap-4 text-xs">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Agents</Link>
        <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
        <Link to="/embed" className="text-muted-foreground hover:text-foreground transition-colors">Embed</Link>
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
        <AccountDropdown />
      </nav>
    </header>
  );
};

export default BrandNav;
