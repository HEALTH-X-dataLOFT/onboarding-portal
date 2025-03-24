import { getNotaryUrls } from './actions';
import RegisterForm from './RegisterForm';

export const dynamic = 'force-dynamic';

export default async function Page() {
	const notarizationUrls = await getNotaryUrls();

	// const [state, formAction] = useFormState(registerUser, {});
	return <RegisterForm notarizationUrls={notarizationUrls} />;
}
