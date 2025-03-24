import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

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
	return new Response(did.certificate);
}
