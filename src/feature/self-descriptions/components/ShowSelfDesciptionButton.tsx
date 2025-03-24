'use client';

import { useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useAuthentication } from '@/hooks/query/useAuthentication';
import { useReadSelfDescriptionByHash } from '@/generated';
import { VerifiableCredential } from '@gaia-x/json-web-signature-2020';
import { environmentContext } from '@/providers/EnvironmentProvider';
import { usePermissions } from '@/hooks/auth/usePermissions';

const JsonDisplayDialog = dynamic(
	async () => import('../../../components/JsonDisplayDialog'),
	{
		ssr: false,
	},
);
const EditDialog = dynamic(async () => import('./EditDialog'), {
	ssr: false,
});

function ensureArray<T>(value: T): T extends Array<any> ? T : [T] {
	if (Array.isArray(value)) {
		// @ts-expect-error matches conditional type
		return value;
	}
	// @ts-expect-error matches conditional type
	return [value];
}

function getIssuerFromProof(VP: VerifiableCredential) {
	const method = ensureArray(VP.verifiableCredential)[0].proof
		.verificationMethod;
	return method.slice(0, method.indexOf('#'));
}

export default function ShowParticipantButton(props: { sdHash: string }) {
	const permissions = usePermissions();

	const { federatedCatalogUrl } = useContext(environmentContext);

	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<boolean>(false);

	// Query
	const { data: selfDescription, isError } = useAuthentication(
		useReadSelfDescriptionByHash,
	)(props.sdHash, {
		query: {
			enabled: open,
			select(data) {
				// API is incorrectly typed
				return data as unknown as VerifiableCredential;
			},
		},
	});

	useEffect(() => {
		if (isError) {
			setOpen(false);
		}
	}, [isError]);

	const issuer: string =
		selfDescription != null ? getIssuerFromProof(selfDescription) : undefined;

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={(e) => {
					setOpen(e);
					setEditing(false);
				}}
			>
				<DialogTrigger asChild>
					<Button variant="outline" size="icon">
						<span className="sr-only">View</span>
						<Eye />
					</Button>
				</DialogTrigger>
				{selfDescription == null ? null : !editing ? (
					<JsonDisplayDialog
						title="Self Description"
						json={selfDescription}
						onEdit={
							issuer && permissions?.selfDescriptions.update.for(issuer)
								? () => setEditing(true)
								: undefined
						}
						onClose={() => setOpen(false)}
					/>
				) : (
					<EditDialog
						catalogURL={federatedCatalogUrl}
						sdHash={props.sdHash}
						selfDescription={selfDescription}
						issuer={issuer}
						onCancel={() => setEditing(false)}
						onSuccess={() => setOpen(false)}
					/>
				)}
			</Dialog>
		</>
	);
}
