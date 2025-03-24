import { NextResponse } from 'next/server';
import { didDocument } from '../didDocument';

export const dynamic = 'force-dynamic';

export async function GET() {
	return NextResponse.json(await didDocument);
}
