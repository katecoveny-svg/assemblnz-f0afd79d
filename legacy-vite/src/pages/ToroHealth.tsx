import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  HeartPulse,
  Syringe,
  CalendarClock,
  Plus,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Bell,
  Trash2,
  Download,
  Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChildRow {
  id: string;
  name: string;
  date_of_birth: string | null;
  year_level: number | null;
}

interface FamilyMemberRow {
  id: string;
  user_id: string;
  role: string;
}

interface HealthRecord {
  id: string;
  family_id: string;
  child_id: string | null;
  member_name: string;
  record_type: string;
  title: string;
  provider: string | null;
  clinic: string | null;
  record_date: string | null;
  next_due: string | null;
  reminder_days_before: number | null;
  notes: string | null;
  document_url: string | null;
  is_confidential: boolean | null;
  created_at: string;
}

interface ImmunisationRow {
  id: string;
  family_id: string;
  child_id: string | null;
  vaccine_name: string;
  vaccine_code: string | null;
  scheduled_age: string | null;
  scheduled_date: string | null;
  administered_date: string | null;
  administered_by: string | null;
  clinic: string | null;
  batch_number: string | null;
  status: string | null;
  nz_schedule_ref: string | null;
}

interface NzTemplateRow {
  id: string;
  vaccine_name: string;
  vaccine_code: string | null;
  scheduled_age: string | null;
  age_months: number | null;
  dose_number: number | null;
  notes: string | null;
}

const RECORD_TYPES = [
  "GP visit",
  "Specialist",
  "Dental",
  "Optometry",
  "Mental health",
  "Allergy",
  "Prescription",
  "Lab result",
  "Vaccination",
  "Other",
] as const;

const fmtDate = (iso: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const daysUntil = (iso: string | null): number | null => {
  if (!iso) return null;
  const due = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const dueChip = (iso: string | null) => {
  const days = daysUntil(iso);
  if (days === null) return { label: "No reminder", class: "bg-[#F7F3EE] text-[#9D8C7D]" };
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, class: "bg-[#F4E4E4] text-[#A66363]" };
  if (days === 0) return { label: "Due today", class: "bg-[#F4E0C7] text-[#A67830]" };
  if (days <= 7) return { label: `Due in ${days}d`, class: "bg-[#F4E0C7] text-[#A67830]" };
  if (days <= 30) return { label: `Due in ${days}d`, class: "bg-[#FAF1E0] text-[#9D8C7D]" };
  return { label: `Due ${fmtDate(iso)}`, class: "bg-[#E5EDE9] text-[#5C8268]" };
};

const ageInMonths = (dob: string | null): number | null => {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
};

const ToroHealth = () => {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyMemberRow[]>([]);
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [immunisations, setImmunisations] = useState<ImmunisationRow[]>([]);
  const [nzTemplate, setNzTemplate] = useState<NzTemplateRow[]>([]);
  const [activeMember, setActiveMember] = useState<string>("__all__");
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [newRec, setNewRec] = useState({
    member_name: "",
    child_id: "",
    record_type: "GP visit",
    title: "",
    provider: "",
    clinic: "",
    record_date: "",
    next_due: "",
    reminder_days_before: 14,
    notes: "",
    is_confidential: false,
  });

  useEffect(() => {
    void loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsLoading(false);
      return;
    }
    const { data: membership } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!membership?.family_id) {
      setIsLoading(false);
      return;
    }
    setFamilyId(membership.family_id);

    const [{ data: m }, { data: c }, { data: hr }, { data: im }, { data: tpl }] = await Promise.all([
      supabase.from("family_members").select("id, user_id, role").eq("family_id", membership.family_id),
      supabase
        .from("toroa_children")
        .select("id, name, date_of_birth, year_level")
        .eq("family_id", membership.family_id)
        .order("date_of_birth", { ascending: true, nullsFirst: false }),
      supabase
        .from("toroa_health_records")
        .select("*")
        .eq("family_id", membership.family_id)
        .is("deleted_at", null)
        .order("next_due", { ascending: true, nullsFirst: false }),
      supabase
        .from("toroa_immunisation_schedule")
        .select("*")
        .eq("family_id", membership.family_id)
        .order("scheduled_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("toroa_nz_immunisation_template")
        .select("*")
        .order("age_months", { ascending: true, nullsFirst: false }),
    ]);

    setMembers((m as FamilyMemberRow[] | null) ?? []);
    setChildren((c as ChildRow[] | null) ?? []);
    setRecords((hr as HealthRecord[] | null) ?? []);
    setImmunisations((im as ImmunisationRow[] | null) ?? []);
    setNzTemplate((tpl as NzTemplateRow[] | null) ?? []);
    setIsLoading(false);
  };

  const memberOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [{ value: "__all__", label: "Everyone" }];
    children.forEach((c) => opts.push({ value: `child:${c.id}`, label: c.name }));
    // Distinct adult names from existing records
    const adultNames = new Set(
      records
        .filter((r) => !r.child_id)
        .map((r) => r.member_name)
        .filter(Boolean),
    );
    Array.from(adultNames).forEach((n) => opts.push({ value: `adult:${n}`, label: n }));
    return opts;
  }, [children, records]);

  const visibleRecords = useMemo(() => {
    if (activeMember === "__all__") return records;
    if (activeMember.startsWith("child:")) {
      const id = activeMember.slice(6);
      return records.filter((r) => r.child_id === id);
    }
    if (activeMember.startsWith("adult:")) {
      const name = activeMember.slice(6);
      return records.filter((r) => !r.child_id && r.member_name === name);
    }
    return records;
  }, [records, activeMember]);

  const upcomingReminders = useMemo(() => {
    return records
      .filter((r) => {
        const days = daysUntil(r.next_due);
        return days !== null && days <= 60;
      })
      .sort((a, b) => (daysUntil(a.next_due) ?? 0) - (daysUntil(b.next_due) ?? 0))
      .slice(0, 6);
  }, [records]);

  const childImmunisationStatus = (child: ChildRow) => {
    const months = ageInMonths(child.date_of_birth);
    const childImms = immunisations.filter((i) => i.child_id === child.id);
    const dueOrOverdue = nzTemplate.filter((t) => {
      if (months === null || t.age_months === null) return false;
      if (t.age_months > months) return false;
      const matched = childImms.find(
        (i) => i.vaccine_code === t.vaccine_code && i.status === "given",
      );
      return !matched;
    });
    const completed = childImms.filter((i) => i.status === "given").length;
    return { dueOrOverdue, completed, total: childImms.length };
  };

  const handleAddRecord = async () => {
    if (!familyId || !newRec.title.trim() || !newRec.member_name.trim()) {
      toast.error("Title and member name are required");
      return;
    }
    const { error } = await supabase.from("toroa_health_records").insert({
      family_id: familyId,
      child_id: newRec.child_id || null,
      member_name: newRec.member_name.trim(),
      record_type: newRec.record_type,
      title: newRec.title.trim(),
      provider: newRec.provider.trim() || null,
      clinic: newRec.clinic.trim() || null,
      record_date: newRec.record_date || null,
      next_due: newRec.next_due || null,
      reminder_days_before: newRec.reminder_days_before,
      notes: newRec.notes.trim() || null,
      is_confidential: newRec.is_confidential,
      is_minor_record: !!newRec.child_id,
    });
    if (error) {
      toast.error(`Could not add record: ${error.message}`);
      return;
    }
    toast.success("Health record added");
    setNewRec({
      member_name: "",
      child_id: "",
      record_type: "GP visit",
      title: "",
      provider: "",
      clinic: "",
      record_date: "",
      next_due: "",
      reminder_days_before: 14,
      notes: "",
      is_confidential: false,
    });
    setShowAdd(false);
    await loadAll();
  };

  const handleSoftDelete = async (rec: HealthRecord) => {
    if (!confirm(`Remove "${rec.title}"? It will be archived, not deleted permanently.`)) return;
    const { error } = await supabase
      .from("toroa_health_records")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", rec.id);
    if (error) {
      toast.error(`Could not remove: ${error.message}`);
      return;
    }
    toast.success("Record archived");
    await loadAll();
  };

  const handleUpload = async (rec: HealthRecord, file: File) => {
    if (!familyId) return;
    setUploading(rec.id);
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${familyId}/${rec.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("toro-health").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) {
      toast.error(`Upload failed: ${upErr.message}`);
      setUploading(null);
      return;
    }
    const { error: updErr } = await supabase
      .from("toroa_health_records")
      .update({ document_url: path })
      .eq("id", rec.id);
    if (updErr) {
      toast.error(`Could not link document: ${updErr.message}`);
      setUploading(null);
      return;
    }
    toast.success("Document uploaded");
    setUploading(null);
    await loadAll();
  };

  const handleDownload = async (rec: HealthRecord) => {
    if (!rec.document_url) return;
    const { data, error } = await supabase.storage
      .from("toro-health")
      .createSignedUrl(rec.document_url, 60);
    if (error || !data) {
      toast.error(`Could not open document: ${error?.message ?? "unknown error"}`);
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const handleMarkImmunisationGiven = async (vaccine: NzTemplateRow, childId: string) => {
    if (!familyId) return;
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("toroa_immunisation_schedule").insert({
      family_id: familyId,
      child_id: childId,
      vaccine_name: vaccine.vaccine_name,
      vaccine_code: vaccine.vaccine_code,
      scheduled_age: vaccine.scheduled_age,
      administered_date: today,
      status: "given",
      nz_schedule_ref: vaccine.scheduled_age,
    });
    if (error) {
      toast.error(`Could not record vaccine: ${error.message}`);
      return;
    }
    toast.success(`${vaccine.vaccine_name} marked as given`);
    await loadAll();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
        <div className="text-[#6F6158] font-body">Loading family health records…</div>
      </div>
    );
  }

  if (!familyId) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <Shield className="w-12 h-12 text-[#9D8C7D] mx-auto mb-4" />
          <h1 className="font-display text-2xl text-[#6F6158] mb-2">Sign in to manage health records</h1>
          <p className="text-[#9D8C7D] font-body mb-6">
            Tōro Health is private to your whānau. You'll need to be a member of a family workspace.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D9BC7A] text-[#3D4250] font-body"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      {/* Header */}
      <div className="border-b border-[rgba(142,129,119,0.14)] bg-white/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            to="/toro"
            className="inline-flex items-center gap-2 text-[#9D8C7D] hover:text-[#6F6158] font-body text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Tōro
          </Link>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-[#A66363]" />
            <span className="font-display text-lg text-[#3D4250]">Family Health</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Title + add */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-[#3D4250] mb-2">
              Family health & immunisation
            </h1>
            <p className="text-[#6F6158] font-body max-w-2xl">
              GP visits, prescriptions, allergies and the NZ immunisation schedule — all in one place,
              private to your whānau, with reminders before anything is due.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#D9BC7A] text-[#3D4250] font-body text-sm hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            Add health record
          </button>
        </div>

        {/* Reminders strip */}
        {upcomingReminders.length > 0 && (
          <section className="rounded-3xl bg-white/70 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] p-6 shadow-[0_8px_30px_rgba(111,97,88,0.08)]">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-[#A67830]" />
              <h2 className="font-display text-xl text-[#3D4250]">Coming up</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingReminders.map((r) => {
                const chip = dueChip(r.next_due);
                return (
                  <div
                    key={r.id}
                    className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-[#FBF8F3] border border-[rgba(142,129,119,0.10)]"
                  >
                    <div className="min-w-0">
                      <div className="font-body text-sm text-[#3D4250] truncate">{r.title}</div>
                      <div className="text-xs text-[#9D8C7D] font-body mt-1">
                        {r.member_name} · {r.record_type}
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-body whitespace-nowrap ${chip.class}`}>
                      {chip.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Member filter tabs */}
        <div className="flex flex-wrap gap-2">
          {memberOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveMember(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-body transition ${
                activeMember === opt.value
                  ? "bg-[#3D4250] text-[#F7F3EE]"
                  : "bg-white/70 text-[#6F6158] border border-[rgba(142,129,119,0.14)] hover:bg-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Records list */}
        <section className="rounded-3xl bg-white/70 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] p-6 shadow-[0_8px_30px_rgba(111,97,88,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-[#3D4250] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#9D8C7D]" />
              Records
            </h2>
            <span className="text-xs text-[#9D8C7D] font-body">
              {visibleRecords.length} record{visibleRecords.length === 1 ? "" : "s"}
            </span>
          </div>

          {visibleRecords.length === 0 ? (
            <div className="text-center py-12">
              <HeartPulse className="w-10 h-10 text-[#C9D8D0] mx-auto mb-3" />
              <p className="text-[#9D8C7D] font-body">No records yet for this filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleRecords.map((r) => {
                const chip = dueChip(r.next_due);
                return (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-[#FBF8F3] border border-[rgba(142,129,119,0.10)] hover:border-[rgba(142,129,119,0.24)] transition"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-body text-base text-[#3D4250]">{r.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEE7DE] text-[#6F6158] font-body">
                            {r.record_type}
                          </span>
                          {r.is_confidential && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F4E4E4] text-[#A66363] font-body inline-flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Confidential
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#9D8C7D] font-body mt-1">
                          {r.member_name}
                          {r.provider && ` · ${r.provider}`}
                          {r.clinic && ` · ${r.clinic}`}
                          {r.record_date && ` · seen ${fmtDate(r.record_date)}`}
                        </div>
                        {r.notes && (
                          <p className="text-sm text-[#6F6158] font-body mt-2 whitespace-pre-wrap">
                            {r.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-body whitespace-nowrap ${chip.class}`}>
                          {chip.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[rgba(142,129,119,0.10)]">
                      {r.document_url ? (
                        <button
                          onClick={() => handleDownload(r)}
                          className="inline-flex items-center gap-1.5 text-xs text-[#5C8268] hover:text-[#3D4250] font-body"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Open document
                        </button>
                      ) : (
                        <label className="inline-flex items-center gap-1.5 text-xs text-[#9D8C7D] hover:text-[#6F6158] font-body cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          {uploading === r.id ? "Uploading…" : "Attach document"}
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.png,.jpg,.jpeg,.heic,.webp"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) void handleUpload(r, f);
                            }}
                          />
                        </label>
                      )}
                      <button
                        onClick={() => handleSoftDelete(r)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#9D8C7D] hover:text-[#A66363] font-body ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Archive
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Immunisation schedule per child */}
        <section className="rounded-3xl bg-white/70 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] p-6 shadow-[0_8px_30px_rgba(111,97,88,0.08)]">
          <div className="flex items-center gap-2 mb-2">
            <Syringe className="w-4 h-4 text-[#5C8268]" />
            <h2 className="font-display text-xl text-[#3D4250]">NZ immunisation schedule</h2>
          </div>
          <p className="text-xs text-[#9D8C7D] font-body mb-5">
            Aligned with the Ministry of Health National Immunisation Schedule. Tap "Mark as given" once
            a vaccine has been administered.
          </p>

          {children.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#9D8C7D] font-body text-sm mb-3">
                Add tamariki in <Link to="/toro/children" className="text-[#5C8268] underline">Children</Link> to
                see their schedule.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {children.map((child) => {
                const status = childImmunisationStatus(child);
                const months = ageInMonths(child.date_of_birth);
                return (
                  <div key={child.id}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-body text-base text-[#3D4250]">{child.name}</div>
                        <div className="text-xs text-[#9D8C7D] font-body">
                          {months !== null ? `${Math.floor(months / 12)}y ${months % 12}m` : "DOB not set"}
                          {" · "}
                          {status.completed} of NZ schedule completed
                        </div>
                      </div>
                      {status.dueOrOverdue.length > 0 ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[#F4E0C7] text-[#A67830] font-body inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {status.dueOrOverdue.length} due
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[#E5EDE9] text-[#5C8268] font-body inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Up to date
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {nzTemplate.map((tpl) => {
                        const given = immunisations.find(
                          (i) =>
                            i.child_id === child.id &&
                            i.vaccine_code === tpl.vaccine_code &&
                            i.status === "given",
                        );
                        const eligible =
                          months !== null && tpl.age_months !== null && months >= tpl.age_months;
                        const overdue = eligible && !given;
                        return (
                          <div
                            key={tpl.id}
                            className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                              given
                                ? "bg-[#E5EDE9]/40 border-[rgba(92,130,104,0.25)]"
                                : overdue
                                ? "bg-[#F4E0C7]/40 border-[rgba(166,120,48,0.25)]"
                                : "bg-[#FBF8F3] border-[rgba(142,129,119,0.10)]"
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="font-body text-sm text-[#3D4250]">{tpl.vaccine_name}</div>
                              <div className="text-xs text-[#9D8C7D] font-body">
                                {tpl.scheduled_age}
                                {given?.administered_date && ` · given ${fmtDate(given.administered_date)}`}
                              </div>
                            </div>
                            {given ? (
                              <CheckCircle2 className="w-4 h-4 text-[#5C8268] flex-shrink-0" />
                            ) : (
                              <button
                                onClick={() => handleMarkImmunisationGiven(tpl, child.id)}
                                className="text-xs px-3 py-1.5 rounded-full bg-white border border-[rgba(142,129,119,0.20)] text-[#6F6158] hover:border-[#D9BC7A] hover:text-[#3D4250] font-body whitespace-nowrap"
                              >
                                Mark as given
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Privacy footnote */}
        <div className="text-center text-xs text-[#9D8C7D] font-body pt-4">
          <Shield className="w-3 h-3 inline mr-1" />
          Health records are private to your whānau and stored under the Privacy Act 2020. Health
          information is treated as taonga.
        </div>
      </div>

      {/* Add record modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-[#3D4250]/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#F7F3EE] border border-[rgba(142,129,119,0.14)] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[rgba(142,129,119,0.14)] flex items-center justify-between">
              <h3 className="font-display text-xl text-[#3D4250]">Add health record</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="text-[#9D8C7D] hover:text-[#6F6158] text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-[#9D8C7D] font-body mb-1 block">Who is this for?</label>
                <select
                  value={newRec.child_id ? `child:${newRec.child_id}` : "adult"}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "adult") {
                      setNewRec((p) => ({ ...p, child_id: "" }));
                    } else {
                      const id = v.slice(6);
                      const child = children.find((c) => c.id === id);
                      setNewRec((p) => ({ ...p, child_id: id, member_name: child?.name ?? "" }));
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(142,129,119,0.20)] font-body text-sm text-[#3D4250]"
                >
                  <option value="adult">An adult in the whānau</option>
                  {children.map((c) => (
                    <option key={c.id} value={`child:${c.id}`}>{c.name}</option>
                  ))}
                </select>
              </div>

              {!newRec.child_id && (
                <div>
                  <label className="text-xs text-[#9D8C7D] font-body mb-1 block">Member name</label>
                  <input
                    value={newRec.member_name}
                    onChange={(e) => setNewRec((p) => ({ ...p, member_name: e.target.value }))}
                    placeholder="e.g. Hemi"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(142,129,119,0.20)] font-body text-sm text-[#3D4250]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9D8C7D] font-body mb-1 block">Type</label>
                  <select
                    value={newRec.record_type}
                    onChange={(e) => setNewRec((p) => ({ ...p, record_type: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(142,129,119,0.20)] font-body text-sm text-[#3D4250]"
                  >
                    {RECORD_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#9D8C7D] font-body mb-1 block">Title</label>
                  <input
                    value={newRec.title}
                    onChange={(e) => setNewRec((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. 6-week check"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(142,129,119,0.20)] font-body text-sm text-[#3D4250]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9D8C7D] font-body mb-1 block">Provider</label>
                  <input
                    value={newRec.provider}
                    onChange={(e) => setNewRec((p) => ({ ...p, provider: e.target.value }))}
                    placeholder="GP / specialist"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(142,129,119,0.20)] font-body text-sm text-[#3D4250]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#9D8C7D] font-body mb-1 block">Clinic</label>
                  <input
                    value={newRec.clinic}
                    onChange={(e) => setNewRec((p) => ({ ...p, clinic: e.target.value }))}
                    placeholder="Clinic name"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(142,129,119,0.20)] font-body text-sm text-[#3D4250]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9D8C7D] font-body mb-1 block">Record date</label>
                  <input
                    type="date"
                    value={newRec.record_date}
                    onChange={(e) => setNewRec((p) => ({ ...p, record_date: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(142,129,119,0.20)] font-body text-sm text-[#3D4250]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#9D8C7D] font-body mb-1 block">Next due</label>
                  <input
                    type="date"
                    value={newRec.next_due}
                    onChange={(e) => setNewRec((p) => ({ ...p, next_due: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(142,129,119,0.20)] font-body text-sm text-[#3D4250]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#9D8C7D] font-body mb-1 block">
                  Remind us this many days before
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={newRec.reminder_days_before}
                  onChange={(e) =>
                    setNewRec((p) => ({ ...p, reminder_days_before: Number(e.target.value) || 14 }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(142,129,119,0.20)] font-body text-sm text-[#3D4250]"
                />
              </div>

              <div>
                <label className="text-xs text-[#9D8C7D] font-body mb-1 block">Notes</label>
                <textarea
                  value={newRec.notes}
                  onChange={(e) => setNewRec((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(142,129,119,0.20)] font-body text-sm text-[#3D4250]"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-xs text-[#6F6158] font-body cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRec.is_confidential}
                  onChange={(e) =>
                    setNewRec((p) => ({ ...p, is_confidential: e.target.checked }))
                  }
                  className="rounded"
                />
                Mark as confidential (extra-sensitive — e.g. mental health)
              </label>
            </div>
            <div className="p-6 border-t border-[rgba(142,129,119,0.14)] flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="px-5 py-2.5 rounded-full text-sm text-[#6F6158] font-body hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecord}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D9BC7A] text-[#3D4250] font-body text-sm hover:opacity-90"
              >
                <CalendarClock className="w-4 h-4" />
                Save record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToroHealth;
