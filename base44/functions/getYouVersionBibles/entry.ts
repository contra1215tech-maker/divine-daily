import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { language = 'en' } = await req.json().catch(() => ({}));

        const apiKey = Deno.env.get('YOUVERSION_API_KEY');
        const response = await fetch(
            `https://api.youversion.com/v1/bibles?language_ranges[]=${language}&page_size=100`,
            {
                headers: {
                    'X-YVP-App-Key': apiKey
                }
            }
        );

        if (!response.ok) {
            throw new Error(`YouVersion API error: ${response.status}`);
        }

        const data = await response.json();
        
        return Response.json({
            bibles: data.data || [],
            total: data.total_size || 0
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});