import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { QuizQuestion as QuizQuestionType } from "@/types/database";

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer: number | null;
  onSelectAnswer: (answerIndex: number) => void;
  showResult?: boolean;
}

export function QuizQuestion({
  question,
  selectedAnswer,
  onSelectAnswer,
  showResult = false,
}: QuizQuestionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">{question.question_text}</h3>

      <RadioGroup
        value={selectedAnswer?.toString() ?? ""}
        onValueChange={(value) => onSelectAnswer(parseInt(value))}
        disabled={showResult}
      >
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isCorrect = index === question.correct_answer_index;
            const isSelected = index === selectedAnswer;

            return (
              <div
                key={index}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-xl border transition-colors",
                  showResult && isCorrect
                    ? "border-success bg-success-50"
                    : showResult && isSelected && !isCorrect
                    ? "border-error bg-error-50"
                    : isSelected
                    ? "border-primary bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <RadioGroupItem
                  value={index.toString()}
                  id={`option-${index}`}
                  className={cn(
                    showResult && isCorrect && "border-success text-success",
                    showResult && isSelected && !isCorrect && "border-error text-error"
                  )}
                />
                <Label
                  htmlFor={`option-${index}`}
                  className={cn(
                    "flex-1 cursor-pointer text-sm",
                    showResult && isCorrect && "text-success font-medium",
                    showResult && isSelected && !isCorrect && "text-error"
                  )}
                >
                  {option}
                </Label>
              </div>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}
