import { NextResponse } from 'next/server';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

export async function GET(
	request: Request,
	props: { params: Promise<{ id: string }> },
) {
	const params = await props.params;
	const did = await prisma.did.findUnique({
		where: {
			id: params.id,
		},
	});
	if (did == null) {
		return notFound();
	}
	return NextResponse.json(JSON.parse(did.did));
}
