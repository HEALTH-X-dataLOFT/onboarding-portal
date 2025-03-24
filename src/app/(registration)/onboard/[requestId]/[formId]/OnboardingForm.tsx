'use client';

import { Button, Label, Select, TextInput, ToggleSwitch } from 'flowbite-react';
import { onboardParticipant } from './action';
import { JsonWebSignature2020Signer } from '@gaia-x/json-web-signature-2020';
import { documentLoaders } from 'jsonld';
import { useMutation } from '@tanstack/react-query';
import { importPrivateKey, pkcs1to8 } from '@/utils/privateKey';
import FileContent from '@/components/FileContent';
import useZodForm from '@/hooks/useZodForm';
import { z } from 'zod';
import { Controller, useWatch } from 'react-hook-form';
import { urlToDid } from '@/utils/verifiableCredentials';
import { ParticipantOnboardingFrom } from '@prisma/client';
import { useErrorNofification } from '@/hooks/query/useErrorNotification';
import { downloadFile } from '@/utils/downloadFile';
import { getByVerificationMethod } from '@/utils/fetchDid';
import {
	createUnsignedParticipantVC,
	createUnsignedTermsAndConditionsVC,
} from './utils';
import { useRouter } from 'next/navigation';
import { environmentContext } from '@/providers/EnvironmentProvider';
import { useContext } from 'react';

const onboardingScheme = z.discriminatedUnion('selfHosted', [
	z.object({
		selfHosted: z.literal(true),
		verificationMethod: z.string().endsWith('#X509-JWK2020'),
		privateKey: z.string(),
		complianceUrl: z.string(),
	}),
	z.object({
		selfHosted: z.literal(false),
		crtPem: z.string(),
		privateKey: z.string(),
		complianceUrl: z.string(),
	}),
]);

export default function OnboardingForm(props: {
	requestId: string;
	formId: string;
	formValues: ParticipantOnboardingFrom;
}) {
	const { complianceUrls, portalBaseUrl } = useContext(environmentContext);

	const form = useZodForm({
		schema: onboardingScheme,
		defaultValues: {
			selfHosted: false,
			complianceUrl: complianceUrls[0],
		},
	});

	const router = useRouter();

	const { mutate, isPending: pending } = useErrorNofification(useMutation)({
		mutationKey: ['onboarding'],
		async mutationFn(variables: z.infer<typeof onboardingScheme>) {
			const verificationMethod = variables.selfHosted
				? variables.verificationMethod
				: urlToDid(`${portalBaseUrl}/did/${props.requestId}`) + '#X509-JWK2020';

			const issuer = verificationMethod.slice(
				0,
				verificationMethod?.lastIndexOf('#'),
			);

			const privateKeyAlg = variables.selfHosted
				? getByVerificationMethod(verificationMethod)
						.then((m) => m.publicKeyJwk.alg)
						.catch(() => {
							throw new Error('Invalid verification method');
						})
				: 'RS256';

			const signer = new JsonWebSignature2020Signer({
				privateKey: await importPrivateKey(pkcs1to8(variables.privateKey)),
				privateKeyAlg: await privateKeyAlg,
				documentLoader: documentLoaders.xhr(),
				verificationMethod,
			});

			const participantVc = await signer.sign(
				createUnsignedParticipantVC(props.formValues, issuer),
			);

			const termsAndConditionsVC = await signer.sign(
				createUnsignedTermsAndConditionsVC(props.formValues, issuer),
			);

			const { errorMsg, providerVp, compliance } = await onboardParticipant({
				requestId: props.requestId,
				formId: props.formId,
				crtPem: variables.selfHosted ? undefined : variables.crtPem,
				participantVc: JSON.stringify(participantVc, null, 2),
				termsAndConditionsVc: JSON.stringify(termsAndConditionsVC, null, 2),
				complianceUrl: variables.complianceUrl,
			});
			if (errorMsg != null) {
				throw errorMsg;
			}
			await Promise.all([
				downloadFile(providerVp, 'provider.json', 'application/json'),
				downloadFile(compliance, 'compliance.json', 'application/json'),
			]);

			router.push(`/confirm/${props.requestId}`);
		},
	});

	const selfHosted = useWatch({
		name: 'selfHosted',
		control: form.control,
	});

	return (
		<div>
			<form onSubmit={form.handleSubmit((values) => mutate(values))}>
				<Controller
					name="selfHosted"
					control={form.control}
					render={({ field }) => (
						<ToggleSwitch
							disabled={pending}
							label="Self host certificate"
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
				{selfHosted && (
					<div>
						<div className="mb-1 block">
							<Label htmlFor="verificationMethod" value="Verification Method" />
						</div>
						<TextInput
							id="verificationMethod"
							{...form.register('verificationMethod')}
							helperText={form.formState.errors.verificationMethod?.message}
							required
							disabled={pending}
							placeholder="did:web:example.com#X509-JWK2020"
						/>
					</div>
				)}
				{!selfHosted && (
					<div>
						<div className="mb-1 block">
							<Label htmlFor="crtPem" value="Certificate PEM" />
						</div>
						<Controller
							name="crtPem"
							control={form.control}
							render={({ field }) => (
								<FileContent
									id="crtPem"
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
									helperText={form.formState.errors.crtPem?.message}
								/>
							)}
						/>
					</div>
				)}
				<div>
					<div className="mb-1 block">
						<Label htmlFor="privateKey" value="Private Key" />
					</div>
					<Controller
						name="privateKey"
						control={form.control}
						render={({ field }) => (
							<FileContent
								disabled={pending}
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
								helperText={form.formState.errors.privateKey?.message}
							/>
						)}
					/>
				</div>
				{complianceUrls.length > 1 && (
					<div>
						<div className="mb-1 block">
							<Label htmlFor="complianceUrl" value="Compliance Endpoint" />
						</div>
						<Select
							id="complianceUrl"
							{...form.register('complianceUrl')}
							helperText={form.formState.errors.complianceUrl?.message}
							disabled={pending}
						>
							{complianceUrls.map((url) => (
								<option key={url}>{url}</option>
							))}
						</Select>
					</div>
				)}
				<Button type="submit" disabled={pending}>
					Submit
				</Button>
			</form>
		</div>
	);
}
