
CREATE TABLE public.waihanga_compliance_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz NOT NULL DEFAULT now(),

  pilot_label text,
  domain text NOT NULL DEFAULT 'waihanga',

  -- Action
  action_id text NOT NULL,
  action_kind text NOT NULL,
  action_confidence numeric,
  action_rationale text,
  action_payload jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Derived task / world context the engine saw
  world_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Evaluations
  evaluations jsonb NOT NULL DEFAULT '[]'::jsonb,
  failed_policy_ids text[] NOT NULL DEFAULT ARRAY[]::text[],

  -- Verdict
  verdict text NOT NULL,
  explanation text,
  applied boolean NOT NULL DEFAULT false,

  -- Provenance
  user_agent text,
  source_ip text,

  CONSTRAINT waihanga_compliance_audit_verdict_chk
    CHECK (verdict IN ('allow','needs_human','block'))
);

CREATE INDEX idx_waihanga_compliance_audit_created_at
  ON public.waihanga_compliance_audit (created_at DESC);
CREATE INDEX idx_waihanga_compliance_audit_verdict
  ON public.waihanga_compliance_audit (verdict);
CREATE INDEX idx_waihanga_compliance_audit_action_kind
  ON public.waihanga_compliance_audit (action_kind);
CREATE INDEX idx_waihanga_compliance_audit_failed_policies
  ON public.waihanga_compliance_audit USING GIN (failed_policy_ids);

ALTER TABLE public.waihanga_compliance_audit ENABLE ROW LEVEL SECURITY;

-- Insert: open to all (server-side edge function uses service role anyway,
-- but we also want the public demo to be able to write directly if needed).
CREATE POLICY "Anyone can insert waihanga audit rows"
  ON public.waihanga_compliance_audit
  FOR INSERT
  WITH CHECK (true);

-- Select: admins only.
CREATE POLICY "Admins can read waihanga audit rows"
  ON public.waihanga_compliance_audit
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Delete: admins only.
CREATE POLICY "Admins can delete waihanga audit rows"
  ON public.waihanga_compliance_audit
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- No UPDATE policy = audit rows are immutable.
