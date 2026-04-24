ALTER PUBLICATION supabase_realtime ADD TABLE public.toroa_child_timetables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.toroa_gear_lists;
ALTER TABLE public.toroa_child_timetables REPLICA IDENTITY FULL;
ALTER TABLE public.toroa_gear_lists REPLICA IDENTITY FULL;