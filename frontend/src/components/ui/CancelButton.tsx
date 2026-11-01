import { Link } from "react-router";

type CancelButtonProps = {
	to: string
};

// Leaves a form without saving. Takes an explicit destination so it works even when the page was opened directly.
export function CancelButton({ to }: CancelButtonProps) {

	return <Link to={to} className="ghost-btn">Cancel</Link>;
}

export default CancelButton;
