type FormErrorProps = {
	message: string | null
};

// Red error box for form validation and save errors; renders nothing when there's no message
export function FormError({ message }: FormErrorProps) {

	if (!message) return null;

	return (
		<div role="alert" className="mt-5 rounded-lg border border-red-800/60 bg-red-950/40 px-4 py-3 text-red-300">
			{message}
		</div>
	);
}

export default FormError;
