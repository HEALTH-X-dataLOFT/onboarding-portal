'use client';

import { getRequests } from './actions';
import RequestCard from './RequestCard';
import { useQuery } from '@tanstack/react-query';

export default function Page() {
	const { data, isPending, error } = useQuery({
		queryKey: ['participantOnboardingRequest'],
		queryFn() {
			return getRequests();
		},
	});

	if (isPending) {
		return <div>loading...</div>;
	}
	if (error) {
		return <div>Error</div>;
	}
	return (
		<>
			{data.length == 0 ? (
				<div>No pending requests available.</div>
			) : (
				<div>
					{data.map((participantOnboardingRequest) => (
						<RequestCard
							key={participantOnboardingRequest.id}
							participantOnboardingRequest={participantOnboardingRequest}
						/>
					))}
				</div>
			)}
		</>
	);
}
