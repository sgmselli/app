interface StepsProps {
  steps: number;       // total steps
  currentStep: number; // which step is active (1-based index)
}

export default function Steps({ steps, currentStep }: StepsProps) {
  return (
    <div className="flex w-full items-center px-6 gap-4">
      {Array.from({ length: steps }, (_, i) => {
        const stepIndex = i + 1;
        const isActive = stepIndex <= currentStep;

        return (
          <div
            key={i}
            className={`h-[4px] flex-1 transition-all duration-300 rounded-xl
              ${isActive ? "bg-[#FF0033]" : "bg-red-50"}`}
          />
        );
      })}
    </div>
  )
};
