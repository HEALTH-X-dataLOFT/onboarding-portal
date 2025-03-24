import { environmentContext } from '@/providers/EnvironmentProvider';
import { useSession } from 'next-auth/react';
import { useContext } from 'react';

export function useAuthentication<T extends (...params: any[]) => any>(
	useOriginal: T,
) {
	const accessToken = useSession()?.data?.accessToken;
	const { federatedCatalogUrl: baseURL } = useContext(environmentContext);

	return ((...params: Parameters<T>) => {
		// options parameter has a default value and does therefore not count to function length
		params.length = useOriginal.length + 1;
		const options = params.pop() ?? {};

		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useOriginal(...params, {
			...options,
			query: {
				...options.query,
				// NOTE: we utilize that this expression can evaluate to undefined
				enabled: accessToken != null && options.query?.enabled,
			},
			client: {
				baseURL,
				...options.client,
				headers: {
					Authorization: `Bearer ${accessToken}`,
					...options.client?.headers,
				},
			},
		});
	}) as T;
}
