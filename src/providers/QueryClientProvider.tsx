'use client';

import {
	QueryClient,
	QueryClientProvider as Provider,
} from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function QueryClientProvider(props: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// With SSR, we usually want to set some default staleTime
						// above 0 to avoid refetching immediately on the client
						// staleTime: 60 * 1000,
					},
				},
			}),
	);
	return <Provider client={queryClient}>{props.children}</Provider>;
}
