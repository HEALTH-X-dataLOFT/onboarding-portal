'use client';

import ParticipantDetails from '@/feature/participant/components/ParticipantDetails';
import { getFormattedRoles, getNameOfParticipant } from '@/utils/formatter';
import { useAuthentication } from '@/hooks/query/useAuthentication';
import { useGetUsers } from '@/generated';
import CreateUserButton from '@/feature/user/components/CreateUserButton';
import DeleteUserButton from '@/feature/user/components/DeleteUserButton';
import { Table } from 'flowbite-react/components/Table';
import UserDetails from '@/feature/user/components/UserDetails';
import { usePermissions } from '@/hooks/auth/usePermissions';

export default function Services() {
	const permissions = usePermissions();

	const { data, isPending, isError } = useAuthentication(useGetUsers)();

	if (isPending) {
		return <p>Loading...</p>;
	}

	if (isError) {
		return <p>Error...</p>;
	}

	return (
		<div className="overflow-x-auto flex flex-col gap-2 items-start">
			{permissions?.selfDescriptions.create.any() && <CreateUserButton />}
			<Table>
				<Table.Head>
					<Table.HeadCell>User</Table.HeadCell>
					<Table.HeadCell>Participant</Table.HeadCell>
					<Table.HeadCell>Role</Table.HeadCell>
					<Table.HeadCell>
						<span className="sr-only">Delete</span>
					</Table.HeadCell>
				</Table.Head>
				<Table.Body className="divide-y">
					{data.items?.map((user) => {
						return (
							<Table.Row
								key={user.id}
								className="bg-white dark:border-gray-700 dark:bg-gray-800"
							>
								<Table.Cell>
									<UserDetails name={user.username} email={user.email} />
								</Table.Cell>
								<Table.Cell>
									{user.participantId && (
										<ParticipantDetails participantId={user.participantId}>
											{getNameOfParticipant}
										</ParticipantDetails>
									)}
								</Table.Cell>
								<Table.Cell>{getFormattedRoles(user.roleIds ?? [])}</Table.Cell>
								<Table.Cell>
									{user.id && <DeleteUserButton userId={user.id} />}
								</Table.Cell>
							</Table.Row>
						);
					})}
				</Table.Body>
			</Table>
		</div>
	);
}
