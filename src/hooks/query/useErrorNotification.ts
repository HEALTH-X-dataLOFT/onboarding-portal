import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from '../use-toast';

function notify(error: unknown) {
	// redirect is implementedby an error
	// @ts-expect-error check is fine for any value
	if (error?.message === 'NEXT_REDIRECT') {
		return;
	}
	console.error(error);
	toast({
		...getErrorMessage(error),
		variant: 'destructive',
	});
}

export function useErrorNofification<T extends (...params: any[]) => any>(
	useOriginal: T,
) {
	return ((...params: Parameters<T>) => {
		if (useOriginal === useMutation) {
			const options = params.shift();
			// eslint-disable-next-line react-hooks/rules-of-hooks
			return useOriginal(
				{
					...options,
					onError(...args: unknown[]) {
						notify(args[0]);
						return options.onError?.(...args);
					},
				},
				...params,
			);
		}

		// generated hooks

		// options parameter has a default value and does therefore not count to function length
		params.length = useOriginal.length + 1;
		const options = params.pop() ?? {};

		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useOriginal(...params, {
			...options,
			mutation: {
				onError(...args: unknown[]) {
					notify(args[0]);
					return options.mutation?.onError?.(...args);
				},
				...options.mutation,
			},
		});
	}) as T;
}

function getErrorMessage(error: unknown) {
	// error is primitive value
	if (typeof error !== 'object' || error == null) {
		return {
			title: error,
		};
	}
	// Axios error
	if (error instanceof AxiosError) {
		return {
			title: error.response?.data?.message ?? error.message,
		};
	}
	// ordinary error
	if (error instanceof Error) {
		return {
			title: error.name,
			description: error.message,
		};
	}
	return {
		title: 'unknown error',
	};
}
