import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query } = await req.json();

        if (!query || query.trim().length < 2) {
            return Response.json({ 
                error: 'Search query must be at least 2 characters' 
            }, { status: 400 });
        }

        // Search using BSB translation
        const translationId = 'BSB';
        const searchQuery = query.toLowerCase();

        // Fetch all books first
        const booksResponse = await fetch(`https://bible.helloao.org/api/${translationId}/books.json`);
        if (!booksResponse.ok) {
            return Response.json({ error: 'Failed to fetch books' }, { status: 500 });
        }
        const booksData = await booksResponse.json();
        const books = booksData.books || [];

        // Search through verses - we'll sample chapters to keep response time reasonable
        const results = [];
        const maxResults = 50;

        // Search through a selection of books and chapters
        for (const book of books) {
            if (results.length >= maxResults) break;

            // Sample chapters (first, middle, last for each book)
            const chaptersToCheck = [
                1,
                Math.floor(book.numberOfChapters / 2),
                book.numberOfChapters
            ].filter((ch, idx, arr) => arr.indexOf(ch) === idx); // Remove duplicates

            for (const chapterNum of chaptersToCheck) {
                if (results.length >= maxResults) break;

                try {
                    const chapterResponse = await fetch(
                        `https://bible.helloao.org/api/${translationId}/${book.id}/${chapterNum}.json`
                    );
                    
                    if (chapterResponse.ok) {
                        const chapterData = await chapterResponse.json();
                        const verses = chapterData.chapter?.content?.filter(item => item.type === 'verse') || [];

                        for (const verse of verses) {
                            const verseText = Array.isArray(verse.content)
                                ? verse.content.map(item => typeof item === 'string' ? item : item.text || '').join(' ')
                                : verse.content;

                            // Fuzzy search: check if verse contains any of the search words
                            const searchWords = searchQuery.split(' ').filter(w => w.length > 2);
                            const verseTextLower = verseText.toLowerCase();
                            
                            const hasMatch = searchWords.some(word => verseTextLower.includes(word));

                            if (hasMatch) {
                                results.push({
                                    book_name: book.name,
                                    book_id: book.id,
                                    chapter: chapterNum,
                                    verse_number: verse.number,
                                    reference: `${book.name} ${chapterNum}:${verse.number}`,
                                    text: verseText,
                                    relevance: searchWords.filter(word => verseTextLower.includes(word)).length
                                });

                                if (results.length >= maxResults) break;
                            }
                        }
                    }
                } catch (error) {
                    // Skip failed chapters
                    continue;
                }
            }
        }

        // Sort by relevance
        results.sort((a, b) => b.relevance - a.relevance);

        return Response.json({ results });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});