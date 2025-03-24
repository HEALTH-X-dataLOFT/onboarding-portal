import { useSessionData } from '@/hooks/auth/useSessionData';
import SignInButton from '@/layout/SignInButton';
import { Button } from 'flowbite-react';
import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';

export default function Home() {
	const session = useSessionData();

	if (session != null) {
		// TODO use middleware
		redirect('/admin', RedirectType.replace);
	}
	return (
		<div className="h-full flex flex-col gap-4">
			<div className="flex flex-1 items-center justify-center">
				<div className="w-full max-w-xs">
					<img
						src="/images/health_x_logo.webp"
						alt="Health-X Logo"
						className="h-10"
					/>
					<SignInButton />
					<Link href="/register">
						<Button gradientDuoTone="purpleToBlue">Register</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
