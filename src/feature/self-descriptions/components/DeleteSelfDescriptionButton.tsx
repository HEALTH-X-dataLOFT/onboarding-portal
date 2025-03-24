import DeleteButton from '@/components/DeleteButton';
import { SelfDescriptions, readSelfDescriptionsQueryKey } from '@/generated';
import { useErrorNofification } from '@/hooks/query/useErrorNotification';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSelfDescriptionAndCompliance } from '../actions';

export default function DeleteSelfDescriptionButton(props: {
	issuer: string;
	selfDescriptionHash: string;
}) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useErrorNofification(
		useMutation<void, Error, { selfDescriptionHash: string }>,
	)({
		mutationFn(variables) {
			return deleteSelfDescriptionAndCompliance(
				props.issuer,
				variables.selfDescriptionHash,
			);
		},
		onSuccess(data, variables) {
			queryClient.setQueriesData<SelfDescriptions>(
				{
					queryKey: readSelfDescriptionsQueryKey(),
				},
				(data) => {
					if (data == null) return data;
					return {
						totalCount:
							data.totalCount != null ? data.totalCount - 1 : data.totalCount,
						items: data.items?.filter(
							(p) => p.meta?.sdHash !== variables.selfDescriptionHash,
						),
					};
				},
			);
			queryClient.invalidateQueries({
				queryKey: readSelfDescriptionsQueryKey(),
			});
		},
	});

	return (
		<DeleteButton
			title="Are you absolutely sure?"
			description="This action cannot be undone. This will permanently delete this self description from the federated catalog."
			onDelete={() =>
				mutate({ selfDescriptionHash: props.selfDescriptionHash })
			}
			disabled={isPending}
		/>
	);
}
