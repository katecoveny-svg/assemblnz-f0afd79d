import { Link } from "react-router-dom";
import AssemblLogo from "@/components/AssemblLogo";
import AccountDropdown from "@/components/AccountDropdown";

const BrandNav = () => {
  return (
    <header
      className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]"
      style={{
        background: 'rgba(14, 14, 26, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <Link to="/" className="flex items-center gap-3 group">
        <AssemblLogo size={28} />
        <div className="flex items-baseline gap-1">
          <span className="font-syne font-extrabold tracking-[3px] uppercase text-sm text-foreground group-hover:text-primary transition-colors">ASSEMBL</span>
          <span className="font-mono-jb text-[11px] text-white/10">.co.nz</span>
        </div>
      </Link>
      <div className="flex-1" />
      <nav className="flex items-center gap-4 text-xs font-jakarta">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors duration-300">Agents</Link>
        <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors duration-300">Pricing</Link>
        <Link to="/embed" className="text-muted-foreground hover:text-primary transition-colors duration-300">Embed</Link>
        <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors duration-300">Dashboard</Link>
        <AccountDropdown />
      </nav>
    </header>
  );
};

export default BrandNav;
