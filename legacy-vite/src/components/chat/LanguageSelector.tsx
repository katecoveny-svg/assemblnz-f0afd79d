import { useLanguage } from "@/components/chat/TeReoProvider";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { code: "en" as const, label: "English", flag: "" },
  { code: "mi" as const, label: "Te Reo Māori", flag: "" },
  { code: "zh" as const, label: "简体中文", flag: "" },
];

interface Props {
  agentColor: string;
}

const LanguageSelector = ({ agentColor }: Props) => {
  const { language, setLanguage } = useLanguage();
  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors hover:opacity-80 shrink-0"
          style={{ color: agentColor, border: `1px solid ${agentColor}20` }}
          aria-label="Select language"
        >
          <Languages size={10} />
          <span className="hidden sm:inline">{current.flag} {current.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="text-xs gap-2"
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            {language === lang.code && <span className="ml-auto text-primary"></span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
