'use client';

import { NotaryUrls } from '@/lib/env';
import { createContext, ReactNode } from 'react';

export const environmentContext = createContext({
	portalBaseUrl: '',
	federatedCatalogUrl: '',
	notarizationUrls: [] as NotaryUrls,
	complianceUrls: [] as string[],
});

export default function EnvironmentProvider(props: {
	children: ReactNode;
	portalBaseUrl: string;
	federatedCatalogUrl: string;
	notarizationUrls: NotaryUrls;
	complianceUrls: string[];
}) {
	return (
		<environmentContext.Provider
			value={{
				portalBaseUrl: props.portalBaseUrl,
				federatedCatalogUrl: props.federatedCatalogUrl,
				notarizationUrls: props.notarizationUrls,
				complianceUrls: props.complianceUrls,
			}}
		>
			{props.children}
		</environmentContext.Provider>
	);
}
