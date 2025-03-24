import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/layout/AppSidebar';

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="p-4">{children}</main>
		</SidebarProvider>
	);
}
