import { z } from 'zod';
import ParticipantSelect from '../../participant/components/ParticipantSelect';
import { Label, TextInput } from 'flowbite-react';
import { Controller, UseFormReturn } from 'react-hook-form';
import UserRoleSelect from './UserRoleSelect';
import { usePermissions } from '@/hooks/auth/usePermissions';

export const userSchema = z.object({
	participantId: z.string(),
	firstName: z.string().min(1, 'Required'),
	lastName: z.string().min(1, 'Required'),
	email: z.string().email(),
	roleIds: z.array(z.string()),
});

export default function UserForm(props: {
	form: UseFormReturn<
		Partial<{
			participantId: string;
			firstName: string;
			lastName: string;
			email: string;
			roleIds: string[];
		}>,
		any,
		{
			participantId: string;
			firstName: string;
			lastName: string;
			email: string;
			roleIds: string[];
		}
	>;
}) {
	const form = props.form;
	const errors = form.formState.errors;

	const createPermittedFor = usePermissions()?.users.create.get();

	return (
		<>
			<div>
				<div className="mb-1 block">
					<Label htmlFor="participantId" value="Participant" />
				</div>
				<Controller
					name="participantId"
					control={form.control}
					rules={{ required: true }}
					render={({ field }) => (
						<ParticipantSelect
							value={field.value}
							onChange={(e) => form.setValue('participantId', e ?? undefined)}
							color={errors.participantId != null ? 'failure' : undefined}
							helperText={errors.participantId?.message}
							disabled={createPermittedFor?.restricted}
						/>
					)}
				/>
			</div>
			<div>
				<div className="mb-1 block">
					<Label htmlFor="firstname" value="First Name" />
				</div>
				<TextInput
					defaultValue=""
					{...form.register('firstName')}
					color={errors.firstName != null ? 'failure' : undefined}
					helperText={errors.firstName?.message}
				/>
			</div>
			<div>
				<div className="mb-1 block">
					<Label htmlFor="lastName" value="Last Name" />
				</div>
				<TextInput
					defaultValue=""
					{...form.register('lastName')}
					color={errors.lastName != null ? 'failure' : undefined}
					helperText={errors.lastName?.message}
				/>
			</div>
			<div>
				<div className="mb-1 block">
					<Label htmlFor="email" value="Email" />
				</div>
				<TextInput
					defaultValue=""
					{...form.register('email')}
					color={errors.email != null ? 'failure' : undefined}
					helperText={errors.email?.message}
				/>
			</div>
			<div>
				<div className="mb-1 block">
					<Label htmlFor="roleIds" value="Role" />
				</div>
				<Controller
					name="roleIds"
					control={form.control}
					rules={{ required: true }}
					render={({ field }) => (
						<UserRoleSelect
							value={field.value?.[0]}
							onChange={(e) => form.setValue('roleIds', e == null ? [] : [e])}
							color={errors.roleIds != null ? 'failure' : undefined}
							helperText={errors.roleIds?.message}
						/>
					)}
				/>
			</div>
		</>
	);
}
