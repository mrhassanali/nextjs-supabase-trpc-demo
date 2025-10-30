import { Loader2 } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start px-2">
      <div className="bg-emerald-50 text-emerald-900 dark:bg-emerald-900/10 dark:text-emerald-100 max-w-[72%] rounded-tr-lg rounded-br-lg rounded-tl-lg p-3">
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium">Assistant</div>
          <div className="flex space-x-1">
            <span className="animate-bounce">•</span>
            <span className="animate-bounce [animation-delay:0.2s]">•</span>
            <span className="animate-bounce [animation-delay:0.4s]">•</span>
          </div>
        </div>
      </div>
    </div>
  );
}