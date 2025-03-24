import SignInButton from '@/layout/SignInButton';
import prisma from '@/lib/prisma';

export default async function Page(props: {
	params: Promise<{ requestId: string }>;
}) {
	const params = await props.params;

	const request = await prisma.participantOnboardingRequest.findUnique({
		where: {
			id: params.requestId,
		},
		include: {
			form: true,
		},
	});

	if (request == null) {
		return (
			<div>
				<p>Please sign in...</p>
				<SignInButton />
			</div>
		);
	}

	if (!request.emailVerified) {
		return (
			<div>
				<p>
					Please confirm your mail adress (or open{' '}
					<a
						href={`/onboard/${request.id}/${request.form.id}`}
						className="underline text-blue-700"
					>
						this link
					</a>
					)
				</p>
			</div>
		);
	}

	return (
		<div>
			<p>Waiting for approval from federator</p>
		</div>
	);
}
