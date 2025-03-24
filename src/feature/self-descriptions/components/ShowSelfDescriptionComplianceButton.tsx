import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { FileCheck } from 'lucide-react';
import { getSelfDescriptionCompliance } from '../actions';
import { useQuery } from '@tanstack/react-query';
import ViewDialog from '@/components/JsonDisplayDialog';
import { useState } from 'react';

export default function ShowSelfDescriptionComplianceButton(props: {
	sdHash: string;
}) {
	const [open, setOpen] = useState(false);

	const { data: compliance } = useQuery({
		queryKey: ['compliance', props.sdHash],
		enabled: open,
		async queryFn() {
			return JSON.parse(await getSelfDescriptionCompliance(props.sdHash));
		},
	});

	return (
		<Dialog onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<span className="sr-only">Compliance</span>
					<FileCheck />
				</Button>
			</DialogTrigger>

			{/* TODO proper loading / error handling */}
			{!!compliance && <ViewDialog title="Compliance" json={compliance} />}
		</Dialog>
	);
}
