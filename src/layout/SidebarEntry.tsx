'use client';

import { SidebarMenuButton } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function SidebarEntry(props: {
	url: string;
	children: ReactNode;
}) {
	const pathname = usePathname();

	return (
		<SidebarMenuButton asChild isActive={pathname.startsWith(props.url)}>
			{props.children}
		</SidebarMenuButton>
	);
}
