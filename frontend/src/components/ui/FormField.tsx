import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
	label: string,
	name: string
};

// Label + input row for the two-column forms. id mirrors name so label clicks focus the input.
export function FormField({ label, name, ...inputProps }: FormFieldProps) {

	return (
		<>
			<label htmlFor={name} className="text-lg mb-2">{label}</label>
			<input id={name} name={name} className="purple-input-box" {...inputProps} />
		</>
	);
}

export default FormField;
