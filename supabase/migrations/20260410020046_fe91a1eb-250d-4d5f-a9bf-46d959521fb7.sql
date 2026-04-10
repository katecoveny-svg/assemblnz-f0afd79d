-- Add relevant_acts column
ALTER TABLE public.workflow_templates
ADD COLUMN relevant_acts text[] NOT NULL DEFAULT '{}';

-- Populate existing workflows with appropriate legislation
UPDATE public.workflow_templates SET relevant_acts = ARRAY['Employment Relations Act 2000', 'Holidays Act 2003', 'Privacy Act 2020'] WHERE name = 'New Employee Onboarding';
UPDATE public.workflow_templates SET relevant_acts = ARRAY['Residential Tenancies Act 1986', 'Privacy Act 2020'] WHERE name = 'Property Acquired';
UPDATE public.workflow_templates SET relevant_acts = ARRAY['Construction Contracts Act 2002', 'Health and Safety at Work Act 2015'] WHERE name = 'Tender Won';
UPDATE public.workflow_templates SET relevant_acts = ARRAY['Fair Trading Act 1986', 'Privacy Act 2020'] WHERE name = 'Deal Closed';
UPDATE public.workflow_templates SET relevant_acts = ARRAY['Privacy Act 2020', 'Unsolicited Electronic Messages Act 2007'] WHERE name = 'Website Inquiry';
UPDATE public.workflow_templates SET relevant_acts = ARRAY['Financial Reporting Act 2013', 'Privacy Act 2020'] WHERE name = 'Monthly Business Review';
UPDATE public.workflow_templates SET relevant_acts = ARRAY['Health and Safety at Work Act 2015', 'Privacy Act 2020'] WHERE name = 'Compliance Alert';
UPDATE public.workflow_templates SET relevant_acts = ARRAY['Fair Trading Act 1986', 'Construction Contracts Act 2002'] WHERE name = 'Quote Requested';
UPDATE public.workflow_templates SET relevant_acts = ARRAY['Employment Relations Act 2000', 'Holidays Act 2003'] WHERE name = 'Roster Shift Gap';
UPDATE public.workflow_templates SET relevant_acts = ARRAY['Health and Safety at Work Act 2015', 'WorkSafe NZ Regulations 2016'] WHERE name = 'Site Induction';
UPDATE public.workflow_templates SET relevant_acts = ARRAY['Construction Contracts Act 2002'] WHERE name = 'Payment Claim';
UPDATE public.workflow_templates SET relevant_acts = ARRAY['Customs and Excise Act 2018', 'Biosecurity Act 1993'] WHERE name = 'Customs Entry';
UPDATE public.workflow_templates SET relevant_acts = ARRAY['Building Act 2004', 'Resource Management Act 1991'] WHERE name = 'Building Consent';