import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface Props {
  content: string;
  agentId: string;
  agentName: string;
  agentColor: string;
}

const SaveToLibrary = ({ content, agentId, agentName, agentColor }: Props) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || saved || saving) return;
    setSaving(true);
    try {
      const preview = content.replace(/[#*\-\[\]]/g, "").trim().substring(0, 100);
      const { error } = await supabase.from("saved_items").insert({
        user_id: user.id,
        agent_id: agentId,
        agent_name: agentName,
        content,
        preview,
      });
      if (!error) setSaved(true);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleSave}
          disabled={saved || saving}
          className="p-0.5 transition-colors hover:opacity-80 disabled:opacity-50"
          style={{ color: saved ? agentColor : "hsl(0 0% 100% / 0.15)" }}
          aria-label={saved ? "Saved to library" : "Save to library"}
        >
          {saved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-[10px]">
        {saved ? "Saved!" : "Save to library"}
      </TooltipContent>
    </Tooltip>
  );
};

export default SaveToLibrary;
