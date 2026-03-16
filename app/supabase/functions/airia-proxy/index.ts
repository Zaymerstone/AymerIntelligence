import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AIRIA_API_KEY = Deno.env.get("AIRIA_API_KEY")!;

const PIPELINES = {
  researcher: Deno.env.get("AIRIA_PIPELINE_RESEARCHER")!,
  analyst: Deno.env.get("AIRIA_PIPELINE_ANALYST")!,
  reporter: Deno.env.get("AIRIA_PIPELINE_REPORTER")!,
  chartExtractor: Deno.env.get("AIRIA_PIPELINE_CHART_EXTRACTOR")!,
};

async function callAiria(url: string, userInput: string): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-API-KEY": AIRIA_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userInput, asyncOutput: false }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airia API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  // Airia may return the result under various keys
  return (
    data.result ||
    data.output ||
    data.response ||
    data.text ||
    JSON.stringify(data)
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userInput, step } = await req.json();

    if (!userInput || typeof userInput !== "string") {
      return new Response(JSON.stringify({ error: "userInput is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If a specific step is requested, run just that one
    if (step && PIPELINES[step as keyof typeof PIPELINES]) {
      const output = await callAiria(
        PIPELINES[step as keyof typeof PIPELINES],
        userInput,
      );
      return new Response(JSON.stringify({ output, step }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: run entire chain
    const researcherOutput = await callAiria(PIPELINES.researcher, userInput);
    const analystOutput = await callAiria(PIPELINES.analyst, researcherOutput);
    const reporterOutput = await callAiria(PIPELINES.reporter, analystOutput);

    return new Response(
      JSON.stringify({
        researcher: researcherOutput,
        analyst: analystOutput,
        reporter: reporterOutput,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("airia-proxy error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
