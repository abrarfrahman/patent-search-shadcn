import { NextResponse } from 'next/server';
import db from '@/lib/db'; 

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const url = new URL(request.url);
    const patentId = url.searchParams.get('query');
    try {
        // Get everything but the IDX
        const query = 'SELECT id, country_code, kind_code, title, abstract, description, description_xml, claims, claims_xml, publication_date, filing_date, grant_date, priority_date, inventors, assignees FROM patents WHERE id = $1';
        const result = await db.query(query, [patentId]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Patent not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching patent data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
