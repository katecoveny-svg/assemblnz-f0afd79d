import { PageHeading } from '../_components/ui';
import { EducationStudio } from './EducationStudio';

export default function EducationPage() {
  return (
    <div>
      <PageHeading
        eyebrow="Keeper · visitor education"
        title="Visitor-education content generator"
        intro="Pick a species and a format. Keeper drafts a meet-the-animal card, a kids activity sheet, or a social post in Auckland Zoo's public voice — for the education team to review and publish. For taonga species, any whakapapa or naming content is held for iwi consultation and never model-generated."
      />
      <EducationStudio />
    </div>
  );
}
