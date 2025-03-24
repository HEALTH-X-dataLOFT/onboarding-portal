import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function UserDetails({
	name,
	email,
}: {
	name?: string | null;
	email?: string | null;
}) {
	const initials = name
		?.split(' ')
		.map((sub) => sub[0])
		.filter(Boolean)
		.join('')
		.toLocaleUpperCase();

	return (
		<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
			<Avatar className="h-8 w-8 rounded-lg">
				<AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
			</Avatar>
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-semibold">{name}</span>
				<span className="truncate text-xs">{email}</span>
			</div>
		</div>
	);
}
