'use client';

import { Button } from 'flowbite-react/components/Button';
import { signIn } from 'next-auth/react';

export default function SignInButton() {
	return (
		<Button
			onClick={() =>
				signIn('keycloak', {
					callbackUrl: '/admin',
				})
			}
			outline
			gradientDuoTone="purpleToBlue"
		>
			Sign in
		</Button>
	);
}
