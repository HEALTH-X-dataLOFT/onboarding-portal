export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<div className="grid min-h-svh lg:grid-cols-2">
				<div className="relative hidden bg-muted lg:block">
					<img
						src="/placeholder.svg"
						alt="Image"
						className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
					/>
				</div>
				<div className="p-6 md:p-10 max-h-dvh overflow-auto">{children}</div>
			</div>
		</>
	);
}
