import DeleteButton from '@/components/DeleteButton';
import { getUsersQueryKey, useDeleteUser, UserProfiles } from '@/generated';
import { useAuthentication } from '@/hooks/query/useAuthentication';
import { useErrorNofification } from '@/hooks/query/useErrorNotification';
import { useQueryClient } from '@tanstack/react-query';

export default function DeleteUserButton(props: { userId: string }) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useAuthentication(
		useErrorNofification(useDeleteUser),
	)({
		mutation: {
			onSuccess(data, variables) {
				queryClient.setQueriesData<UserProfiles>(
					{
						queryKey: getUsersQueryKey(),
					},
					(data) => {
						if (data == null) return data;
						return {
							totalCount:
								data.totalCount != null ? data.totalCount - 1 : data.totalCount,
							items: data.items?.filter((p) => p.id !== variables.userId),
						};
					},
				);
				queryClient.invalidateQueries({
					queryKey: getUsersQueryKey(),
				});
			},
		},
	});

	return (
		<DeleteButton
			title="Are you absolutely sure?"
			description="This action cannot be undone. This will permanently remove this user."
			onDelete={() => mutate({ userId: props.userId })}
			disabled={isPending}
		/>
	);
}
