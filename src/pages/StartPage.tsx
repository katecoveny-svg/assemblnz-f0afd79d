import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Globe, Building2, User, Users, Compass, Wrench, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CONSENT_VERSION = "2026-04-10-v1";

const TEAM_SIZES = ["1", "2–5", "6–20", "21–50", "51–200", "200+"] as const;

const KETE_OPTIONS = [
  { value: "not-sure", label: "Not sure — recommend one", description: "We'll match you based on your business" },
  { value: "MANAAKI", label: "MANAAKI", description: "Hospitality & food service" },
  { value: "WAIHANGA", label: "WAIHANGA", description: "Construction & trades" },
  { value: "AUAHA", label: "AUAHA", description: "Creative & media" },
  { value: "ARATAKI", label: "ARATAKI", description: "Privacy & compliance" },
  { value: "PIKAU", label: "PIKAU", description: "Security & governance" },
  { value: "TOROA", label: "Tōroa", description: "Family edition" },
] as const;

const PAIN_POINTS = [
  "Compliance paperwork",
  "Quoting & estimates",
  "Hiring & HR",
  "Health & safety",
  "Client comms",
  "Marketing & socials",
  "Finance & invoicing",
  "Reporting",
  "Project management",
  "Something else",
] as const;

const formSchema = z.object({
  website_url: z.string().min(1, "Enter your website URL").url("Enter a valid URL (include https://)"),
  business_name: z.string().optional(),
  contact_name: z.string().min(1, "Enter your name"),
  contact_email: z.string().email("Enter a valid work email"),
  team_size: z.string().min(1, "Select your team size"),
  kete_requested: z.string().min(1, "Select a kete"),
  pain_points: z.array(z.string()).min(1, "Select at least one").max(3, "Select up to 3"),
  priority_workflow: z.string().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "You must agree to continue" }) }),
});

type FormValues = z.infer<typeof formSchema>;

const StartPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      website_url: "",
      business_name: "",
      contact_name: "",
      contact_email: "",
      team_size: "",
      kete_requested: "not-sure",
      pain_points: [],
      priority_workflow: "",
      consent: undefined,
    },
  });

  const websiteUrl = form.watch("website_url");
  const contactName = form.watch("contact_name");
  const contactEmail = form.watch("contact_email");

  const canProceed = websiteUrl && contactName && contactEmail && !form.formState.errors.website_url && !form.formState.errors.contact_email;

  const handleUnlock = async () => {
    const valid = await form.trigger(["website_url", "contact_name", "contact_email"]);
    if (valid) setStep(2);
  };

  const togglePainPoint = (point: string) => {
    const current = form.getValues("pain_points");
    if (current.includes(point)) {
      form.setValue("pain_points", current.filter((p) => p !== point), { shouldValidate: true });
    } else if (current.length < 3) {
      form.setValue("pain_points", [...current, point], { shouldValidate: true });
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const consentTimestamp = new Date().toISOString();

      // Insert intake record
      const { data: intake, error: intakeError } = await supabase
        .from("tenant_intake")
        .insert({
          website_url: values.website_url,
          business_name: values.business_name || null,
          contact_name: values.contact_name,
          contact_email: values.contact_email,
          team_size: values.team_size,
          kete_requested: values.kete_requested,
          pain_points: values.pain_points,
          priority_workflow: values.priority_workflow || null,
          consent_version: CONSENT_VERSION,
          consent_timestamp: consentTimestamp,
          pipeline_status: "pending",
        })
        .select("id")
        .single();

      if (intakeError) throw intakeError;

      // Insert consent record
      const { error: consentError } = await supabase
        .from("tenant_consent")
        .insert({
          contact_email: values.contact_email,
          consent_version: CONSENT_VERSION,
          consent_timestamp: consentTimestamp,
          intake_id: intake.id,
        });

      if (consentError) console.error("Consent log error:", consentError);

      // Trigger pipeline (fire and forget)
      supabase.functions.invoke("onboarding-pipeline", {
        body: { intake_id: intake.id },
      }).catch(console.error);

      navigate(`/start/pending/${intake.id}`);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const painPoints = form.watch("pain_points");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-6 border-b border-border/40">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">a</span>
          </div>
          <span className="text-foreground font-semibold">assembl</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 pb-24">
        <div className="max-w-lg mx-auto">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step === 2 ? "bg-primary" : "bg-muted"}`} />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Get your plan in under 3 minutes.
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            We'll read your public website, match you to the right tools, and build a personalised plan you can take to your team.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* STEP 1: Website, name, email */}
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground">
                        <Globe className="w-4 h-4 text-primary" />
                        Business website
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yoursite.co.nz"
                          {...field}
                          className="bg-card border-border/60"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="business_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground">
                        <Building2 className="w-4 h-4 text-primary" />
                        Business name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Auto-filled from your website"
                          {...field}
                          className="bg-card border-border/60"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-foreground">
                          <User className="w-4 h-4 text-primary" />
                          Your name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Sam Te Aroha" {...field} className="bg-card border-border/60" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="sam@yoursite.co.nz"
                            {...field}
                            className="bg-card border-border/60"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Unlock button for step 2 */}
              <AnimatePresence>
                {step === 1 && (
                  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button
                      type="button"
                      onClick={handleUnlock}
                      disabled={!canProceed}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* STEP 2: Team, kete, pains, workflow */}
              <AnimatePresence>
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Team size */}
                    <FormField
                      control={form.control}
                      name="team_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-foreground">
                            <Users className="w-4 h-4 text-primary" />
                            Team size
                          </FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                            {TEAM_SIZES.map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => field.onChange(size)}
                                className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                                  field.value === size
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border/60 bg-card text-muted-foreground hover:border-primary/40"
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Kete selection */}
                    <FormField
                      control={form.control}
                      name="kete_requested"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-foreground">
                            <Compass className="w-4 h-4 text-primary" />
                            Which kete are you here for?
                          </FormLabel>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-2"
                          >
                            {KETE_OPTIONS.map((kete) => (
                              <label
                                key={kete.value}
                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                  field.value === kete.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border/60 bg-card hover:border-primary/30"
                                }`}
                              >
                                <RadioGroupItem value={kete.value} className="mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-foreground">{kete.label}</div>
                                  <div className="text-xs text-muted-foreground">{kete.description}</div>
                                </div>
                              </label>
                            ))}
                          </RadioGroup>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Pain points */}
                    <FormField
                      control={form.control}
                      name="pain_points"
                      render={() => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-foreground">
                            <Wrench className="w-4 h-4 text-primary" />
                            What's eating your week? <span className="text-muted-foreground font-normal">(pick up to 3)</span>
                          </FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {PAIN_POINTS.map((point) => {
                              const selected = painPoints.includes(point);
                              const disabled = !selected && painPoints.length >= 3;
                              return (
                                <button
                                  key={point}
                                  type="button"
                                  onClick={() => togglePainPoint(point)}
                                  disabled={disabled}
                                  className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                                    selected
                                      ? "border-primary bg-primary/10 text-primary"
                                      : disabled
                                        ? "border-border/30 bg-card/50 text-muted-foreground/40 cursor-not-allowed"
                                        : "border-border/60 bg-card text-muted-foreground hover:border-primary/40"
                                  }`}
                                >
                                  {point}
                                </button>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Priority workflow */}
                    <FormField
                      control={form.control}
                      name="priority_workflow"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-foreground">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            Top workflow you'd automate first
                            <span className="text-muted-foreground font-normal">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. weekly site reports, quoting, H&S forms"
                              {...field}
                              className="bg-card border-border/60"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Consent block */}
                    <div className="rounded-xl border border-border/60 bg-card/50 p-4 space-y-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We'll scan your public website and the NZ Business Number register to personalise your plan.
                        We don't collect personal information about your staff or customers.
                        You can read exactly what we pull{" "}
                        <a href="/privacy" className="text-primary underline underline-offset-2">here</a>
                        {" "}and delete it at any time. By continuing you agree to our{" "}
                        <a href="/privacy" className="text-primary underline underline-offset-2">Privacy Statement</a>.
                      </p>

                      <FormField
                        control={form.control}
                        name="consent"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
                                className="mt-0.5"
                              />
                            </FormControl>
                            <Label className="text-xs text-foreground leading-relaxed cursor-pointer">
                              I understand what data Assembl will collect and agree to the Privacy Statement.
                            </Label>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Setting up your plan…
                        </>
                      ) : (
                        <>
                          Get my plan
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default StartPage;
