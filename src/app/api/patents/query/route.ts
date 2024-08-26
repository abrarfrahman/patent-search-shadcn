import { NextResponse } from 'next/server';
import db from '@/lib/db.js';

// Route to handle full-text search
export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const result = await db.query(
      `SELECT 
        id, 
        title, 
        abstract, 
        priority_date, 
        array_to_string(array_agg(DISTINCT inventors), ', ') AS inventors,
        array_to_string(array_agg(DISTINCT assignees), ', ') AS assignees
      FROM patents
      WHERE document_tsv @@ to_tsquery($1)
      GROUP BY id, title, abstract, priority_date
      LIMIT 10;`,
      [query + ':*']
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({ error: 'Error executing search query' }, { status: 500 });
  }
}
