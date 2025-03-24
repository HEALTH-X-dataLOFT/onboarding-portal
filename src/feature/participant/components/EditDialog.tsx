'use client';

import {
	packIntoVP,
	removeProofsFromVc,
	signVc,
} from '@/utils/verifiableCredentials';
import {
	JsonWebSignature2020Signer,
	VerifiableCredential,
} from '@gaia-x/json-web-signature-2020';
import { documentLoaders } from 'jsonld';
import { putParticipant } from '../actions';
import {
	getParticipantQueryKey,
	getParticipantsQueryKey,
	Participant,
	Participants,
} from '@/generated';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useErrorNofification } from '@/hooks/query/useErrorNotification';
import useZodForm from '@/hooks/useZodForm';
import { z } from 'zod';
import { Controller } from 'react-hook-form';
import FileContent from '@/components/FileContent';
import { Signer } from '@gaia-x/json-web-signature-2020/dist/src/signer/signer';
import { importPrivateKey, pkcs1to8 } from '@/utils/privateKey';
import { renderTemplate } from '@/utils/templates';
import {
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DiffEditor } from '@monaco-editor/react';
import { useMemo, useState } from 'react';
import { Label } from 'flowbite-react';

export default function EditDialog(props: {
	participantId: string;
	participant: Participant;
	onCancel(): void;
	onSuccess(): void;
}) {
	// Mutation
	const queryClient = useQueryClient();

	const { mutate, isPending: isMutating } = useErrorNofification(useMutation)({
		async mutationFn(variables: {
			participantId: string;
			privateKey: string;
			participant: string;
		}) {
			const VCs = renderTemplate(variables.participant, {});

			const signer: Signer = new JsonWebSignature2020Signer({
				privateKey: await importPrivateKey(pkcs1to8(variables.privateKey!)),
				privateKeyAlg: 'RS256',
				documentLoader: documentLoaders.xhr(),
				verificationMethod: `${variables.participantId}#X509-JWK2020`,
			});
			const issuanceDate = new Date().toISOString();

			return putParticipant(
				variables.participantId,
				JSON.stringify(
					await signVc(packIntoVP(VCs), signer, issuanceDate),
					null,
					2,
				),
			);
		},
		onSuccess(participant, variables) {
			queryClient.setQueriesData<Participants>(
				{
					queryKey: getParticipantsQueryKey(),
				},
				(data) => {
					if (data == null) return data;
					return {
						totalCount: data.totalCount,
						items: data.items?.map((p) =>
							p.id === variables.participantId ? participant : p,
						),
					};
				},
			);
			queryClient.setQueryData<Participant>(
				getParticipantQueryKey(variables.participantId),
				participant,
			);
			props.onSuccess();
		},
	});

	// useMemo is not garanteed to not reexecute
	const [original] = useState(
		useMemo(() => {
			return JSON.stringify(
				removeProofsFromVc(
					JSON.parse(
						props.participant.selfDescription!,
					) as VerifiableCredential,
					props.participantId,
				).verifiableCredential,
				null,
				4,
			);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []),
	);

	// Form handling
	const form = useZodForm({
		schema: z.object({
			participantId: z.string(),
			privateKey: z.string(),
			participant: z.string(),
		}),
		values: {
			participant: original,
			participantId: props.participantId,
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
					<DialogTitle>Participant</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col space-y-4 h-full">
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
						name="participant"
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
