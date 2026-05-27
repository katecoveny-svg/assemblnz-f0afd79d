import { notFound } from "next/navigation";
import { getWorkflow } from "@/lib/workflows";

type Params = { slug: string };

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const workflow = getWorkflow(slug);
  if (!workflow) notFound();

  const name = `${workflow.title} · assembl`;
  return Response.json(
    {
      name,
      short_name: workflow.title.slice(0, 28).trim(),
      description: workflow.description,
      id: `/w/${workflow.slug}`,
      start_url: `/w/${workflow.slug}`,
      scope: `/w/${workflow.slug}`,
      display: "standalone",
      display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
      background_color: "#FAF7F2",
      theme_color: "#2B6B57",
      categories: ["productivity", "business", "education"],
      icons: [
        {
          src: "/icons/assembl-icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/icons/assembl-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}
