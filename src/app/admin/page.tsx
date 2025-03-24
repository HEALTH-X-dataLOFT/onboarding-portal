import { useHasPermissionForRoute } from '@/hooks/auth/useHasPermissionForRoute';
import { RedirectType, redirect } from 'next/navigation';

export default function Page() {
	const hasPermissionForRoute = useHasPermissionForRoute();

	const destination = [
		'/admin/participant',
		'/admin/self-descriptions',
		'/admin/user',
		'/admin/management',
	].find(hasPermissionForRoute);

	if (destination) {
		redirect(destination, RedirectType.replace);
	}
}
