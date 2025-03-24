import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryClientProvider from '@/providers/QueryClientProvider';
import ClientSessionProvider from '@/providers/ClientSessionProvider';
import EnvironmentProvider from '@/providers/EnvironmentProvider';
import { ThemeModeScript } from 'flowbite-react/components/ThemeModeScript';
import { z } from 'zod';
import { Toaster } from '@/components/ui/toaster';
import { notaryUrlsScheme } from '@/lib/env';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Health-X Portal',
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<ThemeModeScript />
			</head>
			<body className={inter.className}>
				<ClientSessionProvider>
					<QueryClientProvider>
						<EnvironmentProvider
							portalBaseUrl={process.env.PORTAL_BASE_URL}
							federatedCatalogUrl={
								process.env.NEXT_PUBLIC_FEDERATED_CATALOG_URL
							}
							notarizationUrls={notaryUrlsScheme.parse(
								JSON.parse(process.env.NOTARY_URLS),
							)}
							complianceUrls={z
								.array(z.string())
								.parse(JSON.parse(process.env.COMPLIANCE_URLS))}
						>
							{children}
							<Toaster />
						</EnvironmentProvider>
					</QueryClientProvider>
				</ClientSessionProvider>
			</body>
		</html>
	);
}
