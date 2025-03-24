'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useAuthentication } from '@/hooks/query/useAuthentication';
import { useGetParticipant } from '@/generated';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { VerifiableCredential } from '@gaia-x/json-web-signature-2020';

const JsonDisplayDialog = dynamic(
	async () => import('../../../components/JsonDisplayDialog'),
	{
		ssr: false,
	},
);
const EditDialog = dynamic(async () => import('./EditDialog'), {
	ssr: false,
});

export default function ShowParticipantButton(props: {
	participantId: string;
}) {
	const permissions = usePermissions();

	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<boolean>(false);

	// Query
	const { data: participant, isError } = useAuthentication(useGetParticipant)(
		props.participantId,
		{
			query: {
				enabled: open,
			},
		},
	);

	useEffect(() => {
		if (isError) {
			setOpen(false);
		}
	}, [isError]);

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
				{participant == null ? null : !editing ? (
					<JsonDisplayDialog
						title="Participant"
						json={
							JSON.parse(participant.selfDescription!) as VerifiableCredential
						}
						onEdit={
							permissions?.participants.update.for(props.participantId)
								? () => setEditing(true)
								: undefined
						}
						onClose={() => setOpen(false)}
					/>
				) : (
					<EditDialog
						participantId={props.participantId}
						participant={participant}
						onCancel={() => setEditing(false)}
						onSuccess={() => setOpen(false)}
					/>
				)}
			</Dialog>
		</>
	);
}
