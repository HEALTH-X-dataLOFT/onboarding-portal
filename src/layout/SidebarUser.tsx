import { CircleEllipsis } from 'lucide-react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import SignOutButton from '@/layout/SignOutButton';
import UserDetails from '@/feature/user/components/UserDetails';
import { useSessionData } from '@/hooks/auth/useSessionData';

export function NavUser() {
	const session = useSessionData();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<UserDetails
								name={session?.user?.name}
								email={session?.user?.email}
							/>
							<CircleEllipsis className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={'right'}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<UserDetails
								name={session?.user?.name}
								email={session?.user?.email}
							/>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<SignOutButton />
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
