interface TextareaProps {
  id: string;
  value: string | null;
  placeholder: string;
  required?: boolean;
  onChange: (text: string) => void;
  additionalClassNames?: string;
  error?: string | null;
  disabled?: boolean;
}

export default function Textarea({
  id,
  value,
  placeholder,
  required,
  onChange,
  additionalClassNames = "",
  error = null,
  disabled = false
}: TextareaProps) {
  return (
    <>
      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`textarea textarea-lg w-full rounded-lg min-h-[150px] resize-none 
          bg-base-200 !text-[14px] font-medium 
          focus:outline-none focus:bg-white 
          ${!!error ? "border-error focus:border-error" : "focus:border-2"} 
          ${additionalClassNames}`}
      />
      {!!error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </>
  );
}