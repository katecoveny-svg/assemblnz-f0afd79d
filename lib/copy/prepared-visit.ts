export type VisitChoice = "mobility" | "clarity" | "pickup" | "skip";
export function prepareVisit(choice: VisitChoice | null) {
  const common =
    "No booking, price, transport or collection time has been confirmed. A service adviser reviews the actual options.";
  if (choice === "mobility")
    return {
      title: "a transport question, ready.",
      reason:
        "Because you need to keep moving, the adviser brief asks about transport before the visit.",
      items: [
        "Ask which transport options, if any, are available.",
        "Confirm any eligibility, cost and return conditions with the team.",
        "Agree an arrival plan before treating the visit as booked.",
      ],
      boundary: common,
      change: "transport availability question added",
    };
  if (choice === "clarity")
    return {
      title: "the work, explained before approval.",
      reason:
        "Because you want clarity first, the brief asks for an explanation and estimate before you approve work.",
      items: [
        "Ask the team to explain the proposed work and why it is needed.",
        "Request an itemised estimate and identify what remains uncertain.",
        "Confirm the approval point before any additional work.",
      ],
      boundary: common,
      change: "explanation and approval questions added",
    };
  if (choice === "pickup")
    return {
      title: "a simpler pickup conversation.",
      reason:
        "Because you chose a simple pickup, the brief focuses on readiness and collection steps.",
      items: [
        "Ask the team how they will confirm the vehicle is ready.",
        "Check actual collection arrangements before travelling.",
        "Prepare questions about completed work and any follow-up.",
      ],
      boundary: common,
      change: "collection-readiness questions added",
    };
  return {
    title: "the ordinary checklist, ready.",
    reason:
      "You skipped the optional question. The ordinary preparation continues without an extra preference.",
    items: [
      "Confirm the appointment directly with the service team.",
      "Describe the service need and ask what to bring.",
      "Check the estimate and approval process with the adviser.",
    ],
    boundary: common,
    change: "no additional preference used",
  };
}
