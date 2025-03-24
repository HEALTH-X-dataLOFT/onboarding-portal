export const dynamic = 'force-dynamic';

export async function GET() {
	return new Response(
		process.env.PORTAL_CERT + process.env.LETS_ENCRYPT_ROOT_CERTIFICATE,
	);
}
