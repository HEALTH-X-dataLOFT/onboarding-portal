import client, {
	RequestConfig,
	ResponseConfig,
} from '@kubb/plugin-client/client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const queryClient = async <TData, TError = unknown, TVariables = unknown>(
	config: RequestConfig<TVariables>,
): Promise<ResponseConfig<TData>> => {
	return client({
		...config,
	});
};

export default queryClient;
