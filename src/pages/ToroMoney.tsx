import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  Wallet,
  PiggyBank,
  Heart,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Settings2,
  Target,
  Flame,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChildRow {
  id: string;
  name: string;
  year_level: string | null;
  avatar_color: string | null;
}

interface PocketMoneyRow {
  id: string;
  family_id: string;
  child_id: string;
  weekly_amount: number;
  save_percent: number;
  spend_percent: number;
  give_percent: number;
  save_balance: number;
  spend_balance: number;
  give_balance: number;
  payday: string;
  auto_distribute: boolean;
}

interface ChoreRow {
  id: string;
  family_id: string;
  child_id: string | null;
  chore_name: string;
  description: string | null;
  points: number;
  bonus_amount: number;
  frequency: string;
  due_day: string | null;
  status: string;
  completed_at: string | null;
  streak_count: number;
  longest_streak: number;
  total_completions: number;
  icon: string | null;
}

interface SavingsGoalRow {
  id: string;
  family_id: string;
  child_id: string;
  goal_name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  photo_url: string | null;
  status: string;
}

interface PurchaseApprovalRow {
  id: string;
  family_id: string;
  child_id: string;
  amount: number;
  jar: string;
  description: string;
  item_url: string | null;
  status: string;
  requested_at: string;
  decided_at: string | null;
  decision_note: string | null;
}

const fmtNZD = (n: number) =>
  new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(n ?? 0);

const JAR_META: Record<string, { label: string; icon: typeof PiggyBank; tint: string; chip: string }> = {
  save: { label: "Save", icon: PiggyBank, tint: "bg-[#E5EDE9] text-[#5C8268]", chip: "bg-[#E5EDE9]" },
  spend: { label: "Spend", icon: ShoppingBag, tint: "bg-[#F4E0C7] text-[#A67830]", chip: "bg-[#F4E0C7]" },
  give: { label: "Give", icon: Heart, tint: "bg-[#F4E4E4] text-[#A66363]", chip: "bg-[#F4E4E4]" },
};

const ToroMoney = () => {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [pocketMoney, setPocketMoney] = useState<PocketMoneyRow[]>([]);
  const [chores, setChores] = useState<ChoreRow[]>([]);
  const [goals, setGoals] = useState<SavingsGoalRow[]>([]);
  const [approvals, setApprovals] = useState<PurchaseApprovalRow[]>([]);
  const [activeChild, setActiveChild] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAllowance, setShowAllowance] = useState(false);
  const [showAddChore, setShowAddChore] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showRequest, setShowRequest] = useState(false);

  const [allowanceForm, setAllowanceForm] = useState({
    weekly_amount: 15,
    save_percent: 33,
    spend_percent: 34,
    give_percent: 33,
    payday: "friday",
    auto_distribute: true,
  });
  const [choreForm, setChoreForm] = useState({
    chore_name: "",
    description: "",
    points: 10,
    bonus_amount: 0,
    frequency: "daily",
  });
  const [goalForm, setGoalForm] = useState({
    goal_name: "",
    target_amount: 50,
    target_date: "",
  });
  const [requestForm, setRequestForm] = useState({
    amount: 0,
    jar: "spend",
    description: "",
    item_url: "",
  });

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    if (!activeChild && children.length > 0) setActiveChild(children[0].id);
  }, [children, activeChild]);

  const loadAll = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsLoading(false);
      return;
    }
    setUserId(session.user.id);
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

    const [{ data: c }, { data: pm }, { data: ch }, { data: g }, { data: ap }] = await Promise.all([
      supabase
        .from("children")
        .select("id, name, year_level, avatar_color")
        .eq("family_id", membership.family_id)
        .order("created_at", { ascending: true }),
      supabase
        .from("toroa_child_pocket_money")
        .select("*")
        .eq("family_id", membership.family_id),
      supabase
        .from("toroa_chore_assignments")
        .select("*")
        .eq("family_id", membership.family_id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("toroa_savings_goals")
        .select("*")
        .eq("family_id", membership.family_id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("toroa_purchase_approvals")
        .select("*")
        .eq("family_id", membership.family_id)
        .order("requested_at", { ascending: false })
        .limit(50),
    ]);

    setChildren((c as ChildRow[] | null) ?? []);
    setPocketMoney((pm as PocketMoneyRow[] | null) ?? []);
    setChores((ch as ChoreRow[] | null) ?? []);
    setGoals((g as SavingsGoalRow[] | null) ?? []);
    setApprovals((ap as PurchaseApprovalRow[] | null) ?? []);
    setIsLoading(false);
  };

  const childPocket = useMemo(
    () => pocketMoney.find((p) => p.child_id === activeChild) ?? null,
    [pocketMoney, activeChild],
  );
  const childChores = useMemo(
    () => chores.filter((c) => c.child_id === activeChild),
    [chores, activeChild],
  );
  const childGoals = useMemo(
    () => goals.filter((g) => g.child_id === activeChild),
    [goals, activeChild],
  );
  const childApprovals = useMemo(
    () => approvals.filter((a) => a.child_id === activeChild),
    [approvals, activeChild],
  );
  const pendingApprovals = useMemo(
    () => approvals.filter((a) => a.status === "pending"),
    [approvals],
  );

  const totalPoints = useMemo(
    () => childChores.filter((c) => c.status === "completed").reduce((s, c) => s + (c.points ?? 0), 0),
    [childChores],
  );
  const longestStreak = useMemo(
    () => Math.max(0, ...childChores.map((c) => c.longest_streak ?? 0)),
    [childChores],
  );

  const saveAllowance = async () => {
    if (!familyId || !activeChild) return;
    const sum = allowanceForm.save_percent + allowanceForm.spend_percent + allowanceForm.give_percent;
    if (sum !== 100) {
      toast.error("Jar percentages must total 100");
      return;
    }
    if (childPocket) {
      const { error } = await supabase
        .from("toroa_child_pocket_money")
        .update({
          weekly_amount: allowanceForm.weekly_amount,
          save_percent: allowanceForm.save_percent,
          spend_percent: allowanceForm.spend_percent,
          give_percent: allowanceForm.give_percent,
          payday: allowanceForm.payday,
          auto_distribute: allowanceForm.auto_distribute,
        })
        .eq("id", childPocket.id);
      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("toroa_child_pocket_money").insert({
        family_id: familyId,
        child_id: activeChild,
        weekly_amount: allowanceForm.weekly_amount,
        save_percent: allowanceForm.save_percent,
        spend_percent: allowanceForm.spend_percent,
        give_percent: allowanceForm.give_percent,
        payday: allowanceForm.payday,
        auto_distribute: allowanceForm.auto_distribute,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    toast.success("Allowance saved");
    setShowAllowance(false);
    void loadAll();
  };

  const openAllowance = () => {
    if (childPocket) {
      setAllowanceForm({
        weekly_amount: Number(childPocket.weekly_amount),
        save_percent: childPocket.save_percent,
        spend_percent: childPocket.spend_percent,
        give_percent: childPocket.give_percent,
        payday: childPocket.payday,
        auto_distribute: childPocket.auto_distribute,
      });
    } else {
      setAllowanceForm({
        weekly_amount: 15,
        save_percent: 33,
        spend_percent: 34,
        give_percent: 33,
        payday: "friday",
        auto_distribute: true,
      });
    }
    setShowAllowance(true);
  };

  const addChore = async () => {
    if (!familyId || !activeChild || !choreForm.chore_name.trim()) {
      toast.error("Chore name required");
      return;
    }
    const { error } = await supabase.from("toroa_chore_assignments").insert({
      family_id: familyId,
      child_id: activeChild,
      chore_name: choreForm.chore_name.trim(),
      description: choreForm.description || null,
      points: choreForm.points,
      bonus_amount: choreForm.bonus_amount,
      frequency: choreForm.frequency,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Chore added");
    setShowAddChore(false);
    setChoreForm({ chore_name: "", description: "", points: 10, bonus_amount: 0, frequency: "daily" });
    void loadAll();
  };

  const toggleChore = async (chore: ChoreRow) => {
    if (!userId) return;
    const isDone = chore.status === "completed";
    if (isDone) {
      const { error } = await supabase
        .from("toroa_chore_assignments")
        .update({ status: "pending", completed_at: null, verified_by: null })
        .eq("id", chore.id);
      if (error) toast.error(error.message);
    } else {
      const newStreak = (chore.streak_count ?? 0) + 1;
      const { error } = await supabase
        .from("toroa_chore_assignments")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          verified_by: userId,
          streak_count: newStreak,
          longest_streak: Math.max(chore.longest_streak ?? 0, newStreak),
          total_completions: (chore.total_completions ?? 0) + 1,
        })
        .eq("id", chore.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      // Bonus: pay into spend jar if configured
      if (chore.bonus_amount && chore.bonus_amount > 0 && childPocket) {
        await supabase.from("toroa_money_transactions").insert({
          family_id: chore.family_id,
          child_id: chore.child_id,
          amount: chore.bonus_amount,
          jar: "spend",
          transaction_type: "credit",
          description: `Chore bonus: ${chore.chore_name}`,
          chore_id: chore.id,
        });
        await supabase
          .from("toroa_child_pocket_money")
          .update({ spend_balance: Number(childPocket.spend_balance) + Number(chore.bonus_amount) })
          .eq("id", childPocket.id);
      }
      toast.success(`Chore done — +${chore.points} pts`);
    }
    void loadAll();
  };

  const deleteChore = async (id: string) => {
    const { error } = await supabase
      .from("toroa_chore_assignments")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void loadAll();
  };

  const addGoal = async () => {
    if (!familyId || !activeChild || !goalForm.goal_name.trim() || goalForm.target_amount <= 0) {
      toast.error("Goal name and target required");
      return;
    }
    const { error } = await supabase.from("toroa_savings_goals").insert({
      family_id: familyId,
      child_id: activeChild,
      goal_name: goalForm.goal_name.trim(),
      target_amount: goalForm.target_amount,
      target_date: goalForm.target_date || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Goal set");
    setShowAddGoal(false);
    setGoalForm({ goal_name: "", target_amount: 50, target_date: "" });
    void loadAll();
  };

  const contributeToGoal = async (goal: SavingsGoalRow, amount: number) => {
    if (!childPocket || amount <= 0) return;
    if (Number(childPocket.save_balance) < amount) {
      toast.error("Not enough in Save jar");
      return;
    }
    const newSaved = Number(goal.saved_amount) + amount;
    const achieved = newSaved >= Number(goal.target_amount);
    await supabase
      .from("toroa_savings_goals")
      .update({
        saved_amount: newSaved,
        status: achieved ? "achieved" : "active",
        achieved_at: achieved ? new Date().toISOString() : null,
      })
      .eq("id", goal.id);
    await supabase
      .from("toroa_child_pocket_money")
      .update({ save_balance: Number(childPocket.save_balance) - amount })
      .eq("id", childPocket.id);
    await supabase.from("toroa_money_transactions").insert({
      family_id: goal.family_id,
      child_id: goal.child_id,
      amount,
      jar: "save",
      transaction_type: "transfer",
      description: `Towards ${goal.goal_name}`,
      goal_id: goal.id,
    });
    if (achieved) toast.success(`🎉 ${goal.goal_name} reached!`);
    else toast.success(`${fmtNZD(amount)} added to ${goal.goal_name}`);
    void loadAll();
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from("toroa_savings_goals")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void loadAll();
  };

  const requestPurchase = async () => {
    if (!familyId || !activeChild || !requestForm.description.trim() || requestForm.amount <= 0) {
      toast.error("Description and amount required");
      return;
    }
    const { error } = await supabase.from("toroa_purchase_approvals").insert({
      family_id: familyId,
      child_id: activeChild,
      amount: requestForm.amount,
      jar: requestForm.jar,
      description: requestForm.description.trim(),
      item_url: requestForm.item_url || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Request sent for parent approval");
    setShowRequest(false);
    setRequestForm({ amount: 0, jar: "spend", description: "", item_url: "" });
    void loadAll();
  };

  const decideApproval = async (approval: PurchaseApprovalRow, approved: boolean, note?: string) => {
    if (!userId) return;
    const status = approved ? "approved" : "rejected";
    const { error } = await supabase
      .from("toroa_purchase_approvals")
      .update({
        status,
        decided_at: new Date().toISOString(),
        decided_by: userId,
        decision_note: note ?? null,
      })
      .eq("id", approval.id);
    if (error) {
      toast.error(error.message);
      return;
    }

    if (approved) {
      const pm = pocketMoney.find((p) => p.child_id === approval.child_id);
      if (pm) {
        const balKey = `${approval.jar}_balance` as "save_balance" | "spend_balance" | "give_balance";
        const currentBal = Number(pm[balKey]);
        if (currentBal < Number(approval.amount)) {
          toast.error(`Not enough in ${approval.jar} jar`);
          return;
        }
        await supabase
          .from("toroa_child_pocket_money")
          .update({ [balKey]: currentBal - Number(approval.amount) })
          .eq("id", pm.id);
        await supabase.from("toroa_money_transactions").insert({
          family_id: approval.family_id,
          child_id: approval.child_id,
          amount: approval.amount,
          jar: approval.jar,
          transaction_type: "debit",
          description: `Approved purchase: ${approval.description}`,
        });
      }
      toast.success("Approved");
    } else {
      toast.success("Declined");
    }
    void loadAll();
  };

  const activeChildName = children.find((c) => c.id === activeChild)?.name ?? "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
        <div className="font-body text-sm text-[#9D8C7D]">Loading whānau money…</div>
      </div>
    );
  }

  if (!familyId) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="font-display text-2xl text-[#6F6158]">Sign in required</h1>
          <p className="font-body text-sm text-[#9D8C7D]">
            You need to be a member of a Tōro whānau to use the money centre.
          </p>
          <Link to="/auth" className="inline-block px-5 py-2 rounded-full bg-[#D9BC7A] text-white font-body text-sm">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      {/* Header */}
      <header className="px-6 py-5 border-b border-[#8E81771F]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <Link to="/toroa" className="inline-flex items-center gap-2 text-[#6F6158] font-body text-sm">
            <ChevronLeft size={16} /> Back to Tōro
          </Link>
          <div className="flex items-center gap-3">
            <Wallet size={20} className="text-[#D9BC7A]" />
            <h1 className="font-display text-2xl text-[#6F6158]">Money & chores</h1>
          </div>
          <button
            onClick={openAllowance}
            disabled={!activeChild}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#8E81771F] text-[#6F6158] font-body text-sm hover:bg-[#FAF7F2] disabled:opacity-50"
          >
            <Settings2 size={14} /> Set allowance
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {children.length === 0 ? (
          <div className="bg-white border border-[#8E81771F] rounded-3xl p-10 text-center">
            <h2 className="font-display text-xl text-[#6F6158] mb-2">Add tamariki to begin</h2>
            <p className="font-body text-sm text-[#9D8C7D] mb-4">
              Pocket money, chores and savings goals are tracked per child. Add your first child from the Tōro home.
            </p>
            <Link to="/toroa" className="inline-block px-5 py-2 rounded-full bg-[#D9BC7A] text-white font-body text-sm">
              Go to Tōro home
            </Link>
          </div>
        ) : (
          <>
            {/* Pending approvals (parent banner) */}
            {pendingApprovals.length > 0 && (
              <section className="bg-white border border-[#D9BC7A66] rounded-3xl p-5 shadow-[0_8px_30px_rgba(111,97,88,0.06)]">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={16} className="text-[#A67830]" />
                  <h2 className="font-display text-lg text-[#6F6158]">Awaiting your approval</h2>
                  <span className="ml-auto font-mono text-xs text-[#9D8C7D]">{pendingApprovals.length} pending</span>
                </div>
                <div className="space-y-2">
                  {pendingApprovals.map((a) => {
                    const child = children.find((c) => c.id === a.child_id);
                    const meta = JAR_META[a.jar] ?? JAR_META.spend;
                    return (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7F2]">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase ${meta.tint}`}>
                          {meta.label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-body text-sm text-[#6F6158] truncate">
                            {child?.name ?? "Child"} — {a.description}
                          </div>
                          {a.item_url && (
                            <a
                              href={a.item_url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-body text-xs text-[#A67830] underline truncate block"
                            >
                              {a.item_url}
                            </a>
                          )}
                        </div>
                        <span className="font-mono text-sm text-[#6F6158]">{fmtNZD(Number(a.amount))}</span>
                        <button
                          onClick={() => decideApproval(a, true)}
                          className="p-2 rounded-full bg-[#E5EDE9] text-[#5C8268] hover:bg-[#D6E5DD]"
                          aria-label="Approve"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => decideApproval(a, false)}
                          className="p-2 rounded-full bg-[#F4E4E4] text-[#A66363] hover:bg-[#EFD6D6]"
                          aria-label="Decline"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Child tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {children.map((c) => {
                const active = c.id === activeChild;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveChild(c.id)}
                    className={`px-4 py-2 rounded-full font-body text-sm whitespace-nowrap border transition ${
                      active
                        ? "bg-[#6F6158] text-white border-[#6F6158]"
                        : "bg-white text-[#6F6158] border-[#8E81771F] hover:bg-[#FAF7F2]"
                    }`}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                      style={{ background: c.avatar_color ?? "#D9BC7A" }}
                    />
                    {c.name}
                    {c.year_level && (
                      <span className={`ml-2 font-mono text-[10px] ${active ? "text-white/70" : "text-[#9D8C7D]"}`}>
                        {c.year_level}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Three jars */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["save", "spend", "give"] as const).map((jar) => {
                const meta = JAR_META[jar];
                const Icon = meta.icon;
                const balance = childPocket ? Number(childPocket[`${jar}_balance` as "save_balance"]) : 0;
                const pct = childPocket ? childPocket[`${jar}_percent` as "save_percent"] : 0;
                const weekly = childPocket
                  ? (Number(childPocket.weekly_amount) * pct) / 100
                  : 0;
                return (
                  <div
                    key={jar}
                    className="bg-white border border-[#8E81771F] rounded-3xl p-5 shadow-[0_8px_30px_rgba(111,97,88,0.06)]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${meta.tint}`}>
                        <Icon size={18} />
                      </div>
                      <span className="font-mono text-xs text-[#9D8C7D]">{pct}%</span>
                    </div>
                    <div className="font-display text-2xl text-[#6F6158]">{fmtNZD(balance)}</div>
                    <div className="font-body text-xs text-[#9D8C7D] mt-1">
                      {meta.label} jar · {fmtNZD(weekly)}/week
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Stats row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-[#8E81771F] rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[#9D8C7D] font-body text-xs">
                  <Sparkles size={12} /> Points this week
                </div>
                <div className="font-display text-xl text-[#6F6158] mt-1">{totalPoints}</div>
              </div>
              <div className="bg-white border border-[#8E81771F] rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[#9D8C7D] font-body text-xs">
                  <Flame size={12} /> Best streak
                </div>
                <div className="font-display text-xl text-[#6F6158] mt-1">{longestStreak}d</div>
              </div>
              <div className="bg-white border border-[#8E81771F] rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[#9D8C7D] font-body text-xs">
                  <CheckCircle2 size={12} /> Chores done
                </div>
                <div className="font-display text-xl text-[#6F6158] mt-1">
                  {childChores.filter((c) => c.status === "completed").length}/{childChores.length}
                </div>
              </div>
              <div className="bg-white border border-[#8E81771F] rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[#9D8C7D] font-body text-xs">
                  <Target size={12} /> Goals on track
                </div>
                <div className="font-display text-xl text-[#6F6158] mt-1">
                  {childGoals.filter((g) => g.status === "active").length}
                </div>
              </div>
            </section>

            {/* Chores */}
            <section className="bg-white border border-[#8E81771F] rounded-3xl p-5 shadow-[0_8px_30px_rgba(111,97,88,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-[#6F6158]">Chore checklist</h2>
                <button
                  onClick={() => setShowAddChore(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#8E81771F] text-[#6F6158] font-body text-xs hover:bg-[#F4EFE8]"
                >
                  <Plus size={12} /> Add chore
                </button>
              </div>
              {childChores.length === 0 ? (
                <p className="font-body text-sm text-[#9D8C7D] py-4 text-center">
                  No chores set yet. Add the first one to start earning points.
                </p>
              ) : (
                <ul className="space-y-2">
                  {childChores.map((c) => {
                    const done = c.status === "completed";
                    return (
                      <li
                        key={c.id}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                          done ? "bg-[#F4F8F5] border-[#C8DDD0]" : "bg-[#FAF7F2] border-[#8E81771F]"
                        }`}
                      >
                        <button
                          onClick={() => toggleChore(c)}
                          className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${
                            done
                              ? "bg-[#5C8268] border-[#5C8268] text-white"
                              : "bg-white border-[#9D8C7D]"
                          }`}
                          aria-label={done ? "Mark not done" : "Mark done"}
                        >
                          {done && <Check size={14} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`font-body text-sm ${done ? "line-through text-[#9D8C7D]" : "text-[#6F6158]"}`}>
                            {c.chore_name}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {c.description && (
                              <span className="font-body text-xs text-[#9D8C7D] truncate">{c.description}</span>
                            )}
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#9D8C7D]">
                              <Clock size={10} /> {c.frequency}
                            </span>
                            {c.streak_count > 0 && (
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#A67830]">
                                <Flame size={10} /> {c.streak_count}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-sm text-[#D9BC7A]">+{c.points} pts</div>
                          {Number(c.bonus_amount) > 0 && (
                            <div className="font-mono text-[10px] text-[#5C8268]">
                              {fmtNZD(Number(c.bonus_amount))} bonus
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => deleteChore(c.id)}
                          className="p-1.5 rounded text-[#9D8C7D] hover:text-[#A66363] hover:bg-white"
                          aria-label="Delete chore"
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Savings goals */}
            <section className="bg-white border border-[#8E81771F] rounded-3xl p-5 shadow-[0_8px_30px_rgba(111,97,88,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-[#6F6158]">Savings goals</h2>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#8E81771F] text-[#6F6158] font-body text-xs hover:bg-[#F4EFE8]"
                >
                  <Plus size={12} /> New goal
                </button>
              </div>
              {childGoals.length === 0 ? (
                <p className="font-body text-sm text-[#9D8C7D] py-4 text-center">
                  No savings goals yet. Set one to give the Save jar a destination.
                </p>
              ) : (
                <div className="space-y-3">
                  {childGoals.map((g) => {
                    const pct = Math.min(100, Math.round((Number(g.saved_amount) / Number(g.target_amount)) * 100));
                    const achieved = g.status === "achieved";
                    return (
                      <div key={g.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#8E81771F]">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Target size={14} className="text-[#5C8268] shrink-0" />
                            <span className="font-body text-sm text-[#6F6158] truncate">{g.goal_name}</span>
                            {achieved && (
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#E5EDE9] text-[#5C8268]">
                                Achieved
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs text-[#9D8C7D] shrink-0">
                            {fmtNZD(Number(g.saved_amount))} / {fmtNZD(Number(g.target_amount))}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#EEE7DE] overflow-hidden mb-3">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: achieved ? "#5C8268" : "#D9BC7A",
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            {!achieved &&
                              [1, 5, 10].map((amt) => (
                                <button
                                  key={amt}
                                  onClick={() => contributeToGoal(g, amt)}
                                  disabled={!childPocket || Number(childPocket.save_balance) < amt}
                                  className="px-3 py-1 rounded-full bg-white border border-[#8E81771F] font-mono text-xs text-[#6F6158] hover:bg-[#F4EFE8] disabled:opacity-40"
                                >
                                  +{fmtNZD(amt)}
                                </button>
                              ))}
                            {g.target_date && (
                              <span className="font-mono text-[10px] text-[#9D8C7D]">
                                by {new Date(g.target_date).toLocaleDateString("en-NZ")}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteGoal(g.id)}
                            className="p-1.5 rounded text-[#9D8C7D] hover:text-[#A66363] hover:bg-white"
                            aria-label="Delete goal"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Purchase requests for this child */}
            <section className="bg-white border border-[#8E81771F] rounded-3xl p-5 shadow-[0_8px_30px_rgba(111,97,88,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-[#6F6158]">Purchase requests</h2>
                <button
                  onClick={() => setShowRequest(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#8E81771F] text-[#6F6158] font-body text-xs hover:bg-[#F4EFE8]"
                >
                  <Plus size={12} /> Ask to spend
                </button>
              </div>
              {childApprovals.length === 0 ? (
                <p className="font-body text-sm text-[#9D8C7D] py-4 text-center">
                  No requests yet for {activeChildName}.
                </p>
              ) : (
                <ul className="space-y-2">
                  {childApprovals.slice(0, 10).map((a) => {
                    const meta = JAR_META[a.jar] ?? JAR_META.spend;
                    const statusClass =
                      a.status === "approved"
                        ? "bg-[#E5EDE9] text-[#5C8268]"
                        : a.status === "rejected"
                          ? "bg-[#F4E4E4] text-[#A66363]"
                          : "bg-[#F4E0C7] text-[#A67830]";
                    return (
                      <li key={a.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7F2]">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase ${meta.tint}`}>
                          {meta.label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-body text-sm text-[#6F6158] truncate">{a.description}</div>
                          <div className="font-mono text-[10px] text-[#9D8C7D]">
                            {new Date(a.requested_at).toLocaleDateString("en-NZ")}
                          </div>
                        </div>
                        <span className="font-mono text-sm text-[#6F6158]">{fmtNZD(Number(a.amount))}</span>
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${statusClass}`}>
                          {a.status}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </main>

      {/* Allowance modal */}
      {showAllowance && (
        <Modal title="Set allowance" onClose={() => setShowAllowance(false)}>
          <div className="space-y-4">
            <Field label="Weekly amount (NZD)">
              <input
                type="number"
                min="0"
                step="0.50"
                value={allowanceForm.weekly_amount}
                onChange={(e) =>
                  setAllowanceForm({ ...allowanceForm, weekly_amount: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Save %">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={allowanceForm.save_percent}
                  onChange={(e) =>
                    setAllowanceForm({ ...allowanceForm, save_percent: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
                />
              </Field>
              <Field label="Spend %">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={allowanceForm.spend_percent}
                  onChange={(e) =>
                    setAllowanceForm({ ...allowanceForm, spend_percent: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
                />
              </Field>
              <Field label="Give %">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={allowanceForm.give_percent}
                  onChange={(e) =>
                    setAllowanceForm({ ...allowanceForm, give_percent: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
                />
              </Field>
            </div>
            <p className="font-mono text-xs text-[#9D8C7D]">
              Total:{" "}
              {allowanceForm.save_percent + allowanceForm.spend_percent + allowanceForm.give_percent}% (must be 100)
            </p>
            <Field label="Payday">
              <select
                value={allowanceForm.payday}
                onChange={(e) => setAllowanceForm({ ...allowanceForm, payday: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
              >
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2 font-body text-sm text-[#6F6158]">
              <input
                type="checkbox"
                checked={allowanceForm.auto_distribute}
                onChange={(e) => setAllowanceForm({ ...allowanceForm, auto_distribute: e.target.checked })}
              />
              Auto-distribute into jars on payday
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAllowance(false)}
                className="px-4 py-2 rounded-full border border-[#8E81771F] font-body text-sm text-[#6F6158]"
              >
                Cancel
              </button>
              <button
                onClick={saveAllowance}
                className="px-4 py-2 rounded-full bg-[#D9BC7A] text-white font-body text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add chore modal */}
      {showAddChore && (
        <Modal title="Add chore" onClose={() => setShowAddChore(false)}>
          <div className="space-y-3">
            <Field label="Chore name">
              <input
                type="text"
                value={choreForm.chore_name}
                onChange={(e) => setChoreForm({ ...choreForm, chore_name: e.target.value })}
                placeholder="e.g. Empty the dishwasher"
                className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
              />
            </Field>
            <Field label="Description (optional)">
              <input
                type="text"
                value={choreForm.description}
                onChange={(e) => setChoreForm({ ...choreForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Points">
                <input
                  type="number"
                  min="0"
                  value={choreForm.points}
                  onChange={(e) => setChoreForm({ ...choreForm, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
                />
              </Field>
              <Field label="Bonus $">
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={choreForm.bonus_amount}
                  onChange={(e) =>
                    setChoreForm({ ...choreForm, bonus_amount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
                />
              </Field>
              <Field label="Frequency">
                <select
                  value={choreForm.frequency}
                  onChange={(e) => setChoreForm({ ...choreForm, frequency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="once">Once</option>
                </select>
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddChore(false)}
                className="px-4 py-2 rounded-full border border-[#8E81771F] font-body text-sm text-[#6F6158]"
              >
                Cancel
              </button>
              <button
                onClick={addChore}
                className="px-4 py-2 rounded-full bg-[#D9BC7A] text-white font-body text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add goal modal */}
      {showAddGoal && (
        <Modal title="New savings goal" onClose={() => setShowAddGoal(false)}>
          <div className="space-y-3">
            <Field label="What are you saving for?">
              <input
                type="text"
                value={goalForm.goal_name}
                onChange={(e) => setGoalForm({ ...goalForm, goal_name: e.target.value })}
                placeholder="e.g. Skateboard"
                className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
              />
            </Field>
            <Field label="Target amount (NZD)">
              <input
                type="number"
                min="1"
                step="1"
                value={goalForm.target_amount}
                onChange={(e) => setGoalForm({ ...goalForm, target_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
              />
            </Field>
            <Field label="Target date (optional)">
              <input
                type="date"
                value={goalForm.target_date}
                onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddGoal(false)}
                className="px-4 py-2 rounded-full border border-[#8E81771F] font-body text-sm text-[#6F6158]"
              >
                Cancel
              </button>
              <button
                onClick={addGoal}
                className="px-4 py-2 rounded-full bg-[#D9BC7A] text-white font-body text-sm"
              >
                Set goal
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Purchase request modal */}
      {showRequest && (
        <Modal title="Ask to spend" onClose={() => setShowRequest(false)}>
          <div className="space-y-3">
            <Field label="What would you like to buy?">
              <input
                type="text"
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                placeholder="e.g. Lego set"
                className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Amount (NZD)">
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={requestForm.amount}
                  onChange={(e) => setRequestForm({ ...requestForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
                />
              </Field>
              <Field label="From jar">
                <select
                  value={requestForm.jar}
                  onChange={(e) => setRequestForm({ ...requestForm, jar: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
                >
                  <option value="spend">Spend</option>
                  <option value="save">Save</option>
                  <option value="give">Give</option>
                </select>
              </Field>
            </div>
            <Field label="Link (optional)">
              <input
                type="url"
                value={requestForm.item_url}
                onChange={(e) => setRequestForm({ ...requestForm, item_url: e.target.value })}
                placeholder="https://"
                className="w-full px-3 py-2 rounded-xl border border-[#8E81771F] font-body text-sm bg-[#FAF7F2]"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRequest(false)}
                className="px-4 py-2 rounded-full border border-[#8E81771F] font-body text-sm text-[#6F6158]"
              >
                Cancel
              </button>
              <button
                onClick={requestPurchase}
                className="px-4 py-2 rounded-full bg-[#D9BC7A] text-white font-body text-sm"
              >
                Send for approval
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div
    className="fixed inset-0 z-50 bg-[#6F6158]/40 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-3xl p-6 w-full max-w-md border border-[#8E81771F] shadow-[0_20px_50px_rgba(111,97,88,0.18)]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-[#6F6158]">{title}</h3>
        <button onClick={onClose} className="p-1 rounded text-[#9D8C7D] hover:bg-[#FAF7F2]" aria-label="Close">
          <X size={16} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block font-body text-xs text-[#9D8C7D] mb-1">{label}</span>
    {children}
  </label>
);

export default ToroMoney;
