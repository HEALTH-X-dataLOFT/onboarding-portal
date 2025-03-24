export function downloadFile(
	pemString: string,
	filename: string,
	mimeType: string,
) {
	const blob = new Blob([pemString], { type: mimeType });
	const url = URL.createObjectURL(blob);

	return fetch(url)
		.then((response) => response.blob())
		.then((blob) => {
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = filename;
			a.click();
			URL.revokeObjectURL(a.href);
		});
}
