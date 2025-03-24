import { Building2, Handshake, ScrollText, User2 } from 'lucide-react';

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavUser } from './SidebarUser';

import { useHasPermissionForRoute } from '@/hooks/auth/useHasPermissionForRoute';
import SidebarEntry from './SidebarEntry';

const items = [
	{
		title: 'Participants',
		url: '/admin/participant',
		icon: Building2,
	},
	{
		title: 'Self Descriptions',
		url: '/admin/self-descriptions',
		icon: ScrollText,
	},
	{
		title: 'Users',
		url: '/admin/user',
		icon: User2,
	},
	{
		title: 'Onboarding Requests',
		url: '/admin/management',
		icon: Handshake,
	},
];

export function AppSidebar() {
	const hasPermissionForRoute = useHasPermissionForRoute();

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="m-2">
					<img
						src="/images/health_x_logo.webp"
						alt="Health-X Logo"
						className="h-10"
					/>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Administration</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items
								.filter((item) => hasPermissionForRoute(item.url))
								.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarEntry url={item.url}>
											<a href={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</a>
										</SidebarEntry>
									</SidebarMenuItem>
								))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<div>
					<NavUser />
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
