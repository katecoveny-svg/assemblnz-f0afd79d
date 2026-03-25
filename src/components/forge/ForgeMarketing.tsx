import { useState } from "react";
import { Copy, Megaphone, CalendarDays, Camera, Zap } from "lucide-react";

const FORGE_COLOR = "#FF4D6A";

const AD_PLATFORMS = ["TradeMe", "Facebook/Instagram", "Website", "Email Newsletter", "Google Ads", "Video Script"];

const CAMPAIGN_TYPES = [
  "End of Financial Year Sale", "Long Weekend Promotion", "Trade-In Upgrade Event",
  "New Model Launch", "Service Special", "Fleet Offer", "Loyalty Programme Launch",
];

const CALENDAR_POSTS = [
  { day: 1, type: "New Stock", text: " Just arrived: 2023 Toyota RAV4 Hybrid. Low km, one owner." },
  { day: 3, type: "Customer Delivery", text: " Congratulations to the [Name] family on their new [Model]! #HappyCustomers" },
  { day: 5, type: "Behind the Scenes", text: " Our workshop team prepping another immaculate vehicle. Every car gets the full treatment." },
  { day: 7, type: "Staff Spotlight", text: " Meet [Name], our [Role]. [Fun fact]. Come say hi this weekend!" },
  { day: 9, type: "Car Care Tip", text: " Tip: Check your tyre pressure monthly. Under-inflated tyres cost you fuel and wear faster." },
  { day: 11, type: "New Stock", text: " Fresh stock alert: 2022 Mazda CX-5 Limited in Soul Red Crystal. Won't last!" },
  { day: 13, type: "Promotion", text: " FREE WoF check with every service booked this month. T&Cs apply." },
  { day: 15, type: "Community", text: " Proud sponsors of [Local Team]. Good luck this weekend!" },
  { day: 17, type: "Testimonial", text: " '[Dealership] made buying our first car so easy!' – [Customer Name]" },
  { day: 19, type: "EV Content", text: " Thinking electric? Here's what real NZ EV owners say about running costs..." },
  { day: 21, type: "New Stock", text: " 2021 Ford Ranger Wildtrak — the ultimate Kiwi workhorse. Ready for anything." },
  { day: 23, type: "Car Care Tip", text: " Rainy season tip: Check your wipers and lights. Stay safe on NZ roads." },
  { day: 25, type: "Customer Delivery", text: "Another happy customer! [Name] driving away in their dream [Model]. " },
  { day: 27, type: "Behind the Scenes", text: " Photo day! Fresh stock getting their close-ups for our website and TradeMe." },
  { day: 29, type: "Weekend Sale", text: " Weekend sale starts Friday! Trade-in bonuses on selected models. Don't miss out." },
];

const PHOTO_GUIDE = [
  { shot: "1. Hero 3/4 front", tip: "Driver's side, slight angle. Best in golden hour or overcast. Shows personality." },
  { shot: "2. Front straight", tip: "Head-on, symmetrical. Bonnet to bumper. Level camera at badge height." },
  { shot: "3. Rear 3/4", tip: "Passenger side rear. Shows tail lights, design lines." },
  { shot: "4. Side profile", tip: "Clean background. Full vehicle in frame. Level shot." },
  { shot: "5. Interior — dashboard", tip: "From passenger door. Show full dash, steering wheel, infotainment." },
  { shot: "6. Front seats", tip: "From rear seat. Show material, condition, bolstering." },
  { shot: "7. Rear seats", tip: "From front door opening. Show legroom and condition." },
  { shot: "8. Boot/cargo", tip: "Wide angle. Show capacity. Boot liner if fitted." },
  { shot: "9. Engine bay", tip: "Clean first! Wide shot showing overall condition." },
  { shot: "10. Wheels/tyres", tip: "Close-up of best wheel. Show tread depth and alloy condition." },
  { shot: "11. Special features", tip: "Sunroof, tow bar, sports bar, tech features, etc." },
  { shot: "12. Odometer", tip: "Clear shot of odometer reading. Required for TradeMe compliance." },
];

export default function ForgeMarketing() {
  const [tab, setTab] = useState<"ads" | "calendar" | "campaigns" | "photos">("ads");
  const [selectedPlatform, setSelectedPlatform] = useState("TradeMe");
  const [selectedCampaign, setSelectedCampaign] = useState(CAMPAIGN_TYPES[0]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const getAdCopy = (platform: string) => {
    const vehicle = "2022 Toyota RAV4 GXL Hybrid AWD";
    switch (platform) {
      case "TradeMe": return `${vehicle} — 28,400 KMs, One Owner\n\nOutstanding fuel efficiency meets legendary Toyota reliability. This immaculate one-owner RAV4 Hybrid comes with full dealer service history, Safety Sense 2.5, adaptive cruise, leather seats, and panoramic sunroof.\n\nAWD grip for NZ conditions. Hybrid economy for your wallet.\n\n$46,490 Drive Away (incl. GST)\n\n Photo order: Hero 3/4 → Front → Rear 3/4 → Side → Dashboard → Seats → Boot → Engine → Wheels → Features → Odo`;
      case "Facebook/Instagram": return ` JUST LISTED\n\n2022 Toyota RAV4 GXL Hybrid AWD\n 28,400km · One owner · Full history\n Leather · Sunroof · Safety Sense\n Hybrid economy = $$$ saved\n\n$46,490 drive away\n\n DM us or call [phone]\n Link in bio\n\n#Toyota #RAV4 #Hybrid #NZCars #SUV #CarDealer #NZ`;
      case "Website": return `# 2022 Toyota RAV4 GXL 2.5L Hybrid AWD\n\n## $46,490 Drive Away\n\nThis immaculate one-owner Toyota RAV4 GXL Hybrid represents the perfect blend of efficiency, capability, and Toyota's legendary reliability...\n\n### Key Features\n- Safety Sense 2.5 suite\n- Adaptive cruise control\n- Leather-appointed seats\n- Panoramic sunroof\n- All-wheel drive\n\n[Book Test Drive] [Finance Calculator] [Trade-In Quote]`;
      case "Email Newsletter": return `Subject: New In — 2022 Toyota RAV4 GXL Hybrid AWD\n\nHi [Name],\n\nWe've just taken delivery of an exceptional 2022 RAV4 Hybrid — one owner, 28,400km, full Toyota dealer history.\n\nWith hybrid economy averaging under 5L/100km and AWD grip for NZ conditions, this is the smart SUV choice.\n\n$46,490 drive away.\n\n[View Details] [Book Test Drive]\n\nCheers,\n[Dealership]`;
      case "Google Ads": return `Headline 1: 2022 Toyota RAV4 Hybrid AWD | $46,490\nHeadline 2: One Owner, Full History | Drive Away Price\nHeadline 3: Save on Fuel, Not on Features\n\nDescription 1: 2022 RAV4 GXL Hybrid AWD. 28,400km, leather, sunroof, Safety Sense. $46,490 drive away incl. GST. Book a test drive today.\n\nDescription 2: Fuel-efficient hybrid SUV with AWD. One careful owner, full Toyota service history. Finance available. Visit us in [Location].`;
      case "Video Script": return ` WALK-AROUND VIDEO SCRIPT\n\n[Start at front 3/4 angle]\n"Here we have a stunning 2022 Toyota RAV4 GXL Hybrid AWD in Crystal Pearl."\n\n[Walk to front]\n"Just 28,400 kilometers, one careful owner, and full Toyota dealer service history."\n\n[Open driver's door]\n"Inside you've got leather seats, panoramic sunroof, and Toyota's latest Safety Sense 2.5 suite."\n\n[Show infotainment]\n"The touchscreen gives you Apple CarPlay, Android Auto, and satellite navigation."\n\n[Walk to rear]\n"Generous boot space — perfect for the family, the dog, and all the weekend gear."\n\n[Back to front]\n"Being a hybrid, you're looking at under 5 litres per hundred k's. That's real savings at the pump. And it's AWD — ready for whatever NZ roads throw at it."\n\n"$46,490 drive away. Come see it in person — I reckon it won't last long."`;
      default: return "";
    }
  };

  const getCampaignContent = (type: string) => {
    return `# ${type} Campaign\n\n## Key Messages\n• Biggest savings of the year on selected models\n• Trade-in bonuses: get more for your current vehicle\n• Finance from 7.9% for qualified buyers\n• Every vehicle WoF'd, serviced, and ready to go\n\n## Email Sequence (3 emails)\n**Email 1 (7 days before):** "It's Coming — Our Biggest [Event] Yet"\n**Email 2 (3 days before):** "Sneak Peek: [X] Vehicles Ready to Go"\n**Email 3 (Day of):** "Starts NOW — Don't Miss Out"\n\n## Social Posts (5)\n1. Teaser countdown post\n2. Stock highlights carousel\n3. Finance offer graphic\n4. Behind-the-scenes prep\n5. "Last chance" urgency post\n\n## Landing Page Copy\nHeadline: "[Dealership] ${type}"\nSubhead: "Massive savings. Unbeatable trade-ins. Finance from 7.9%."\nCTA: "View Deals" / "Book Appointment"\n\n## SMS Text\n"[Dealership] ${type.split(" ").slice(0,3).join(" ")} is here! Savings on 50+ vehicles. Visit [link] or call [phone]. Ends Sunday."\n\n## Radio Script (30s)\n"Looking for a deal on wheels? [Dealership]'s ${type} is on NOW..."`;
  };

  const tabs = [
    { id: "ads" as const, label: "Vehicle Ads", icon: <Megaphone size={10} /> },
    { id: "calendar" as const, label: "Content Calendar", icon: <CalendarDays size={10} /> },
    { id: "campaigns" as const, label: "Campaigns", icon: <Zap size={10} /> },
    { id: "photos" as const, label: "Photo Guide", icon: <Camera size={10} /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h2 className="text-lg font-bold text-foreground">Marketing & Content</h2>
      <div className="flex gap-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
            style={{ backgroundColor: tab === t.id ? FORGE_COLOR + "20" : "transparent", color: tab === t.id ? FORGE_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${tab === t.id ? FORGE_COLOR + "40" : "hsl(var(--border))"}` }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "ads" && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground">Select a platform to generate ad copy for a demo vehicle (2022 Toyota RAV4 GXL Hybrid).</p>
          <div className="flex gap-1 flex-wrap">
            {AD_PLATFORMS.map(p => (
              <button key={p} onClick={() => setSelectedPlatform(p)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                style={{ backgroundColor: selectedPlatform === p ? FORGE_COLOR + "20" : "transparent", color: selectedPlatform === p ? FORGE_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${selectedPlatform === p ? FORGE_COLOR + "40" : "hsl(var(--border))"}` }}>
                {p}
              </button>
            ))}
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <pre className="whitespace-pre-wrap text-[10px] text-foreground/80 font-sans">{getAdCopy(selectedPlatform)}</pre>
          </div>
          <button onClick={() => copy(getAdCopy(selectedPlatform), 0)} className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: FORGE_COLOR, color: "#0A0A14" }}>
            <Copy size={12} /> {copiedIdx === 0 ? "Copied!" : "Copy Ad"}
          </button>
        </div>
      )}

      {tab === "calendar" && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground">30-day content calendar for dealership social media.</p>
          {CALENDAR_POSTS.map((post, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl border border-border bg-card">
              <span className="text-lg font-black shrink-0 w-8 text-center" style={{ color: FORGE_COLOR }}>
                {post.day}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{post.type}</span>
                <p className="text-[10px] text-foreground/80 mt-1">{post.text}</p>
              </div>
              <button onClick={() => copy(post.text, i + 10)} className="text-[9px] shrink-0" style={{ color: FORGE_COLOR }}>
                {copiedIdx === i + 10 ? "" : <Copy size={10} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "campaigns" && (
        <div className="space-y-3">
          <div className="flex gap-1 flex-wrap">
            {CAMPAIGN_TYPES.map(c => (
              <button key={c} onClick={() => setSelectedCampaign(c)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                style={{ backgroundColor: selectedCampaign === c ? FORGE_COLOR + "20" : "transparent", color: selectedCampaign === c ? FORGE_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${selectedCampaign === c ? FORGE_COLOR + "40" : "hsl(var(--border))"}` }}>
                {c}
              </button>
            ))}
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <pre className="whitespace-pre-wrap text-[10px] text-foreground/80 font-sans">{getCampaignContent(selectedCampaign)}</pre>
          </div>
          <button onClick={() => copy(getCampaignContent(selectedCampaign), 50)} className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: FORGE_COLOR, color: "#0A0A14" }}>
            <Copy size={12} /> {copiedIdx === 50 ? "Copied!" : "Copy Campaign"}
          </button>
        </div>
      )}

      {tab === "photos" && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground">The ideal 12-shot vehicle photography sequence.</p>
          {PHOTO_GUIDE.map((s, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card">
              <span className="text-sm font-bold shrink-0 w-6 text-center" style={{ color: FORGE_COLOR }}>{i + 1}</span>
              <div>
                <p className="text-xs font-bold text-foreground">{s.shot.replace(/^\d+\.\s*/, "")}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.tip}</p>
              </div>
            </div>
          ))}
          <div className="p-3 rounded-xl border border-border bg-card text-[10px] text-muted-foreground space-y-1">
            <p className="font-bold text-foreground">NZ Tips</p>
            <p>• Overcast days = best lighting (no harsh shadows)</p>
            <p>• Clean background — avoid messy lots or other vehicles</p>
            <p>• No overlays, logos, or stock photos on TradeMe listings</p>
            <p>• Phone: HDR on, grid on, camera at hub height</p>
          </div>
        </div>
      )}
    </div>
  );
}
