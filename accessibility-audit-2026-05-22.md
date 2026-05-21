# Accessibility Audit — 2026-05-22

Scope: flagship public pages required for the Public Assembly foundation PR.

Method: Lighthouse accessibility category, first against live production, then against the local branch after fixes. JSON evidence is stored under `screenshots/lighthouse-2026-05-22/` and `screenshots/lighthouse-2026-05-22-after/`.

| Page | Live score | Branch score | Result |
| --- | ---: | ---: | --- |
| Home | 95 | 100 | Fixed low-contrast animated/home status text and footer heading order |
| `/kete/pikau` | 95 | 100 | Fixed Pīkau accent contrast and footer heading order |
| `/c/pikau` | 98 | 100 | Fixed footer heading order |
| `/pricing` | 98 | 100 | Fixed footer heading order |
| `/hapai/meeting-recorder` | 90 | 100 | Added accessible record-button label, increased placeholder contrast, fixed footer heading order |

## Fixes Applied

- Added accessible names to icon-only recording controls.
- Increased muted text contrast where text is functional rather than decorative.
- Darkened Pīkau and Arataki accents where those colours are used as foreground text or action backgrounds.
- Corrected footer heading hierarchy so section labels no longer skip from the page structure into `h4`.
- Reduced Lighthouse false positives from animated hero text by avoiding low-opacity text during initial render.

## Residual Risk

The audit did not review every route in the site. It covers the five requested flagship pages and should be repeated after the HAPAI rebuild and homepage visual reset, because those tasks will intentionally change page structure and motion.
