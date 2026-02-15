import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bible_id } = await req.json();

        if (!bible_id) {
            return Response.json({ error: 'bible_id is required' }, { status: 400 });
        }

        const apiKey = Deno.env.get('YOUVERSION_API_KEY');
        const response = await fetch(
            `https://api.youversion.com/v1/bibles/${bible_id}/books`,
            {
                headers: {
                    'X-YVP-App-Key': apiKey
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('YouVersion API error:', response.status, errorText);
            throw new Error(`YouVersion API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        return Response.json({ books: data.data || [] });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});