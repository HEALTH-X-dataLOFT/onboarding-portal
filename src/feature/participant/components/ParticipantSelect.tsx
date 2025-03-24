import { useGetParticipants } from '@/generated';
import { useAuthentication } from '@/hooks/query/useAuthentication';
import { getNameOfParticipant } from '@/utils/formatter';
import { Select } from 'flowbite-react/components/Select';

export default function ParticipantSelect(props: {
	value?: string | null;
	onChange?: (participantId: string | null) => void;
	disabled?: boolean;
	color?: string;
	helperText?: string;
}) {
	const { data, isPending, isError } = useAuthentication(useGetParticipants)();

	if (isPending) {
		return <p>Loading...</p>;
	}

	if (isError) {
		return <p>Error...</p>;
	}

	return (
		<Select
			value={props.value ?? ''}
			onChange={(e) => props.onChange?.(e.target.value || null)}
			disabled={props.disabled}
			color={props.color}
			helperText={props.helperText}
		>
			<option value=""></option>
			{data?.items?.map((p) => (
				<option key={p.id} value={p.id}>
					{getNameOfParticipant(p)}
				</option>
			))}
		</Select>
	);
}
