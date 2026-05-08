---
name: goods-management-levy
description: |
  Fires whenever a workflow needs to estimate or document the Goods
  Management Levy (GML) payable on imported goods. The GML is the
  cost-recovery levy collected by NZ Customs to fund goods-related
  services. The current rate set takes effect 1 April 2026.

  Trigger phrases / contexts: "GML", "goods management levy", "import
  levy", "customs levy", "levy calculation", "duty and levy",
  "1 April 2026 rate", "import cost recovery".
mandatory: false
applies_to: ["pikau"]
---

# Goods Management Levy — Pīkau utility skill

## When to use

- Quoting an importer the landed cost of a consignment (duty + GST +
  levies).
- Reviewing a draft entry to confirm the GML line is correct.
- Modelling the impact of a rate change (effective 1 April 2026) on
  an importer's annual cost base.
- Helping an importer understand a GML line on a Customs invoice.

## What this skill will NOT do

- File or pay the levy. The GML is collected by NZ Customs alongside
  the customs entry; lodgement is the licensed broker's task.
- Sign off the levy amount as final. The broker reviews the entry
  before lodgement and accepts liability for the levy declared.
- Provide a binding ruling on whether goods are levy-exempt. Exemption
  questions go to NZ Customs.
- Rebate or refund a levy already paid. Refund applications go through
  Customs' formal process.

## Tikanga check

No specific tikanga concern applies to the levy calculation itself.
Where the importer is a Māori entity, defer to the customs-act-2018
skill's tikanga note for the wider workflow tone.

## Privacy Act check

Levy calculation uses consignment-level data, not personal information.
Where the importer is a sole trader, apply IPP 1 minimisation when
including their identity in calculation worksheets — only the data
needed for the levy line.

## Workflow steps

### What the levy is

The Goods Management Levy is the cost-recovery levy collected by NZ
Customs to fund the systems and services that support import and
export goods clearance — Trade Single Window, intelligence, risk
assessment, and goods-related operations.

The current rate set takes effect **1 April 2026**. Use the rate
applicable on the date the goods are entered, not the date of order
or shipment. NZ Customs publishes the rate set on its cost recovery
page; check that page for the live rate before producing a final
estimate.

### Calculation pattern

For each consignment line subject to GML:

1. Confirm the goods are within scope of the levy (most commercial
   imports are; check Customs' published exemptions).
2. Apply the current rate (per-entry component and / or
   value-based component as set out in the regulations).
3. Add to the line as a separate item alongside duty and GST — do
   not bury it in the duty line.
4. Surface the rate version used (e.g. "GML rate set effective
   1 April 2026") in the worksheet so the broker can confirm.

### Worksheet output

```
Consignment:           [reference]
Entry date assumed:    [yyyy-mm-dd]
Rate set used:         GML effective 1 April 2026

  Customs value:       NZD ...
  Duty:                NZD ...
  GST (15%):           NZD ...
  GML:                 NZD ...    ← this skill's line
  Other levies:        NZD ...

  Landed cost:         NZD ...

Notes:                 GML rate sourced from <Customs URL>
                       on <date>. Broker to confirm before lodgement.
```

The broker confirms the GML amount and lodges the entry. The skill
never lodges or pays.

## References

- NZ Customs — cost recovery and levies:
  `https://www.customs.govt.nz/about-us/cost-recovery/`
- NZ Customs — fees and charges schedule:
  `https://www.customs.govt.nz/about-us/cost-recovery/fees-and-charges/`
- Customs and Excise Regulations 1996 (levy regulations):
  `https://www.legislation.govt.nz/regulation/public/1996/0232/latest/whole.html`
- Customs and Excise Act 2018 (parent statute):
  `https://www.legislation.govt.nz/act/public/2018/0004/latest/whole.html`
