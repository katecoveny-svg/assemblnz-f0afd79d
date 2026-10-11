# DO messages recovery
New implementation on codex/assembl-rebuild-20261012. Uses DoProductFrame, native shareDo and meetingReminderCalendar. Creates bounded message contracts in apps/do/messages.

Eight separate conversations; literal request-line candidates; editable owners, dates and replies; private notes; explicit exact-revision sharing review; selected steps only; calendar file export; explicit local save/load and validated private JSON backups. Editing and restoring invalidate review. Native sharing is a handoff, not delivery. No inbox reading, background sender, provider account or automatic iMessage access.

This is a reconstruction; old commit tests and screenshots do not verify it. Fresh evidence is recorded in docs/recovery/20261012.md. Main integrations and server sending routes are unchanged.
