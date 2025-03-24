import {
	mapRequestToCredentialSubject,
	mapRequestToUnsignedVC,
} from '@/utils/verifiableCredentials';
import { ParticipantOnboardingFrom } from '@prisma/client';

export function createUnsignedParticipantVC(
	form: ParticipantOnboardingFrom,
	issuer: string,
) {
	return mapRequestToUnsignedVC(
		form.participantVcId,
		mapRequestToCredentialSubject(
			form,
			form.participantSubjectId,
			form.registrationNumberSubjectId,
		),
		issuer,
		new Date().toISOString(),
	);
}

export function createUnsignedTermsAndConditionsVC(
	form: ParticipantOnboardingFrom,
	issuer: string,
) {
	return mapRequestToUnsignedVC(
		form.termsAndConditionsVcId,
		{
			'gx:termsAndConditions':
				'The PARTICIPANT signing the Self-Description agrees as follows:\n- to update its descriptions about any changes, be it technical, organizational, or legal - especially but not limited to contractual in regards to the indicated attributes present in the descriptions.\n\nThe keypair used to sign Verifiable Credentials will be revoked where Gaia-X Association becomes aware of any inaccurate statements in regards to the claims which result in a non-compliance with the Trust Framework and policy rules defined in the Policy Rules and Labelling Document (PRLD).',
			type: 'gx:GaiaXTermsAndConditions',
			id: form.termsAndConditionsSubjectId,
		},
		issuer,
		new Date().toISOString(),
	);
}
