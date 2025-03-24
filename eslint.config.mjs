import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import { includeIgnoreFile } from '@eslint/compat';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const gitignorePath = resolve(__dirname, '.gitignore');

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	includeIgnoreFile(gitignorePath),
	...compat.config({
		extends: ['next/core-web-vitals', 'next/typescript'],
		rules: {
			'@next/next/no-img-element': 'off',

			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
		},
	}),
];

export default eslintConfig;
