# Preview migration and function repair evidence

PR1600 preview project ooqwmqzyyhxsdqlxlarg reached migration20261014202527_do_voice_lease_ledger after the two historical prerequisite repairs. No production changes were made for either repair.

The subsequent Supabase check116096913619 failed in FUNCTIONS_FAILED, not migrations. workflow_run_logs at14October2026 20:49:44.579UTC named missing entrypoint supabase/functions/toroa-sms/index.ts;20:49:47 reported bundle exit1.

Inventory inspection found ten config declarations without local entrypoints. All ten were absent from the connected production function inventory on15OctoberNZDT. Remote GitHub commit evidence confirms deletion (the local checkout is shallow):

- 64363102b379c0b46bdce4da8a4ad40020cf0534 removed helm-whatsapp, sms-send, sms-webhook, toroa-sms, twilio-inbound, twilio-send, twilio-webhook and whatsapp-webhook index.ts files.
- 1f5bf66d00d1da184667325bba284171a3be56f0 removed agent-sms and helm-sms index.ts files.

Only these stale config declarations were removed. No function implementation, JWT setting of a retained function, deployed function or production environment was changed. Remaining configured entrypoints all exist; diff whitespace check passed. A fresh supported preview runner must establish successful bundling; source checks alone do not prove that gate green.
