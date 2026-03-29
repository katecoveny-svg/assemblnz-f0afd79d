CREATE TABLE public.spark_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  display_name text NOT NULL,
  html_content text NOT NULL,
  meta_description text,
  password_hash text,
  show_branding boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'live',
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.spark_apps ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX spark_apps_user_name_idx ON public.spark_apps (user_id, name);

CREATE POLICY "Users can view own spark apps" ON public.spark_apps FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spark apps" ON public.spark_apps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own spark apps" ON public.spark_apps FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own spark apps" ON public.spark_apps FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public can view live apps" ON public.spark_apps FOR SELECT TO anon USING (status = 'live');