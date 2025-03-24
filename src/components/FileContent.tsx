import { FileInput, FileInputProps } from 'flowbite-react';
import { RefAttributes, useEffect, useState } from 'react';

export default function FileContent(
	props: {
		onChange: (value: string) => void;
	} & Omit<FileInputProps & RefAttributes<HTMLInputElement>, 'onChange'>,
) {
	const [file, setFile] = useState<File | undefined>();
	const { onChange } = props;

	useEffect(() => {
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				onChange(e.target!.result);
			};
			reader.readAsText(file);
		}
	}, [file, onChange]);

	return (
		<FileInput {...props} onChange={(e) => setFile(e.target.files?.[0])} />
	);
}
