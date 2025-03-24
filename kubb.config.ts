import { defineConfig } from '@kubb/core';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginClient } from '@kubb/plugin-client';
import { pluginReactQuery } from '@kubb/plugin-react-query';

export default defineConfig({
	root: '.',
	input: {
		path: './fc_openapi.yaml',
	},
	output: {
		path: './src/generated',
		clean: true,
	},
	plugins: [
		pluginOas({}),
		pluginTs({}),
		pluginClient({}),
		pluginReactQuery({
			client: { importPath: '@/lib/queryClient' },
			mutation: {
				methods: ['post', 'put', 'delete'],
			},
		}),
	],
});
