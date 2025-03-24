const keycloakAdminUrl = `${process.env.KEYCLOAK_ISSUER}/realms/${process.env.KEYCLOAK_REALM}`;
const clientId = process.env.KEYCLOAK_ID!;
const clientSecret = process.env.KEYCLOAK_SECRET!;

export async function getAdminToken() {
	const tokenResponse = await fetch(
		`${keycloakAdminUrl}/protocol/openid-connect/token`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				grant_type: 'client_credentials',
				client_id: clientId,
				client_secret: clientSecret,
			}),
			next: {
				// TODO use appropriate time
				revalidate: 0,
			},
		},
	);

	const tokenData = await tokenResponse.json();
	return tokenData.access_token;
}

async function getClientId(clientName: string, accessToken: string) {
	// TODO find endpoint to get client by name
	const clients = await (
		await fetch(
			`${process.env.KEYCLOAK_ISSUER}/admin/realms/${process.env.KEYCLOAK_REALM}/clients`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				next: {
					revalidate: 0,
				},
			},
		)
	).json();

	const clientId = clients.find((client: any) => client.clientId === clientName)
		?.id;

	if (clientId == null) {
		throw new Error(`Could not resolve id for client ${clientName}`);
	}
	return clientId;
}

async function getGroupId(groupName: string, accessToken: string) {
	// TODO find endpoint to get group by name
	const groups = await (
		await fetch(
			`${process.env.KEYCLOAK_ISSUER}/admin/realms/${process.env.KEYCLOAK_REALM}/groups`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				next: {
					revalidate: 0,
				},
			},
		)
	).json();

	const groupId = groups.find((group: any) => group.name === groupName)?.id;

	if (groupId == null) {
		throw new Error(`Could not resolve id for group ${groupName}`);
	}
	return groupId;
}

async function getClientRoleId(
	roleName: string,
	clientId: string,
	accessToken: string,
) {
	// TODO find endpoint to get role by name
	const roles = await (
		await fetch(
			`${process.env.KEYCLOAK_ISSUER}/admin/realms/${process.env.KEYCLOAK_REALM}/clients/${clientId}/roles`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				next: {
					revalidate: 0,
				},
			},
		)
	).json();

	const roleId = roles.find((role: any) => role.name === roleName)?.id;

	if (roleId == null) {
		throw new Error(`Could not resolve id for role ${roleName}`);
	}
	return roleId;
}

export async function getUser(
	email: string,
	accessToken: string,
): Promise<string> {
	const getUser = await (
		await fetch(
			`${process.env.KEYCLOAK_ISSUER}/admin/realms/${process.env.KEYCLOAK_REALM}/users/?email=${email}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				next: {
					revalidate: 0,
				},
			},
		)
	).json();

	const userId = getUser?.[0]?.id;

	if (!userId) {
		throw new Error(`could not fetch user`);
	}

	return userId;
}

export async function assignClientRoleToUser(
	userId: string,
	client: string,
	role: string,
	accessToken: string,
) {
	const clientId = await getClientId(client, accessToken);
	const roleId = await getClientRoleId(role, clientId, accessToken);

	const updateUser = await fetch(
		`${process.env.KEYCLOAK_ISSUER}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}/role-mappings/clients/${clientId}`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify([
				{
					id: roleId,
					name: role,
				},
			]),
			next: {
				revalidate: 0,
			},
		},
	);

	const response = await updateUser.text();
	if (response.trim()) {
		throw new Error(`Error assigning role to user: ${response}`);
	}
}

export async function assignAttributeToUser(
	userId: string,
	attribute: string,
	value: string,
	accessToken: string,
) {
	const updateUser = await fetch(
		`${process.env.KEYCLOAK_ISSUER}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				attributes: {
					[attribute]: [value],
				},
			}),
			next: {
				revalidate: 0,
			},
		},
	);

	const response = await updateUser.text();
	if (response.trim()) {
		throw new Error(`Error assigning attribute to user: ${response}`);
	}
}

export async function assignGroupToUser(
	userId: string,
	group: string,
	accessToken: string,
) {
	const groupId = await getGroupId(group, accessToken);

	const updateUser = await fetch(
		`${process.env.KEYCLOAK_ISSUER}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}/groups/${groupId}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			next: {
				revalidate: 0,
			},
		},
	);

	const response = await updateUser.text();
	if (response.trim()) {
		throw new Error(`Error assigning group to user: ${response}`);
	}
}

export async function createUser(
	firstName: string,
	lastName: string,
	email: string,
	// password: string,
	accessToken: string,
) {
	try {
		const createUserResponse = await fetch(
			`${process.env.KEYCLOAK_ISSUER}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: email,
					firstName,
					lastName,
					email,
					enabled: true,
					// credentials: [
					// 	{
					// 		type: 'password',
					// 		value: password,
					// 		temporary: true,
					// 	},
					// ],
				}),
				next: {
					revalidate: 0,
				},
			},
		);

		const response = await createUserResponse.text();

		if (response.trim()) {
			throw new Error(`Error creating user: ${response}`);
		}
	} catch (error) {
		console.error(error);
		throw new Error('Error creating User');
	}
}
