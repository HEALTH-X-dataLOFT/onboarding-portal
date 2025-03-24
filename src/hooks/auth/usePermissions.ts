import { getPermissionsProxy } from '@/utils/auth';
import { useSessionData } from './useSessionData';

export function usePermissions() {
	return getPermissionsProxy(useSessionData());
}
