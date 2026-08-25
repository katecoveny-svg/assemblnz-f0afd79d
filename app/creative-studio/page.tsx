import { redirect } from "next/navigation";

/**
 * /creative-studio is the old public-maker doorway. The studio it pointed at
 * (make-with-assembl.katecoveny.chatgpt.site) has been superseded by the
 * generative studio shipping from this repo, so the doorway now leads there.
 */
export default function CreativeStudioPage() {
  redirect("/generative-studio");
}
