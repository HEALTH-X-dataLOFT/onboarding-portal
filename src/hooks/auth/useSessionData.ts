import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth/next';
import { useSession } from 'next-auth/react';
import { use } from 'react';

/**
 * Isometric version of `useSession()` hook
 */
export function useSessionData() {
	return typeof window === 'undefined'
		? // SSR
			use(getServerSession(authOptions))
		: // client
			// eslint-disable-next-line react-hooks/rules-of-hooks
			useSession().data;
}
