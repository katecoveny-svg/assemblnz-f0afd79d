import { useState } from "react";
import { NeonStar, NeonHeart, NeonGlobe, NeonChart } from "@/components/NeonIcons";

const color = "#E6B422";

const ITINERARY_ACTIVITIES = [
  "Hiking", "Horse trekking", "Helicopter excursions", "Fly fishing", "Stargazing",
  "Wine tasting", "Farm tours", "Photography", "Mountain biking", "Spa treatments",
  "Clay cliffs trail", "Foraging experience", "Cooking class", "Kayaking",
];

const SURPRISE_IDEAS = [
  { profile: "Honeymooners", ideas: ["Rose petals & champagne", "Private dining by starlight", "Sunset experience for two", "Complimentary couples spa treatment"] },
  { profile: "Anniversary", ideas: ["Handwritten card from GM", "Commemorative property photo", "Return invitation at special rate", "Favourite wine pre-chilled in suite"] },
  { profile: "Birthday", ideas: ["Personalised cake in room", "Subtle celebration setup", "Personalised menu card", "Complimentary experience upgrade"] },
  { profile: "Food Lovers", ideas: ["Kitchen tour with head chef", "Foraging experience", "Private cooking class", "Wine cellar tasting with sommelier"] },
  { profile: "Returning Guests", ideas: ["'We remembered' touches", "Favourite wine pre-chilled", "Preferred pillow type set up", "Preferred room placement"] },
  { profile: "Solo Travellers", ideas: ["Journal & local guide in room", "Personalised activity plan", "Bar conversation from staff", "Photography tips for location"] },
  { profile: "Families (12+)", ideas: ["Adventure activity bundle", "Teen-friendly experiences", "Family photo opportunity", "Complimentary games room access"] },
];

const CONCIERGE_TOPICS = [
  { title: "Transfer Options", content: "Nearest airports, helicopter transfers, luxury car service, scenic driving routes" },
  { title: "Local Attractions", content: "Day trips, cultural experiences, Māori heritage sites, local history" },
  { title: "Restaurant Guides", content: "Regional dining recommendations for multi-day stays exploring the area" },
  { title: "Weather & Packing", content: "Seasonal patterns, what to wear/bring, photography tips for the location" },
  { title: "Cultural Experiences", content: "Māori cultural immersion, pōwhiri, traditional food, local iwi partnerships" },
  { title: "Emergency Info", content: "Nearest medical facilities, emergency contacts, pharmacy locations" },
];

interface Props { onGenerate?: (prompt: string) => void; }

const AuraGuestExperience = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const [section, setSection] = useState<"itinerary" | "surprise" | "concierge" | "feedback">("itinerary");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [stayLength, setStayLength] = useState("3");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {([
          { id: "itinerary" as const, label: "Bespoke Itinerary" },
          { id: "surprise" as const, label: "Surprise & Delight" },
          { id: "concierge" as const, label: "Concierge KB" },
          { id: "feedback" as const, label: "Feedback Analysis" },
        ]).map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{ background: section === s.id ? color + "20" : "transparent", color: section === s.id ? color : "hsl(var(--muted-foreground))", border: `1px solid ${section === s.id ? color + "40" : "hsl(var(--border))"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "itinerary" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonStar size={16} /> Bespoke Itinerary Builder</h3>
            <p className="text-[11px] text-muted-foreground mb-3">Generate a personalised day-by-day stay itinerary with dining, activities, and surprise moments.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Length of stay (nights)</label>
                <input type="number" value={stayLength} onChange={e => setStayLength(e.target.value)} min="1" max="14"
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Guest interests (select activities)</label>
                <div className="flex flex-wrap gap-1.5">
                  {ITINERARY_ACTIVITIES.map(a => (
                    <button key={a} onClick={() => setSelectedActivities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])}
                      className="px-2 py-1 rounded-full text-[10px] border transition-all"
                      style={{ borderColor: selectedActivities.includes(a) ? color : "hsl(var(--border))", background: selectedActivities.includes(a) ? color + "20" : "transparent", color: selectedActivities.includes(a) ? color : "hsl(var(--muted-foreground))" }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => gen(`Generate a bespoke ${stayLength}-night stay itinerary for a luxury lodge guest. Guest interests: ${selectedActivities.length > 0 ? selectedActivities.join(", ") : "general luxury experience"}. Include: day-by-day schedule with morning activities, lunch options (packed or restaurant), afternoon experiences, pre-dinner drinks, multi-course dinner with wine pairings. Add surprise & delight moments, downtime suggestions, and weather-appropriate alternatives. Include signature experiences: Black Diamond dining, heli-hike, horse trekking, fly fishing, stargazing. Format as a beautiful 'Stay Guide'.`)} className="w-full mt-4 py-2.5 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Bespoke Itinerary</button>
          </div>

          {/* Lindis Group Signatures */}
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-2">Signature Experiences — The Lindis Group</h3>
            <div className="space-y-1.5 text-xs text-foreground/80">
              {["Black Diamond private dining", "Heli-hike signature experience", "Horse trekking on Ben Avon Station", "Fly fishing in the Ahuriri River", "Clay cliffs trail walk", "Dark sky stargazing", "Sage Restaurant at Paroa Bay", "Cross-property journey (Mt Isthmus + Paroa Bay)"].map(e => (
                <div key={e} className="flex items-center gap-2 p-2 rounded-lg border border-border">
                  <NeonStar size={12} />
                  <span>{e}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "surprise" && (
        <div className="space-y-3">
          {SURPRISE_IDEAS.map(s => (
            <div key={s.profile} className="rounded-xl border border-border bg-card p-4">
              <h4 className="font-semibold text-xs flex items-center gap-2 mb-2" style={{ color }}><NeonHeart size={14} /> {s.profile}</h4>
              <div className="grid grid-cols-2 gap-1.5">
                {s.ideas.map(idea => (
                  <div key={idea} className="text-[11px] text-foreground/70 p-2 rounded-lg border border-border">{idea}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {section === "concierge" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonGlobe size={16} color={color} /> Concierge Knowledge Base</h3>
            <div className="space-y-2">
              {CONCIERGE_TOPICS.map(t => (
                <div key={t.title} className="p-3 rounded-lg border border-border">
                  <div className="text-xs font-medium text-foreground">{t.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{t.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "feedback" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonChart size={16} color={color} /> Guest Feedback Analysis</h3>
            <p className="text-[11px] text-muted-foreground mb-3">Upload reviews or feedback — AURA analyses sentiment, themes, and generates improvement plans.</p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg border border-border"><span className="font-medium text-foreground">Sentiment Analysis:</span> <span className="text-muted-foreground">Positive/negative/neutral by category</span></div>
              <div className="p-3 rounded-lg border border-border"><span className="font-medium text-foreground">Praise Themes:</span> <span className="text-muted-foreground">What guests love most</span></div>
              <div className="p-3 rounded-lg border border-border"><span className="font-medium text-foreground">Improvement Themes:</span> <span className="text-muted-foreground">Action items with priority</span></div>
              <div className="p-3 rounded-lg border border-border"><span className="font-medium text-foreground">Competitive Benchmarking:</span> <span className="text-muted-foreground">Position vs comparable properties</span></div>
            </div>
            <button onClick={() => gen(`Analyse the following guest feedback and generate a comprehensive report. Include: sentiment analysis (positive/negative/neutral by category — service, dining, rooms, activities, location), common praise themes, common improvement themes, competitive benchmarking suggestions, and a quarterly improvement action plan with priorities. Format as a professional report.`)} className="w-full mt-3 py-2.5 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Analyse Guest Feedback</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuraGuestExperience;
