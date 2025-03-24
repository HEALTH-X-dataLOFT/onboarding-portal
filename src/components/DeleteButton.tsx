import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import React from 'react';

export default function DeleteButton(props: {
	title: React.ReactNode;
	description: React.ReactNode;
	onDelete: () => void;
	disabled: boolean;
}) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon" disabled={props.disabled}>
					<span className="sr-only">Delete</span>
					<Trash2 />
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>{props.title}</DialogTitle>
					<DialogDescription>{props.description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Cancel
						</Button>
					</DialogClose>
					<Button type="submit" variant="destructive" onClick={props.onDelete}>
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
