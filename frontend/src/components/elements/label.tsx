interface LabelProps {
  htmlFor: string;
  labelName: string;
  required?: boolean;
  additionalClassNames?: string;
}

export default function Label({
    htmlFor,
    labelName,
    required=false,
    additionalClassNames=""
}: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={`${additionalClassNames} mb-2 block font-medium text-gray-700`}>
        {labelName} {required && <span className="text-orange-400">*</span>}
    </label>
  );
}