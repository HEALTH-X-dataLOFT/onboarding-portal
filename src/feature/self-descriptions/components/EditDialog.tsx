'use client';

import { useMemo, useState } from 'react';
import {
	packIntoVP,
	removeProofsFromVc,
	signVc,
} from '@/utils/verifiableCredentials';
import {
	VerifiableCredential,
	JsonWebSignature2020Signer,
} from '@gaia-x/json-web-signature-2020';
import {
	readSelfDescriptionByHashQueryKey,
	readSelfDescriptionsQueryKey,
	SelfDescriptions,
} from '@/generated';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DiffEditor } from '@monaco-editor/react';
import { updateSelfDescription } from '../actions';
import ParticipantSelect from '../../participant/components/ParticipantSelect';
import { useErrorNofification } from '@/hooks/query/useErrorNotification';
import useZodForm from '@/hooks/useZodForm';
import { z } from 'zod';
import { Controller } from 'react-hook-form';
import FileContent from '@/components/FileContent';
import { getTemplateValuesForIssuer, renderTemplate } from '@/utils/templates';
import { documentLoaders } from 'jsonld';
import { importPrivateKey, pkcs1to8 } from '@/utils/privateKey';
import { useSessionData } from '@/hooks/auth/useSessionData';
import { Signer } from '@gaia-x/json-web-signature-2020/dist/src/signer/signer';
import {
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from 'flowbite-react';

export default function EditDialog(props: {
	catalogURL: string;
	sdHash: string;
	selfDescription: VerifiableCredential;
	issuer: string;
	onCancel(): void;
	onSuccess(): void;
}) {
	// Mutation
	const queryClient = useQueryClient();

	const session = useSessionData();

	const { mutate, isPending: isMutating } = useErrorNofification(useMutation)({
		async mutationFn(variables: {
			sdHash: string;
			issuer: string;
			privateKey: string;
			content: string;
		}) {
			const templateValues = await getTemplateValuesForIssuer(
				props.catalogURL,
				variables.issuer,
				session,
			);
			const VCs = renderTemplate(variables.content, templateValues);

			const signer: Signer = new JsonWebSignature2020Signer({
				privateKey: await importPrivateKey(pkcs1to8(variables.privateKey!)),
				privateKeyAlg: 'RS256',
				documentLoader: documentLoaders.xhr(),
				verificationMethod: `${variables.issuer}#X509-JWK2020`,
			});
			const issuanceDate = new Date().toISOString();

			return updateSelfDescription(
				variables.issuer,
				variables.sdHash,
				JSON.stringify(
					await signVc(packIntoVP(VCs), signer, issuanceDate),
					null,
					2,
				),
			);
		},
		onSuccess(selfDescription, variables) {
			const sdHash = selfDescription.meta.sdHash;
			queryClient.setQueriesData<SelfDescriptions>(
				{
					queryKey: readSelfDescriptionsQueryKey(),
				},
				(data) => {
					if (data == null) return data;
					return {
						totalCount: data.totalCount,
						items: data.items?.map((sd) =>
							sdHash === variables.sdHash
								? {
										meta: selfDescription.meta,
										content:
											sd.content == null ? sd.content : selfDescription.content,
									}
								: sd,
						),
					};
				},
			);
			if (sdHash) {
				queryClient.setQueryData(
					readSelfDescriptionByHashQueryKey(sdHash),
					JSON.parse(selfDescription.content),
				);
			}
			// update is actually delete and create, therefore invalidate cache
			queryClient.invalidateQueries({
				queryKey: readSelfDescriptionByHashQueryKey(variables.sdHash),
			});
			queryClient.invalidateQueries({
				queryKey: readSelfDescriptionsQueryKey(),
			});
			props.onSuccess();
		},
	});

	// useMemo is not garanteed to not reexecute
	const [original] = useState(
		useMemo(() => {
			return JSON.stringify(
				removeProofsFromVc(props.selfDescription, props.issuer)
					.verifiableCredential,
				null,
				4,
			);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []),
	);

	// Form handling
	const form = useZodForm({
		schema: z.object({
			sdHash: z.string(),
			issuer: z.string(),
			privateKey: z.string(),
			content: z.string(),
		}),
		values: {
			issuer: props.issuer,
			content: original,
			sdHash: props.sdHash,
		},
	});
	const submittable = form.formState.isValid && !form.formState.isValidating;

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
					<ParticipantSelect value={props.issuer} disabled />
					<div>
						<div className="mb-1 block">
							<Label htmlFor="privateKey" value="Private Key" />
						</div>
						<Controller
							name="privateKey"
							control={form.control}
							disabled={isMutating}
							render={({ field }) => (
								<FileContent
									disabled={field.disabled}
									id="privateKey"
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
					<Controller
						name="content"
						control={form.control}
						disabled={isMutating}
						render={({ field }) => (
							<DiffEditor
								original={original}
								modified={field.value}
								options={{
									readOnly: field.disabled,
								}}
								language="json"
								onMount={(editor) => {
									const model = editor.getModifiedEditor();
									model?.onDidChangeModelContent(() => {
										field.onChange({
											target: {
												name: field.name,
												get value() {
													return model.getValue();
												},
											},
										});
									});
								}}
								className="h-96"
							/>
						)}
					/>
				</div>

				<DialogFooter className="sm:justify-end">
					<Button
						variant="secondary"
						onClick={props.onCancel}
						disabled={isMutating}
					>
						Cancel
					</Button>
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
