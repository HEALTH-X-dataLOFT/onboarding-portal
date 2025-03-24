'use client';

import DeleteParticipantButton from '@/feature/participant/components/DeleteParticipantButton';
import { getNameOfParticipant } from '@/utils/formatter';
import ShowParticipantButton from '@/feature/participant/components/ShowParticipantButton';
import { useGetParticipants } from '@/generated/hooks/useGetParticipants';
import { useAuthentication } from '@/hooks/query/useAuthentication';
import { Table } from 'flowbite-react/components/Table';
import { usePermissions } from '@/hooks/auth/usePermissions';
import ShowParticipantComplianceButton from '@/feature/participant/components/ShowParticipantComplianceButton';

export default function Services() {
	const permissions = usePermissions();
	const { data, isPending, isError } = useAuthentication(useGetParticipants)();

	if (isPending) {
		return <p>Loading...</p>;
	}

	if (isError) {
		return <p>Error...</p>;
	}

	return (
		<div className="overflow-x-auto">
			<Table hoverable>
				<Table.Head>
					<Table.HeadCell>Legal name</Table.HeadCell>
					<Table.HeadCell>Issuer</Table.HeadCell>
					<Table.HeadCell>Id</Table.HeadCell>
					{permissions?.participants.read.any() && (
						<Table.HeadCell>
							<span className="sr-only">View</span>
						</Table.HeadCell>
					)}
					<Table.HeadCell>
						<span className="sr-only">Compliance</span>
					</Table.HeadCell>
					{permissions?.participants.delete.any() && (
						<Table.HeadCell>
							<span className="sr-only">Delete</span>
						</Table.HeadCell>
					)}
				</Table.Head>
				<Table.Body className="divide-y">
					{data.items?.map((participant) => {
						return (
							<Table.Row
								key={participant.id}
								className="bg-white dark:border-gray-700 dark:bg-gray-800"
							>
								<Table.Cell className="text-base font-semibold">
									{getNameOfParticipant(participant)}
								</Table.Cell>
								<Table.Cell>{participant.name}</Table.Cell>
								<Table.Cell>{participant.id}</Table.Cell>
								{permissions?.participants.read.any() && (
									<Table.Cell>
										{participant.id &&
											permissions.participants.read.for(participant.id) && (
												<ShowParticipantButton participantId={participant.id} />
											)}
									</Table.Cell>
								)}
								<Table.Cell>
									{participant.id && (
										<ShowParticipantComplianceButton
											participantId={participant.id}
										/>
									)}
								</Table.Cell>
								{permissions?.participants.delete.any() && (
									<Table.Cell>
										{participant.id &&
											permissions.participants.delete.for(participant.id) && (
												<DeleteParticipantButton
													participantId={participant.id}
												/>
											)}
									</Table.Cell>
								)}
							</Table.Row>
						);
					})}
				</Table.Body>
			</Table>
		</div>
	);
}
