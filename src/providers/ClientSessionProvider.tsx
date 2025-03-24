'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function ClientSessionProvider(props: { children: ReactNode }) {
	return (
		<SessionProvider refetchInterval={4 * 60}>{props.children}</SessionProvider>
	);
}
