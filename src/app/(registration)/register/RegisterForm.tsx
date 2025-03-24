'use client';

import { TextInput } from 'flowbite-react/components/TextInput';
import { Label } from 'flowbite-react/components/Label';
import { Button } from 'flowbite-react/components/Button';
import useZodForm from '@/hooks/useZodForm';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { registerUser } from './actions';
import { Select, ToggleSwitch } from 'flowbite-react';
import { useErrorNofification } from '@/hooks/query/useErrorNotification';
import { NotaryUrls } from '@/lib/env';
import { Controller, useWatch } from 'react-hook-form';
import FileContent from '@/components/FileContent';

const formScheme = z.discriminatedUnion('provideLrnVc', [
	z.object({
		firstName: z.string(),
		lastName: z.string(),
		email: z.string().email(),
		participantName: z.string(),
		street: z.string(),
		zipCode: z.string(),
		city: z.string(),
		countrySubdivisionCode: z.string().regex(/[A-Z]{2}-[A-Z0-9]{1,3}/),
		provideLrnVc: z.literal(false),
		vatID: z.string().min(1),
		notaryUrl: z.string(),
	}),
	z.object({
		firstName: z.string(),
		lastName: z.string(),
		email: z.string().email(),
		participantName: z.string(),
		street: z.string(),
		zipCode: z.string(),
		city: z.string(),
		countrySubdivisionCode: z.string().regex(/[A-Z]{2}-[A-Z0-9]{1,3}/),
		provideLrnVc: z.literal(true),
		lrnVc: z.string(),
	}),
]);

export default function RegisterForm(props: { notarizationUrls: NotaryUrls }) {
	const form = useZodForm({
		schema: formScheme,
		defaultValues: {
			notaryUrl: props.notarizationUrls[0]?.url,
			provideLrnVc: false,
		},
	});

	const { mutate, isPending: pending } = useErrorNofification(useMutation)({
		mutationKey: ['register'],
		async mutationFn(variables: z.infer<typeof formScheme>) {
			const { errorMsg } = await registerUser({
				...variables,
			});
			if (errorMsg != null) {
				throw errorMsg;
			}
		},
	});

	const provideLrnVc = useWatch({
		name: 'provideLrnVc',
		control: form.control,
	});

	// const [state, formAction] = useFormState(registerUser, {});
	return (
		<form
			onSubmit={form.handleSubmit((values) => mutate(values))}
			className="flex max-w-md flex-col gap-4"
		>
			<>
				<h1>Admin User</h1>
				<div>
					<div className="mb-1 block">
						<Label htmlFor="firstname" value="First Name" />
					</div>
					<TextInput
						id="firstname"
						{...form.register('firstName')}
						required
						helperText={form.formState.errors.firstName?.message}
						disabled={pending}
					/>
				</div>
				<div>
					<div className="mb-1 block">
						<Label htmlFor="lastname" value="Last Name" />
					</div>
					<TextInput
						id="lastname"
						{...form.register('lastName')}
						required
						helperText={form.formState.errors.lastName?.message}
						disabled={pending}
					/>
				</div>
				<div>
					<div className="mb-1 block">
						<Label htmlFor="email" value="Email address" />
					</div>
					<TextInput
						id="email"
						{...form.register('email')}
						type="email"
						helperText={form.formState.errors.email?.message}
						disabled={pending}
					/>
				</div>

				<h1>Participant</h1>
				<div>
					<div className="mb-1 block">
						<Label htmlFor="name" value="Participant Name" />
					</div>
					<TextInput
						id="name"
						{...form.register('participantName')}
						helperText={form.formState.errors.participantName?.message}
						disabled={pending}
					/>
				</div>
				<div>
					<div className="mb-1 block">
						<Label htmlFor="street" value="Street" />
					</div>
					<TextInput
						id="street"
						{...form.register('street')}
						helperText={form.formState.errors.street?.message}
						disabled={pending}
					/>
				</div>
				<div>
					<div className="mb-1 block">
						<Label htmlFor="zip" value="ZIP" />
					</div>
					<TextInput
						id="zip"
						{...form.register('zipCode')}
						helperText={form.formState.errors.zipCode?.message}
						disabled={pending}
					/>
				</div>
				<div>
					<div className="mb-1 block">
						<Label htmlFor="city" value="City" />
					</div>
					<TextInput
						id="city"
						{...form.register('city')}
						helperText={form.formState.errors.city?.message}
						disabled={pending}
					/>
				</div>
				<div>
					<div className="mb-1 block">
						<Label
							htmlFor="countrySubdivisionCode"
							value="Country Subdivision Code"
						/>
					</div>
					<TextInput
						id="countrySubdivisionCode"
						{...form.register('countrySubdivisionCode')}
						placeholder="DE-BE"
						helperText={form.formState.errors.countrySubdivisionCode?.message}
						disabled={pending}
					/>
				</div>
				<Controller
					name="provideLrnVc"
					control={form.control}
					render={({ field }) => (
						<ToggleSwitch
							disabled={pending}
							label="Provide Legal Registration Number VC"
							checked={field.value ?? false}
							onChange={(e) => {
								field.onChange({
									target: {
										name: field.name,
										get value() {
											return e;
										},
									},
								});
							}}
						/>
					)}
				/>
				{provideLrnVc ? (
					<Controller
						name="lrnVc"
						control={form.control}
						render={({ field }) => (
							<FileContent
								disabled={pending}
								onChange={(e) => {
									field.onChange({
										target: {
											name: field.name,
											get value() {
												return e;
											},
										},
									});
								}}
								// @ts-expect-error discriminator is not detected
								helperText={form.formState.errors.lrnVc?.message}
							/>
						)}
					/>
				) : (
					<>
						<div>
							<div className="mb-1 block">
								<Label htmlFor="vatID" value="VAT-ID" />
							</div>
							<TextInput
								id="vatID"
								{...form.register('vatID')}
								// @ts-expect-error discriminator is not detected
								helperText={form.formState.errors.vatID?.message}
								disabled={pending}
							/>
						</div>
						{props.notarizationUrls.length > 1 && (
							<div>
								<div className="mb-1 block">
									<Label htmlFor="notaryUrl" value="VAT-ID Notary" />
								</div>
								<Select
									id="notaryUrl"
									{...form.register('notaryUrl')}
									// @ts-expect-error discriminator is not detected
									helperText={form.formState.errors.notaryUrl?.message}
									disabled={pending}
								>
									{props.notarizationUrls.map((url) => (
										<option value={url.url} key={url.url}>
											{url.label}
										</option>
									))}
								</Select>
							</div>
						)}
					</>
				)}

				{/* {state.errors && (
				<ul className="text-red-600">
					{state.errors?.map((err) => <li>{err}</li>)}
				</ul>
			)} */}
				<Button type="submit" disabled={pending}>
					Submit
				</Button>
			</>
		</form>
	);
}
