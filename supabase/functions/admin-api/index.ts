import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminEmail = Deno.env.get("ADMIN_EMAIL")!;

    // Verify the caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { action, ...params } = await req.json();

    // Allow ensure_admin_role to bypass admin check (bootstrap flow)
    if (action === "ensure_admin_role") {
      console.log("ensure_admin_role: user email =", user.email, "admin email =", adminEmail, "match =", user.email === adminEmail);
      if (user.email?.toLowerCase().trim() !== adminEmail?.toLowerCase().trim()) {
        console.log("Admin email mismatch - rejecting");
        return new Response(JSON.stringify({ error: "Not admin email" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: existingAdmin } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();
      if (!existingAdmin) {
        await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
      }
      return new Response(JSON.stringify({ success: true, role: "admin" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All other actions require admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (action) {
      case "get_metrics": {
        // Total users
const { data: usersListData } = await supabase.auth.admin.listUsers({ perPage: 1 });
        const totalUsers = usersListData?.users?.length ?? 0;
        
        // Get all users for subscriber count
        const { data: allUsersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const allUserIds = allUsersData?.users?.map(u => u.id) || [];
        
        // Paid subscribers
        const { data: paidRoles } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("role", ["starter", "pro", "business"]);
        const paidCount = paidRoles?.length || 0;
        
        // MRR calculation
        const planPrices: Record<string, number> = { starter: 29, pro: 79, business: 199 };
        const mrr = (paidRoles || []).reduce((sum, r) => sum + (planPrices[r.role] || 0), 0);

        // Messages today
        const today = new Date().toISOString().split("T")[0];
        const { data: todayMsgs } = await supabase
          .from("daily_messages")
          .select("message_count")
          .eq("message_date", today);
        const messagesToday = (todayMsgs || []).reduce((s, r) => s + r.message_count, 0);

        // Messages this month
        const monthStart = new Date();
        monthStart.setDate(1);
        const { data: monthMsgs } = await supabase
          .from("daily_messages")
          .select("message_count")
          .gte("message_date", monthStart.toISOString().split("T")[0]);
        const messagesMonth = (monthMsgs || []).reduce((s, r) => s + r.message_count, 0);

        return new Response(JSON.stringify({
          totalUsers: totalUsers || 0,
          messagesToday,
          messagesMonth,
          paidSubscribers: paidCount,
          mrr,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "get_users": {
        const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 500 });
        const users = usersData?.users || [];
        
        // Get all roles
        const { data: roles } = await supabase.from("user_roles").select("user_id, role");
        const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));
        
        // Get all profiles
        const { data: profiles } = await supabase.from("profiles").select("id, full_name");
        const profileMap = new Map((profiles || []).map(p => [p.id, p.full_name]));
        
        // Get message counts
        const { data: msgCounts } = await supabase
          .from("daily_messages")
          .select("user_id, message_count");
        const msgMap = new Map<string, number>();
        (msgCounts || []).forEach(m => {
          msgMap.set(m.user_id, (msgMap.get(m.user_id) || 0) + m.message_count);
        });

        const userList = users.map(u => ({
          id: u.id,
          email: u.email,
          name: profileMap.get(u.id) || u.user_metadata?.full_name || "",
          role: roleMap.get(u.id) || "free",
          createdAt: u.created_at,
          totalMessages: msgMap.get(u.id) || 0,
        }));

        return new Response(JSON.stringify(userList), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_user_role": {
        const { userId, newRole } = params;
        // Upsert the role
        const { data: existing } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", userId)
          .single();
        
        if (existing) {
          await supabase.from("user_roles").update({ role: newRole }).eq("user_id", userId);
        } else {
          await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
        }
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete_user": {
        const { userId } = params;
        await supabase.auth.admin.deleteUser(userId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "toggle_agent": {
        const { agentId, isOnline } = params;
        await supabase
          .from("agent_status")
          .update({ is_online: isOnline, updated_at: new Date().toISOString() })
          .eq("agent_id", agentId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_agent_status": {
        const { data } = await supabase.from("agent_status").select("*");
        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_activity_feed": {
        const { data } = await supabase
          .from("message_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_contact_submissions": {
        const { data } = await supabase
          .from("contact_submissions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "mark_submission_read": {
        const { submissionId, isRead } = params;
        await supabase
          .from("contact_submissions")
          .update({ is_read: isRead })
          .eq("id", submissionId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete_submission": {
        const { submissionId } = params;
        await supabase
          .from("contact_submissions")
          .delete()
          .eq("id", submissionId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_pipeline_audit_logs": {
        const { data } = await supabase
          .from("pipeline_audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(params.limit || 200);
        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_evidence_packs": {
        const { data } = await supabase
          .from("evidence_packs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(params.limit || 100);
        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_explanation_objects": {
        const { data } = await supabase
          .from("explanation_objects")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(params.limit || 200);
        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_approval_queue": {
        const statusFilter = params.status || null;
        let query = supabase
          .from("approval_queue")
          .select("*")
          .order("requested_at", { ascending: false })
          .limit(params.limit || 100);
        if (statusFilter) query = query.eq("status", statusFilter);
        const { data } = await query;
        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_aaaip_exports": {
        const { data } = await supabase
          .from("aaaip_audit_exports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(params.limit || 100);
        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "approve_queue_item": {
        const { itemId, reason } = params;
        await supabase
          .from("approval_queue")
          .update({ status: "approved", approved_by: user.id, decided_at: new Date().toISOString(), decision_reason: reason || "Approved by admin" })
          .eq("id", itemId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "reject_queue_item": {
        const { itemId, reason } = params;
        await supabase
          .from("approval_queue")
          .update({ status: "rejected", approved_by: user.id, decided_at: new Date().toISOString(), decision_reason: reason || "Rejected by admin" })
          .eq("id", itemId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "sign_evidence_pack": {
        const { packId } = params;
        await supabase
          .from("evidence_packs")
          .update({ signed_by: user.id, signed_at: new Date().toISOString() })
          .eq("id", packId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_pipeline_summary": {
        const [auditRes, approvalRes, evidenceRes, exportsRes] = await Promise.all([
          supabase.from("pipeline_audit_logs").select("id", { count: "exact", head: true }),
          supabase.from("approval_queue").select("id, status"),
          supabase.from("evidence_packs").select("id, signed_by", { count: "exact" }),
          supabase.from("aaaip_audit_exports").select("id", { count: "exact", head: true }),
        ]);
        const approvals = approvalRes.data || [];
        const pending = approvals.filter(a => a.status === "pending").length;
        const approved = approvals.filter(a => a.status === "approved").length;
        const rejected = approvals.filter(a => a.status === "rejected").length;
        const evidencePacks = evidenceRes.data || [];
        const signed = evidencePacks.filter(e => e.signed_by).length;
        return new Response(JSON.stringify({
          totalAuditLogs: auditRes.count || 0,
          approvals: { total: approvals.length, pending, approved, rejected },
          evidencePacks: { total: evidenceRes.count || 0, signed, unsigned: (evidenceRes.count || 0) - signed },
          totalExports: exportsRes.count || 0,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("Admin API error:", err);
    const errMsg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
