interface FormFieldErrorProps {
  message?: string;
}

export default function FormFieldError({ message }: FormFieldErrorProps) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}
