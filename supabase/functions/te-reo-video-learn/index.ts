import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { chatWithGemini } from "../_shared/gemini-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MĀRAMA, an interactive Te Reo Māori learning assistant created by Assembl × Te Kāhui Reo.

Your job: Given a YouTube video transcript, generate an interactive te reo Māori learning resource.

Output a JSON object with this exact structure:
{
  "videoTitle": "string - the video's topic",
  "summary": "string - 2-3 sentence summary of the video content in English",
  "vocabulary": [
    {
      "maori": "string - te reo Māori word/phrase",
      "english": "string - English translation",
      "usage": "string - example sentence using the word in context related to the video",
      "pronunciation": "string - approximate pronunciation guide"
    }
  ],
  "sentences": [
    {
      "english": "string - sentence from the video content in English",
      "maori": "string - te reo Māori translation",
      "notes": "string - grammar or cultural notes about the translation"
    }
  ],
  "quiz": [
    {
      "question": "string - the question",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string - why this answer is correct"
    }
  ],
  "culturalContext": "string - how this topic relates to Māori culture or tikanga, if applicable"
}

Guidelines:
- Generate 8-12 vocabulary items relevant to the video's topic
- Generate 4-6 sentence translations
- Generate 4-6 quiz questions mixing vocabulary, comprehension, and translation
- Use correct tohutō (macrons) on ALL te reo Māori words (ā, ē, ī, ō, ū)
- Include common kupu (words) that would be useful for everyday conversation
- Mix difficulty levels: some basic greetings/common words, some intermediate topic-specific terms
- For cultural context, connect the video's theme to Māori worldview where possible
- Keep it warm, encouraging, and accessible for beginners

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.`;

async function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function getVideoTranscript(videoId: string): Promise<{ title: string; transcript: string }> {
  // Try to get video info via oEmbed
  const oembedResp = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
  let title = "Video";
  if (oembedResp.ok) {
    const oembed = await oembedResp.json();
    title = oembed.title || "Video";
  }

  // Try to fetch the YouTube page and extract captions
  // Since we can't reliably get transcripts without YouTube Data API,
  // we'll use the video title and ask Gemini to work with that
  // For a better experience, we try to get the page content
  let transcript = "";
  try {
    const pageResp = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Assembl/1.0)" },
    });
    if (pageResp.ok) {
      const html = await pageResp.text();
      // Try to extract description
      const descMatch = html.match(/"shortDescription":"(.*?)"/);
      if (descMatch) {
        transcript = decodeURIComponent(JSON.parse(`"${descMatch[1]}"`));
      }
      // Try to extract captions URL
      const captionsMatch = html.match(/"captionTracks":\[(.*?)\]/);
      if (captionsMatch) {
        try {
          const tracks = JSON.parse(`[${captionsMatch[1]}]`);
          const enTrack = tracks.find((t: any) => t.languageCode === "en" || t.languageCode?.startsWith("en"));
          if (enTrack?.baseUrl) {
            const captionResp = await fetch(enTrack.baseUrl);
            if (captionResp.ok) {
              const captionXml = await captionResp.text();
              // Extract text from XML captions
              const textParts = captionXml.match(/<text[^>]*>(.*?)<\/text>/g) || [];
              transcript = textParts
                .map(t => t.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
                .join(" ");
            }
          }
        } catch { /* captions parse failed, continue with description */ }
      }
    }
  } catch { /* page fetch failed */ }

  return { title, transcript: transcript || `A YouTube video titled "${title}". Generate relevant te reo Māori learning content based on this topic.` };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "YouTube URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const videoId = await extractYouTubeId(url);
    if (!videoId) {
      return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Processing video:", videoId);

    const { title, transcript } = await getVideoTranscript(videoId);
    console.log("Video title:", title, "Transcript length:", transcript.length);

    // Use Lovable AI proxy for Gemini
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const proxyResp = await fetch(`${SUPABASE_URL}/functions/v1/proxy-model`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        model: "gemini-flash",
        messages: [
          {
            role: "user",
            content: `Video Title: "${title}"\n\nVideo Content/Transcript:\n${transcript.slice(0, 8000)}\n\nGenerate an interactive te reo Māori learning resource from this video content.`,
          },
        ],
        systemPrompt: SYSTEM_PROMPT,
        temperature: 0.7,
        maxTokens: 4096,
      }),
    });

    if (!proxyResp.ok) {
      const errText = await proxyResp.text();
      console.error("Proxy error:", errText);
      return new Response(JSON.stringify({ error: "Failed to generate learning content" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // The proxy returns streaming SSE - collect the full response
    const reader = proxyResp.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) fullText += content;
        } catch { /* skip */ }
      }
    }

    // Parse the JSON response
    let learningData;
    try {
      // Strip markdown code fences if present
      let cleaned = fullText.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
      }
      learningData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse learning data:", fullText.slice(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse learning content", raw: fullText.slice(0, 200) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      videoId,
      videoTitle: title,
      data: learningData,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
