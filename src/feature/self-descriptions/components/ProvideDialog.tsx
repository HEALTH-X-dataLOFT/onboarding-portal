'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Editor } from '@monaco-editor/react';
import ParticipantSelect from '../../participant/components/ParticipantSelect';
import { provideSelfDescriptions } from '../actions';
import { useErrorNofification } from '@/hooks/query/useErrorNotification';
import { readSelfDescriptionsQueryKey } from '@/generated';
import { usePermissions } from '@/hooks/auth/usePermissions';
import useZodForm from '@/hooks/useZodForm';
import { z } from 'zod';
import { Controller, useWatch } from 'react-hook-form';
import FileContent from '@/components/FileContent';
import { documentLoaders } from 'jsonld';
import { JsonWebSignature2020Signer } from '@gaia-x/json-web-signature-2020';
import { Signer } from '@gaia-x/json-web-signature-2020/dist/src/signer/signer';
import { importPrivateKey, pkcs1to8 } from '@/utils/privateKey';
import { packIntoVP, signVc } from '@/utils/verifiableCredentials';
import { useSessionData } from '@/hooks/auth/useSessionData';
import { getTemplateValuesForIssuer, renderTemplate } from '@/utils/templates';
import {
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label, Select, TextInput } from 'flowbite-react';
import { useEffect } from 'react';
import { templates } from '../templates';

export default function ParticipantModal(props: {
	catalogURL: string;
	onSuccess(): void;
}) {
	// Mutation
	const queryClient = useQueryClient();

	const session = useSessionData();

	const { mutate, isPending: isMutating } = useErrorNofification(useMutation)({
		async mutationFn(variables: {
			issuer: string;
			privateKey: string;
			templateId: string;
			values: Record<string, string>;
		}) {
			const { template } =
				templates[variables.templateId as keyof typeof templates];
			const values = Object.assign(
				{},
				variables.values,
				await getTemplateValuesForIssuer(
					props.catalogURL,
					variables.issuer,
					session,
				),
			);
			const VCs = renderTemplate(template, values);

			const signer: Signer = new JsonWebSignature2020Signer({
				privateKey: await importPrivateKey(pkcs1to8(variables.privateKey!)),
				privateKeyAlg: 'RS256',
				documentLoader: documentLoaders.xhr(),
				verificationMethod: `${variables.issuer}#X509-JWK2020`,
			});
			const issuanceDate = new Date().toISOString();
			return provideSelfDescriptions(
				variables.issuer,
				JSON.stringify(
					await signVc(packIntoVP(VCs), signer, issuanceDate),
					null,
					2,
				),
			);
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: readSelfDescriptionsQueryKey(),
			});
			props.onSuccess();
		},
	});

	// Form handling
	const createPermittedFor = usePermissions()?.selfDescriptions.create.get();

	const form = useZodForm({
		schema: z.object({
			issuer: z.string(),
			privateKey: z.string(),
			templateId: z.string(),
			values: z.record(z.string(), z.string()),
		}),
		values: {
			privateKey: undefined,
			issuer: createPermittedFor?.restricted
				? createPermittedFor.participantId
				: undefined,
		},
	});
	const submittable = form.formState.isValid && !form.formState.isValidating;

	// const submittable = form.formState.isValid && !form.formState.isValidating;

	const issuer = useWatch({
		control: form.control,
		name: 'issuer',
	});

	const templateId = useWatch({
		control: form.control,
		name: 'templateId',
	}) as keyof typeof templates;

	const template = templateId ? templates[templateId] : null;

	useEffect(() => {
		if (template) {
			form.setValue(
				'values',
				Object.fromEntries(
					Object.entries(template.input).map(
						([label, field]) => [label, field.default] as const,
					),
				),
			);
		}
	}, [template, form]);

	// Rendering
	return (
		<form>
			<DialogContent
				onInteractOutside={(e) => {
					e.preventDefault();
				}}
				className="sm:max-w-md min-w-full md:min-w-[80%]"
			>
				<DialogHeader>
					<DialogTitle>Self Description</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col space-y-4 h-full">
					<Controller
						name="issuer"
						control={form.control}
						disabled={isMutating}
						render={({ field }) => (
							<ParticipantSelect
								disabled={field.disabled || createPermittedFor?.restricted}
								value={field.value}
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
					<div>
						<div className="mb-1 block">
							<Label htmlFor="privateKey" value="Private Key" />
						</div>
						<Controller
							name="privateKey"
							control={form.control}
							disabled={issuer == null || isMutating}
							render={({ field }) => (
								<FileContent
									id="privateKey"
									disabled={field.disabled}
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
					</div>
					<div>
						<div className="mb-1 block">
							<Label htmlFor="templateId" value="Template" />
						</div>
						<Controller
							name="templateId"
							control={form.control}
							disabled={isMutating}
							render={({ field }) => (
								<Select
									id="templateId"
									disabled={field.disabled}
									value={field.value}
									onChange={field.onChange}
								>
									<option value=""></option>
									{Object.keys(templates).map((template) => (
										<option key={template} value={template}>
											{template}
										</option>
									))}
								</Select>
							)}
						/>
					</div>
					{template &&
						Object.entries(template?.input).map(([key, field]) => {
							if (field.type === 'string') {
								return (
									<div key={key}>
										<div className="mb-1 block">
											<Label htmlFor={`values.${key}`} value={field.label} />
										</div>
										<TextInput
											id={`values.${key}`}
											{...form.register(`values.${key}`)}
											placeholder={field.placeholder}
											disabled={isMutating}
										/>
									</div>
								);
							}
							if (field.type === 'vc') {
								return (
									<Controller
										key={key}
										name={`values.${key}`}
										control={form.control}
										disabled={isMutating}
										render={({ field }) => (
											<Editor
												value={field.value}
												options={{
													readOnly: field.disabled,
												}}
												language="json"
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
												className="h-96"
											/>
										)}
									/>
								);
							}
							return <div key={key}>Unsupported Input type</div>;
						})}
				</div>

				<DialogFooter className="sm:justify-end">
					<DialogClose asChild>
						<Button
							type="button"
							variant="secondary"
							disabled={isMutating}
							onClick={() => form.reset()}
						>
							Cancel
						</Button>
					</DialogClose>
					<Button
						onClick={form.handleSubmit((data) => mutate(data))}
						disabled={!submittable || isMutating}
					>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</form>
	);
}
