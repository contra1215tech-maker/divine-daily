import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { translation_id, book_id, chapter } = await req.json();

        if (!translation_id || !book_id || !chapter) {
            return Response.json({ 
                error: 'Missing required parameters: translation_id, book_id, chapter' 
            }, { status: 400 });
        }

        // Fetch chapter data from Bible API
        const url = `https://bible.helloao.org/api/${translation_id}/${book_id}/${chapter}.json`;
        const response = await fetch(url);

        if (!response.ok) {
            return Response.json({ 
                error: 'Failed to fetch chapter from Bible API' 
            }, { status: response.status });
        }

        const data = await response.json();
        return Response.json(data);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});