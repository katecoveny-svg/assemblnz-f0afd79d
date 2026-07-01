import { PageHeading } from '../_components/ui';
import { ClinicalDrafter } from './ClinicalDrafter';

export default function ClinicalPage() {
  return (
    <div>
      <PageHeading
        eyebrow="Keeper · NZCCM clinical notes"
        title="Vet clinical note drafting"
        intro="Select an animal and a note type. Keeper drafts an unsigned SOAP note for the NZCCM veterinarian — James Chatterton or a delegate — to review and sign. Drug dosing is cross-checked against VetMed NZ and AZWMP proceedings; the NZVA Code disclaimer rides on every draft."
      />
      <ClinicalDrafter />
    </div>
  );
}
