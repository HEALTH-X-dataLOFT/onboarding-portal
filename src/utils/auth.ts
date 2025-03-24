export type PermissionScope =
	| {
			restricted: false;
			participantId: null;
	  }
	| {
			restricted: true;
			participantId: string;
	  };

type Permission<T> = {
	[K in keyof T]: T[K] extends PermissionScope | false
		? {
				for: (requested: string | null) => boolean;
				any(): boolean;
				get(): PermissionScope | null;
			}
		: Permission<T[K]>;
};

function permissionsProxy<T extends object>(obj: T): Permission<T> {
	return new Proxy(obj, {
		get(target: any, prop, receiver) {
			const value: unknown = target[prop];
			if (typeof value === 'object' && value != null) {
				if ('restricted' in value && 'participantId' in value) {
					return {
						for(requested: string) {
							return !value.restricted || value.participantId === requested;
						},
						any() {
							return !!value;
						},
						get() {
							return value;
						},
					};
				} else {
					return permissionsProxy(value);
				}
			}

			if (typeof value === 'boolean') {
				return {
					for() {
						return value;
					},
					any() {
						return value;
					},
					get() {
						return value ? { restricted: false, participantId: null } : null;
					},
				};
			}
			return Reflect.get(target, prop, receiver);
		},
	});
}

export function getPermissionsProxy<
	T extends { permissions?: unknown } | null | undefined,
>(
	obj: T,
): T extends { permissions?: infer U extends object } ? Permission<U> : null {
	if (obj?.permissions == null) {
		// @ts-expect-error matches conditional type
		return null;
	}
	// @ts-expect-error matches conditional type
	return permissionsProxy(obj.permissions);
}
