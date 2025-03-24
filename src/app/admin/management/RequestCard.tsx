'use client';

import { Card } from 'flowbite-react/components/Card';
import { acceptRequest, denyRequest } from './actions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from 'flowbite-react/components/Button';
import { useErrorNofification } from '@/hooks/query/useErrorNotification';
import { getParticipantsQueryKey } from '@/generated';

export default function RequestCard({
	participantOnboardingRequest,
}: {
	participantOnboardingRequest: any;
}) {
	const queryClient = useQueryClient();

	const { mutate: deny, isPending: isDenying } = useErrorNofification(
		useMutation,
	)({
		async mutationFn(id: string) {
			await denyRequest(id);
		},
		onSuccess(_, id) {
			queryClient.setQueriesData(
				{
					queryKey: ['participantOnboardingRequest'],
				},
				(old?: any[]) => {
					return old?.filter((r) => r.id !== id);
				},
			);
		},
	});

	const { mutate: accept, isPending: isAccepting } = useErrorNofification(
		useMutation,
	)({
		mutationFn(id: string) {
			return acceptRequest(id);
		},
		onSuccess(_, id) {
			queryClient.setQueriesData(
				{
					queryKey: ['participantOnboardingRequest'],
				},
				(old?: any[]) => {
					return old?.filter((r) => r.id !== id);
				},
			);
			queryClient.invalidateQueries({
				queryKey: getParticipantsQueryKey(),
			});
		},
	});

	return (
		<Card>
			<p>id: {participantOnboardingRequest.id}</p>
			<p>email: {participantOnboardingRequest.email}</p>
			<p>participantName: {participantOnboardingRequest.participantName}</p>
			<p>city: {participantOnboardingRequest.city}</p>
			<Button
				onClick={() => deny(participantOnboardingRequest.id)}
				disabled={isDenying || isAccepting}
			>
				Deny
			</Button>
			{participantOnboardingRequest.acceptable && (
				<Button
					onClick={() => accept(participantOnboardingRequest.id)}
					disabled={isDenying || isAccepting}
				>
					Accept
				</Button>
			)}
		</Card>
	);
}
