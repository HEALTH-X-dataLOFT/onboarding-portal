import { usePermissions } from './usePermissions';

const routeMapping = {
	'/admin/participant': (permissions) => permissions?.participants.list.any(),
	'/admin/self-descriptions': (permissions) =>
		permissions?.selfDescriptions.list.any(),
	'/admin/user': (permissions) => permissions?.users.list.any(),
	'/admin/management': (permissions) => permissions?.requests.list.any(),
};

export function useHasPermissionForRoute() {
	const permissions = usePermissions();

	return (route: string) => {
		if (routeMapping[route] == null) {
			return true;
		}
		return routeMapping[route]?.(permissions) ?? false;
	};
}
