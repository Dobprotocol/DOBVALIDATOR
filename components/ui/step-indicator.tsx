export function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex justify-center items-center space-x-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              index + 1 === currentStep
                ? "bg-[#6366F1] text-white"
                : index + 1 < currentStep
                  ? "bg-[#6366F1]/20 text-[#6366F1]"
                  : "bg-gray-100 text-gray-400"
            }`}
          >
            {index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div className={`h-1 w-12 ${index + 1 < currentStep ? "bg-[#6366F1]" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  )
}
