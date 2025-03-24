import { allRoles, getFormattedRole } from '@/utils/formatter';
import { Select } from 'flowbite-react';

export default function UserRoleSelect(props: {
	value?: string | null;
	onChange?: (roleId: string | null) => void;
	disabled?: boolean;
	color?: string;
	helperText?: string;
}) {
	return (
		<Select
			value={props.value ?? ''}
			onChange={(e) => props.onChange?.(e.target.value || null)}
			disabled={props.disabled}
			color={props.color}
			helperText={props.helperText}
		>
			<option value=""></option>
			{allRoles.map((p) => (
				<option key={p} value={p}>
					{getFormattedRole(p)}
				</option>
			))}
		</Select>
	);
}
