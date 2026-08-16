import * as React from "react"
import { cn } from "@/lib/utils"

interface ScoreReadoutProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  streak?: number;
}

export function ScoreReadout({ score, streak, className, ...props }: ScoreReadoutProps) {
  const getScoreGrade = (s: number) => {
    if (s >= 90) return "A";
    if (s >= 80) return "B";
    if (s >= 70) return "C";
    if (s >= 60) return "D";
    return "F";
  };

  const grade = getScoreGrade(score);

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)} {...props}>
      <div className="flex items-start space-x-6">
        <div className="flex flex-col border border-mist/20 bg-panel rounded-lg px-8 py-6 items-center shadow-lg">
          <div className="text-mist text-sm font-medium uppercase tracking-wider mb-2 font-sans">Score</div>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-6xl text-fog">{score}</span>
            <span className="font-mono text-4xl text-mist/50">/ 100</span>
          </div>
          <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-mist/10 text-xl font-bold text-scanline font-sans">
            {grade}
          </div>
        </div>
        {streak !== undefined && (
          <div className="flex flex-col justify-center h-full">
            <div className="text-sm text-mist mb-1 font-sans">streak</div>
            <div className="text-lg font-mono text-clear">{streak} days</div>
          </div>
        )}
      </div>
    </div>
  )
}
