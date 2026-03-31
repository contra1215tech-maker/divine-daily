import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { translation_id } = await req.json();

        if (!translation_id) {
            return Response.json({ 
                error: 'Missing required parameter: translation_id' 
            }, { status: 400 });
        }

        // Fetch books list from Bible API
        const url = `https://bible.helloao.org/api/${translation_id}/books.json`;
        const response = await fetch(url);

        if (!response.ok) {
            return Response.json({ 
                error: 'Failed to fetch books from Bible API' 
            }, { status: response.status });
        }

        const data = await response.json();
        return Response.json(data);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});