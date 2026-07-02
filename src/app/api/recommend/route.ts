import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const aggregated = body.aggregated ?? body;

    const prompt = `現在の集計データ: ${JSON.stringify(aggregated)}\nこれらの条件から、今この瞬間最適なスポットを3件提案してください。各スポットは以下のJSON形式で返してください。\n{ "spots": [ { "name": "", "category": "", "reason": "", "comfort_score": 0, "distance": "", "instagram_url": "" } ] }`;

    const enableGemini = (process.env.ENABLE_GEMINI || 'false') === 'true';
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!enableGemini || !geminiKey) {
      // LLM disabled or key missing: return prompt (so user can add key later)
      return NextResponse.json({ ok: true, enabled: false, prompt });
    }

    // Call Gemini (generic HTTP interface). Configure GEMINI_API_URL if necessary.
    const geminiUrl = process.env.GEMINI_API_URL || 'https://api.generative.example/v1/generate';

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${geminiKey}`
      },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ ok: false, error: `LLM request failed: ${res.status} ${txt}` }, { status: 502 });
    }

    const llmResponse = await res.json();

    // Try to extract text content from common response shapes
    function extractText(obj: any): string | null {
      if (!obj) return null;
      if (typeof obj === 'string') return obj;
      if (obj.output_text) return obj.output_text;
      if (obj.output && Array.isArray(obj.output) && obj.output[0]?.content) {
        // e.g. { output: [{ content: [{ type: 'output_text', text: '...' }] }] }
        const c = obj.output[0].content[0];
        return c?.text || c?.payload || null;
      }
      if (obj.choices && Array.isArray(obj.choices)) {
        const first = obj.choices[0];
        if (first.message && first.message.content) return first.message.content;
        if (first.text) return first.text;
      }
      // search nested for strings
      const jsonString = JSON.stringify(obj);
      return jsonString;
    }

    const rawText = extractText(llmResponse) || '';

    // Try to parse JSON from the LLM text. Find first JSON object or array in text.
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      // attempt to extract JSON substring
      const m = rawText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch (e2) {
          parsed = null;
        }
      }
    }

    if (parsed) {
      return NextResponse.json({ ok: true, enabled: true, parsed });
    }

    // Fallback: return raw text
    return NextResponse.json({ ok: true, enabled: true, raw: rawText, llm: llmResponse });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 400 });
  }
}
