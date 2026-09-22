# Retire the old public Business Genome demo

Kate asked to remove the July-era demo from DO entry points and other public links on 22 September 2026. It described assembl as a living business OS and surfaced stale database pricing. The replacement is the existing DO product, not a new Genome landing page.

Uses the existing Next.js redirect and public catalogue mechanisms. /genome and /living-site (including public demo subpaths) redirect to /do; /install redirects to /do/install; /os redirects to /do. /pilot-sprint already redirects to /pricing in Next configuration; its dormant page now redirects too so the obsolete price cannot reappear if that config changes.

The sign-in header, 404 page, Concept Studio, admin fallback and remaining direct Genome CTAs now lead to current DO or the current company explanation. Remove Business Genome/Living Site from the demo and promotion catalogue, and remove retired routes from the sitemap. No customer or admin records, authentication policies, database rows or private /customers routes are deleted. Historical components remain in the repository for explicit later cleanup; a legacy link still encountered elsewhere lands on the redirect.

Validation: source-level review confirms redirect destinations exist and the catalogue and sign-in CTA no longer promote the old demo. Local shell execution is unavailable in this session. Build, typecheck and browser checks must be reviewed on the preview before release; no local pass is claimed. Verify GET /genome, /living-site, /living-site/dog-training, /install, /os and /pilot-sprint; confirm /do/flex and /do/install remain accessible and admin/customer access boundaries remain unchanged.

Reversal: revert this change. No database rollback is needed. Production merge is separate from this review branch.
