import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import IndustryKeteShowcase from "@/components/showcase/IndustryKeteShowcase";

export default function AdminShowcaseVideos() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/admin");
  }, [loading, user, isAdmin, navigate]);

  if (loading || !isAdmin) return null;

  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm"
          style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#3A7D6E" }}
        >
          <ArrowLeft size={14} /> Back to admin
        </Link>
      </div>
      <IndustryKeteShowcase />
    </div>
  );
}
