import { Participant } from '@/generated';

export function getNameOfParticipant(participant: Participant) {
	try {
		const selfDescription = JSON.parse(participant.selfDescription);
		const VCs = selfDescription.verifiableCredential;
		const VC = VCs[0] ?? VCs;
		return VC?.credentialSubject?.['gx:legalName'] as string;
	} catch {
		// e.g. participant got deleted
		return 'unknown';
	}
}

export const allRoles = ['Ro-MU-CA', 'Ro-MU-A', 'Ro-SD-A', 'Ro-PA-A'];

export function getFormattedRoles(roleIds: string[]) {
	if (roleIds.includes('Ro-MU-CA')) {
		return getFormattedRole('Ro-MU-CA');
	}
	if (roleIds.includes('Ro-MU-A')) {
		return getFormattedRole('Ro-MU-A');
	}
	return roleIds.map(getFormattedRole).join('; ');
}

export function getFormattedRole(roleId: string) {
	return {
		'Ro-MU-CA': 'Catalogue Administrator',
		'Ro-MU-A': 'Participant Administrator',
		'Ro-SD-A': 'Self-Description Administrator',
		'Ro-PA-A': 'Participant User Administrator',
	}[roleId];
}
