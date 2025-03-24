import { useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import { environmentContext } from '@/providers/EnvironmentProvider';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ProvideDialog = dynamic(() => import('./ProvideDialog'), {
	ssr: false,
});

export default function ProvideSelfDescriptionButton() {
	const { federatedCatalogUrl } = useContext(environmentContext);
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Provide</Button>
			</DialogTrigger>
			<ProvideDialog
				catalogURL={federatedCatalogUrl}
				onSuccess={() => setOpen(false)}
			/>
		</Dialog>
	);
}
