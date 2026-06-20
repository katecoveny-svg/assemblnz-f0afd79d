import { DashDogMark } from '@/components/dash/DashDogMark';

/**
 * The three parametric dachshunds from the brand kit — Pup, Classic, Stretch —
 * differing only in how many grooves segment the body, each in a palette coat.
 */
const DOGS = [
  { name: 'Pup', segments: 3, coat: '#A6BA9E', groove: '#8DA382', note: 'Three segments. Short waits and tight spaces.' },
  { name: 'Classic', segments: 5, coat: '#A6BA9E', groove: '#8DA382', note: 'The default mark. Five segments fill as it loads.' },
  { name: 'Stretch', segments: 7, coat: '#C2D0B8', groove: '#94a98a', note: 'Seven segments for a longer, slower wait.' },
] as const;

export function DashDogVariations() {
  return (
    <div className="dogs">
      {DOGS.map((d) => (
        <div key={d.name} className="dogCard">
          <div className="frame">
            <DashDogMark segments={d.segments} coat={d.coat} groove={d.groove} />
          </div>
          <h4>{d.name}</h4>
          <p>{d.note}</p>
        </div>
      ))}
    </div>
  );
}
