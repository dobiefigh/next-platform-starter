import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

export async function POST(request) {
    const { prompt, mode } = await request.json();

    if (!prompt?.trim()) {
        return new Response(JSON.stringify({ error: 'Prompt is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const systemPrompts = {
        chat: 'You are a helpful, knowledgeable assistant. Be concise but thorough.',
        code: 'You are an expert software engineer. When writing code, always use markdown code blocks with the appropriate language. Explain your code clearly.',
        creative:
            'You are a creative writer with a flair for vivid, engaging prose. Be imaginative and expressive.'
    };

    const system = systemPrompts[mode] || systemPrompts.chat;

    const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        thinking: { type: 'adaptive' },
        system,
        messages: [{ role: 'user', content: prompt }]
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
        async start(controller) {
            try {
                for await (const event of stream) {
                    if (
                        event.type === 'content_block_delta' &&
                        event.delta.type === 'text_delta'
                    ) {
                        controller.enqueue(encoder.encode(event.delta.text));
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        }
    });

    return new Response(readableStream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'X-Content-Type-Options': 'nosniff'
        }
    });
}
