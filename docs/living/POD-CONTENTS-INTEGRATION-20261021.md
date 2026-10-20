# Pod contents integration · 21 October 2026

Objective: finish PR #1647 without changing the yellow Dayrally look, draft
catalogue, unpublished themes or purchase gate. Reuses the existing widget,
CAD scene renderer and catalogue handles; no new commerce primitive.

## Corrected illustrations

Four scenes had prop interference. Rotations, pocket-floor offsets and
render-only cable/pen orientation are corrected. Two intersecting sinkers
were removed. Manufacturing pod, lid and insert geometry is unchanged.
`check-props.py` checks all six scenes and all pairs against a 0.01 mm³
intersection threshold. This is not closed-lid or physical validation.

## Exact image mapping

| Handle | Shopify product ID | Ordered example images |
|---|---|---|
| al-pod-standard | 10359731847254 | pods-fish.jpg, pods-tech.jpg, pods-beach.jpg |
| al-pod-mini | 10359731814486 | pods-mini-earbuds.jpg |
| al-pod-tall | 10359731912790 | pods-cards.jpg |
| al-pod-long | 10359731945558 | pods-pens.jpg |

Source URLs after deployment: `https://www.assembl.co.nz/living/renders/`
plus the exact filenames above. Verify response type and bytes before Shopify
imports. Preserve older product media behind the corrected examples.

The widget adds the same examples, separate from its live choices. Captions
identify the sample insert and colour. Visible text on the storefront and
widget says contents are illustrative, not supplied, and physical fit, lid
closure and performance are untested. The supplied TURN connector keys are
not the everyday house keys pictured in the beach scene.

## Proof and release

84 digital pair checks and 51 Living tests pass. Typecheck, scoped lint,
brand and macron guards pass. The 375px storefront and embedded widget load,
show all three standard-pod examples, and preserve colour/insert interaction.
The live purchase endpoint returns HTTP 409 with no order created. GitHub/Vercel checks
must pass on the final PR head before merge. No theme publish, product
activation, checkout enablement or manufacturing approval is authorised.

Rollback: revert this correction commit; restore the recorded older Shopify
media order. Do not activate products as part of reversal.
