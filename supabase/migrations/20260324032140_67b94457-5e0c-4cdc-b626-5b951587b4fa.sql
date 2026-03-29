
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sensor_id TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  location_label TEXT,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  alert_triggered BOOLEAN DEFAULT false,
  alert_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own sensor readings"
    ON sensor_readings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS sensor_thresholds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sensor_type TEXT NOT NULL,
  location_label TEXT,
  min_value NUMERIC,
  max_value NUMERIC,
  alert_agent TEXT,
  alert_message_template TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sensor_thresholds ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own sensor thresholds"
    ON sensor_thresholds FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
