import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Clock, AlertCircle } from "lucide-react";
import { showWorkflowToast } from "./WorkflowToast";

const SPECIALISTS = [
  { name: "Registered Architect (NZRAB)", status: "done" },
  { name: "CPEng Structural", status: "done" },
  { name: "Fire Engineer (IFE)", status: "done" },
  { name: "Geotechnical Engineer", status: "progress" },
  { name: "Acoustic Consultant", status: "progress" },
  { name: "Urban Designer", status: "pending" },
];

export default function ProjectIntake() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Form */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">New Project Intake</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label className="text-xs">Project Name</Label><Input defaultValue="Kaitiaki House" className="mt-1 bg-muted border-border" /></div>
          <div><Label className="text-xs">Project Type</Label>
            <Select defaultValue="mixed"><SelectTrigger className="mt-1 bg-muted border-border"><SelectValue /></SelectTrigger>
              <SelectContent>{["Mixed-Use","Residential","Commercial","Industrial","Infrastructure","Heritage/Renovation"].map(t=><SelectItem key={t} value={t.toLowerCase().replace(/\//g,"-")}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Building Classification</Label>
            <Select defaultValue="il2"><SelectTrigger className="mt-1 bg-muted border-border"><SelectValue /></SelectTrigger>
              <SelectContent>{["IL1","IL2","IL3","IL4"].map(t=><SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Site Address</Label><Input defaultValue="14-22 Ponsonby Rd, Auckland" className="mt-1 bg-muted border-border" /></div>
          <div><Label className="text-xs">Budget Range</Label>
            <Select defaultValue="38-50"><SelectTrigger className="mt-1 bg-muted border-border"><SelectValue /></SelectTrigger>
              <SelectContent>{["Under $500K","$500K–$2M","$2M–$10M","$10M–$50M","$50M+"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Target Completion</Label><Input type="date" defaultValue="2027-11-30" className="mt-1 bg-muted border-border" /></div>
          <div><Label className="text-xs">Territorial Authority</Label>
            <Select defaultValue="akl"><SelectTrigger className="mt-1 bg-muted border-border"><SelectValue /></SelectTrigger>
              <SelectContent>{[["akl","Auckland Council"],["wcc","Wellington City"],["ccc","Christchurch City"],["hcc","Hamilton City"],["tcc","Tauranga City"],["oth","Other"]].map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Consent Pathway</Label>
            <Select defaultValue="rc-bc"><SelectTrigger className="mt-1 bg-muted border-border"><SelectValue /></SelectTrigger>
              <SelectContent>{[["rc-bc","Resource Consent + Building Consent"],["bc","Building Consent Only"],["pa","Permitted Activity"],["ft","Fast-Track"]].map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Client Requirements</Label><textarea defaultValue="6-storey mixed-use development with ground floor retail, commercial levels 1-2, residential levels 3-5 including penthouse." className="w-full mt-1 bg-muted border border-border rounded-md p-2 text-sm text-foreground min-h-[80px]" /></div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={()=>showWorkflowToast("Project created","Kaitiaki House added to workspace")}>Create Project</Button>
            <Button variant="outline" className="border-[hsl(42,78%,60%)] text-[hsl(42,78%,60%)]" onClick={()=>showWorkflowToast("AI Pre-Assessment running...","Analysing consent pathway")}>AI Pre-Assessment</Button>
            <Button variant="outline" onClick={()=>showWorkflowToast("Draft saved")}>Save as Draft</Button>
          </div>
        </CardContent>
      </Card>

      {/* Right column */}
      <div className="space-y-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">AI Pre-Assessment</CardTitle>
            <p className="text-xs text-muted-foreground">Consent complexity analysis — Ponsonby site</p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground text-xs">Auckland Unitary Plan — Business Mixed Use zone. The following consents are likely required:</p>
            <ul className="space-y-1.5 text-xs">
              {[
                "Resource Consent — Restricted Discretionary",
                "Building Consent — Commercial 2",
                "Engineering Plan Approval",
                "Heritage Overlay assessment",
              ].map(c => <li key={c} className="flex items-start gap-2"><AlertCircle size={12} className="text-primary mt-0.5 shrink-0" /><span className="text-foreground">{c}</span></li>)}
            </ul>
            <div className="rounded-lg bg-muted p-3 text-xs space-y-1">
              <p><span className="text-muted-foreground">Estimated consent timeline:</span> <span className="text-foreground font-medium">12–16 weeks</span></p>
              <p><span className="text-muted-foreground">Recommendation:</span> <span className="text-foreground">Mana whenua engagement with Ngāti Whātua Ōrākei</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Required Specialists</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {SPECIALISTS.map(s => (
                <li key={s.name} className="flex items-center gap-2 text-sm">
                  {s.status === "done" ? <Check size={14} className="text-primary" /> : s.status === "progress" ? <Clock size={14} className="text-[hsl(42,78%,60%)]" /> : <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground" />}
                  <span className="text-foreground">{s.name}</span>
                  {s.status === "progress" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-[hsl(42,78%,60%)]">In Progress</span>}
                  {s.status === "pending" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Pending</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
