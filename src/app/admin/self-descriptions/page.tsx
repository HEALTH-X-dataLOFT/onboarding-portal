'use client';

import { useContext } from 'react';
import ParticipantDetails from '@/feature/participant/components/ParticipantDetails';
import { getNameOfParticipant } from '@/utils/formatter';
import ShowSelfDescriptionButton from '@/feature/self-descriptions/components/ShowSelfDesciptionButton';
import { useAuthentication } from '@/hooks/query/useAuthentication';
import { useReadSelfDescriptions } from '@/generated';
import ProvideSelfDescriptionButton from '@/feature/self-descriptions/components/ProvideSelfDescriptionButton';
import DeleteSelfDescriptionButton from '@/feature/self-descriptions/components/DeleteSelfDescriptionButton';
import { ensureArray } from '@/utils/verifiableCredentials';
import { Table } from 'flowbite-react/components/Table';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { environmentContext } from '@/providers/EnvironmentProvider';
import ShowSelfDescriptionComplianceButton from '@/feature/self-descriptions/components/ShowSelfDescriptionComplianceButton';

export default function Services() {
	const permissions = usePermissions();

	const { notarizationUrls } = useContext(environmentContext);

	const { data, isPending, isError } = useAuthentication(
		useReadSelfDescriptions,
	)(
		{
			withContent: true,
		},
		{
			query: {
				select(data) {
					return {
						...data,
						items: data.items?.filter((sd) => {
							try {
								const content = JSON.parse(sd.content!);
								const VCs = ensureArray(content.verifiableCredential);
								return !VCs.every(
									(vc) => vc.credentialSubject?.type === 'gx:LegalParticipant',
								);
							} catch {
								return true;
							}
						}),
					};
				},
			},
		},
	);

	if (isPending) {
		return <p>Loading...</p>;
	}

	if (isError) {
		return <p>Error...</p>;
	}

	return (
		<div className="overflow-x-auto flex flex-col gap-2 items-start">
			{permissions?.selfDescriptions.create.any() && (
				<ProvideSelfDescriptionButton />
			)}
			<Table hoverable>
				<Table.Head>
					<Table.HeadCell>Issuer</Table.HeadCell>
					<Table.HeadCell>Hash</Table.HeadCell>
					<Table.HeadCell>Status</Table.HeadCell>
					<Table.HeadCell>Uploaded</Table.HeadCell>
					<Table.HeadCell>Expires</Table.HeadCell>

					{permissions?.selfDescriptions.read.any() && (
						<Table.HeadCell>
							<span className="sr-only">View</span>
						</Table.HeadCell>
					)}
					<Table.HeadCell>
						<span className="sr-only">Compliance</span>
					</Table.HeadCell>
					{permissions?.selfDescriptions.delete.any() && (
						<Table.HeadCell>
							<span className="sr-only">Delete</span>
						</Table.HeadCell>
					)}
				</Table.Head>
				<Table.Body className="divide-y">
					{data.items?.map(({ meta: sd }) => {
						return (
							<Table.Row
								key={sd?.sdHash}
								className="bg-white dark:border-gray-700 dark:bg-gray-800"
							>
								<Table.Cell>
									{sd?.issuer &&
										(notarizationUrls.some((n) => n.issuer === sd.issuer) ? (
											notarizationUrls.find((n) => n.issuer === sd.issuer)!
												.label
										) : (
											<ParticipantDetails participantId={sd.issuer}>
												{getNameOfParticipant}
											</ParticipantDetails>
										))}
								</Table.Cell>
								<Table.Cell>{sd?.sdHash}</Table.Cell>
								<Table.Cell>{sd?.status}</Table.Cell>
								<Table.Cell>{sd?.uploadDatetime}</Table.Cell>
								<Table.Cell>{sd?.expirationTime}</Table.Cell>
								{permissions?.selfDescriptions.read.any() && (
									<Table.Cell>
										{sd?.sdHash &&
											sd.issuer &&
											permissions.selfDescriptions.read.for(sd.issuer) && (
												<ShowSelfDescriptionButton sdHash={sd.sdHash} />
											)}
									</Table.Cell>
								)}
								<Table.Cell>
									{sd?.sdHash && (
										<ShowSelfDescriptionComplianceButton sdHash={sd?.sdHash} />
									)}
								</Table.Cell>
								{permissions?.selfDescriptions.delete.any() && (
									<Table.Cell>
										{sd?.sdHash &&
											sd.issuer &&
											permissions.selfDescriptions.delete.for(sd.issuer) && (
												<DeleteSelfDescriptionButton
													issuer={sd.issuer}
													selfDescriptionHash={sd.sdHash}
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
