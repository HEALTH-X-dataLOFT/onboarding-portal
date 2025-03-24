import { z } from 'zod';

export const notaryUrlsScheme = z.array(
	z.object({
		url: z.string(),
		issuer: z.string(),
		label: z.string(),
	}),
);

export type NotaryUrls = z.infer<typeof notaryUrlsScheme>;
