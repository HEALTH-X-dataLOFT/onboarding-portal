import UserForm, { userSchema } from './UserForm';
import { useState } from 'react';
import useZodForm from '@/hooks/useZodForm';
import { useAuthentication } from '@/hooks/query/useAuthentication';
import { getUsersQueryKey, useAddUser } from '@/generated';
import { useQueryClient } from '@tanstack/react-query';
import { useErrorNofification } from '@/hooks/query/useErrorNotification';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/auth/usePermissions';

export default function CreateUserButton() {
	const createPermittedFor = usePermissions()?.users.create.get();

	const form = useZodForm({
		schema: userSchema,
		values: {
			email: '',
			firstName: '',
			lastName: '',
			participantId: createPermittedFor?.restricted
				? createPermittedFor.participantId
				: undefined,
			roleIds: [],
		},
	});

	const queryClient = useQueryClient();

	const { isPending, mutate } = useAuthentication(
		useErrorNofification(useAddUser),
	)({
		mutation: {
			onSuccess() {
				setOpen(false);
				form.reset();

				queryClient.invalidateQueries({ queryKey: getUsersQueryKey() });
			},
		},
	});

	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Add User</Button>
			</DialogTrigger>

			<form>
				<DialogContent
					onInteractOutside={(e) => {
						e.preventDefault();
					}}
					className="sm:max-w-md"
				>
					<DialogHeader>
						<DialogTitle>Add User</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col space-y-4 h-full">
						<UserForm form={form} />
					</div>

					<DialogFooter className="sm:justify-end">
						<DialogClose asChild>
							<Button
								onClick={() => {
									form.reset();
								}}
								variant="secondary"
								disabled={isPending}
							>
								Cancel
							</Button>
						</DialogClose>
						<Button
							onClick={form.handleSubmit((user) => mutate({ data: user }))}
							disabled={isPending}
						>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
