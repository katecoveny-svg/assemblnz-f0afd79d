import { Search, FileBarChart, ListChecks } from "lucide-react";

interface Props {
  onWeeklyDigest: () => void;
  onOpenActions: () => void;
  onSearch: () => void;
}

export const QuickActions = ({ onWeeklyDigest, onOpenActions, onSearch }: Props) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
      <div className="bg-white/85 backdrop-blur-xl rounded-full border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.12)] flex items-center gap-1 p-1.5">
        <button
          onClick={onSearch}
          className="text-[#6F6158] hover:bg-[#EEE7DE] rounded-full px-4 py-2 text-sm font-['Inter'] inline-flex items-center gap-2"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Search meetings</span>
        </button>
        <button
          onClick={onWeeklyDigest}
          className="text-[#6F6158] hover:bg-[#EEE7DE] rounded-full px-4 py-2 text-sm font-['Inter'] inline-flex items-center gap-2"
        >
          <FileBarChart size={14} />
          <span className="hidden sm:inline">Weekly digest</span>
        </button>
        <button
          onClick={onOpenActions}
          className="bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] rounded-full px-4 py-2 text-sm font-medium font-['Inter'] inline-flex items-center gap-2"
        >
          <ListChecks size={14} />
          <span className="hidden sm:inline">Open action items</span>
        </button>
      </div>
    </div>
  );
};
