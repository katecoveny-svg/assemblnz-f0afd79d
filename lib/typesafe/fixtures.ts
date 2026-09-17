import { assembleArtifact, type PilotInput, type PilotResult, type Surface } from './core';
export function pilotFixture(surface: Surface = 'pursuit'): PilotInput {
  return {
    surface, shareWithTypeSafe: false,
    intent: surface === 'studio' ? 'Prepare a Studio handoff from this pilot brief. Check the proposed claim. Do not publish anything.' : 'Prepare a Pursuit brief from this page and check the proposed claim. Do not contact anyone.',
    page: {
      title: 'Click-and-collect pilot brief · fictional retailer', url: '',
      text: 'FICTIONAL DEMO INPUT. Not a real client brief.\nCustomers contact the service desk while their collection orders are being prepared.\nThe operations team wants order progress, missing information and useful next steps in one place.\nStaff must approve anything that sends messages, changes orders or allocates rewards.\nThe proposal is a draft-only assistant that helps during the wait.\nNo measured conversion uplift or trial results are supplied.',
    },
    claim: 'This pilot has already increased conversion by 30%.',
  };
}
/** Fixed rehearsal only: never invent model probabilities, usage or latency. */
export function rehearsal(surface: Surface): PilotResult {
  const input = pilotFixture(surface);
  const action = surface === 'studio' ? 'studio_handoff' : 'prepare_brief';
  return {
    mode: 'rehearsal', evaluation: null,
    decision: {
      action, evidence: 'insufficient', needsReview: true,
      explanation: 'Scripted rehearsal: the supplied example contains no evidence for the 30% claim. No TypeSafe call was made.',
      artifact: assembleArtifact(input, action, 'insufficient', 'rehearsal'), externalActions: false, approvalRequiredBeforeExternalAction: true,
    },
    trace: { id: 'rehearsal', at: new Date().toISOString(), sourceHash: null, elapsedMs: null, attempts: 0, providerCalled: false, persisted: false, policyVersion: 'draft-only-v1', threshold: null },
  };
}
