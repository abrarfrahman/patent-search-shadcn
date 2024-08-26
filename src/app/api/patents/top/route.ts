import { NextResponse } from 'next/server';
import db from '@/lib/db.js';

// Route to handle getting the top 10 patents
export async function GET(request: Request) {
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
      GROUP BY id, title, abstract, priority_date
      LIMIT 10;`,
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({ error: 'Error executing top10 query' }, { status: 500 });
  }
}
