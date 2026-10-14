// No grant provider is connected. Fail closed even for guessed valid IDs,
// signed-in owners, copied URLs and migration fixtures. No production read.
export async function GET() {
  return Response.json({ error: 'Recipient access is not activated.' }, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
}
