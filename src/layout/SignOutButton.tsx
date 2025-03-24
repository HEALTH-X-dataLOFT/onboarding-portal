'use client';

import { getLogoutUrl } from '@/app/api/auth/actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useMutation } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function SignOutButton() {
	const { mutate, isPending } = useMutation({
		async mutationFn() {
			try {
				const { url } = (await getLogoutUrl())!;
				await signOut({
					redirect: false,
				});
				window.location.href = url;
			} catch (error) {
				console.error(error);
				await signOut({
					redirect: false,
				});
				window.location.href = '/';
			}
		},
	});

	return (
		<DropdownMenuItem onClick={() => mutate()} disabled={isPending}>
			<LogOut />
			Log out
		</DropdownMenuItem>
	);
}
