import prisma from '@/lib/prisma';
import OnboardingForm from './OnboardingForm';

export default async function Page(props: {
	params: Promise<{ requestId: string; formId: string }>;
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

	if (request == null || request.formId !== params.formId) {
		return <p>Invalid Request</p>;
	}

	return (
		<OnboardingForm
			requestId={request.id}
			formId={params.formId}
			formValues={request.form}
		/>
	);
}
