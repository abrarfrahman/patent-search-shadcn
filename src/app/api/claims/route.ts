import { NextResponse } from 'next/server';
import db from '@/lib/db.js'; 
import { parseClaimsXml } from '@/lib/xmlParser';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Patent ID is required' }, { status: 400 });
  }

  try {
    const result = await db.query('SELECT claims_xml FROM patents WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Patent not found' }, { status: 404 });
    }

    // Parse XML here
    const claimsXml = result.rows[0].claims_xml;
    const claims = await parseClaimsXml(claimsXml);

    return NextResponse.json(claims);
  } catch (error) {
    console.error('Error fetching claims data:', error);
    return NextResponse.json({ error: 'Error fetching claims data' }, { status: 500 });
  }
}
