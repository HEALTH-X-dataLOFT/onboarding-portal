'use client';

import {
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Editor } from '@monaco-editor/react';
import { VerifiableCredential } from '@gaia-x/json-web-signature-2020';

export default function ViewDialog(props: {
	title: string;
	json: VerifiableCredential;
	onEdit?: () => void;
}) {
	return (
		<DialogContent className="sm:max-w-md min-w-full md:min-w-[80%]">
			<DialogHeader>
				<DialogTitle>{props.title}</DialogTitle>
			</DialogHeader>

			<div className="flex items-center space-x-2">
				<Editor
					value={JSON.stringify(props.json!, null, 4)}
					language="json"
					options={{
						readOnly: true,
					}}
					className="h-96 w-full"
				/>
			</div>

			<DialogFooter className="sm:justify-end">
				<DialogClose asChild>
					<Button type="button" variant="secondary">
						Close
					</Button>
				</DialogClose>
				{props.onEdit && <Button onClick={props.onEdit}>Edit</Button>}
			</DialogFooter>
		</DialogContent>
	);
}
