import { getParticipantsQueryKey, Participants } from '@/generated';
import { useErrorNofification } from '@/hooks/query/useErrorNotification';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteParticipantAndDid } from '../actions';
import DeleteButton from '@/components/DeleteButton';

export default function DeleteParticipantButton(props: {
	participantId: string;
}) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useErrorNofification(
		useMutation<void, Error, { participantId: string }>,
	)({
		mutationFn(variables) {
			return deleteParticipantAndDid(variables.participantId);
		},
		onSuccess(_, variables) {
			queryClient.setQueriesData<Participants>(
				{
					queryKey: getParticipantsQueryKey(),
				},
				(data) => {
					if (data == null) return data;
					return {
						totalCount:
							data.totalCount != null ? data.totalCount - 1 : data.totalCount,
						items: data.items?.filter((p) => p.id !== variables.participantId),
					};
				},
			);
			queryClient.invalidateQueries({
				queryKey: getParticipantsQueryKey(),
			});
		},
	});

	return (
		<DeleteButton
			title="Are you absolutely sure?"
			description="This action cannot be undone. This will permanently delete the provider from the federated catalog."
			onDelete={() => mutate({ participantId: props.participantId })}
			disabled={isPending}
		/>
	);
}
