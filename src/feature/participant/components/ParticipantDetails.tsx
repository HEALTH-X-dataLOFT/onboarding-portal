import { useGetParticipantSuspense } from '@/generated';
import { useAuthentication } from '@/hooks/query/useAuthentication';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { ReactNode, Suspense } from 'react';

export default function ParticipantDetails(props: {
	participantId: string;
	children: (p: any) => ReactNode;
}) {
	return (
		<Suspense>
			<ErrorBoundary errorComponent={() => <p>Error</p>}>
				<SuspendedParticipantDetails {...props} />
			</ErrorBoundary>
		</Suspense>
	);
}

function SuspendedParticipantDetails(props: {
	participantId: string;
	children: (p: any) => ReactNode;
}) {
	const { data } = useAuthentication(useGetParticipantSuspense)(
		props.participantId,
	);

	return props.children(data);
}
