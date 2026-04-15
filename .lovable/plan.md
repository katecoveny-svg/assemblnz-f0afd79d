
# Admin Dashboard Overhaul — Assembl Command Centre

## Problem
The current admin dashboard is a single 809-line page with tabs that don't provide easy access to agents, production tools, or saved outputs. Need to produce real outputs (images, copy, ads) inline and have everything saved centrally.

## Architecture

### 1. New sidebar-based Admin layout (`/admin/dashboard`)
Replace the current tab-based layout with a persistent sidebar containing:

**Operations**
- Overview (current metrics dashboard)
- Activity feed
- Health monitoring

**Agents**
- Agent Directory — grid of all 46 agents with status, kete badge, and "Chat" / "Test" buttons
- Agent Testing Lab (existing)
- Test Results (existing)

**Production**
- Creative Studio (inline — reuse AuahaGenerate)
- Ad Manager (inline — reuse AuahaAdManager)
- Copy Studio (inline — reuse AuahaCopyStudio)

**Outputs**
- Output Library — all generated assets from `creative_assets`, `ad_creatives`, `content_items` tables
- Evidence Packs

**System**
- Users & Roles, Leads, Compliance, Knowledge Base, Messaging, SMS

### 2. Files to create/modify
- `src/pages/AdminDashboard.tsx` — rewrite with sidebar layout
- `src/components/admin/AdminSidebar.tsx` — new sidebar
- `src/components/admin/AdminAgentDirectory.tsx` — agent grid
- `src/components/admin/AdminOutputLibrary.tsx` — output browser
