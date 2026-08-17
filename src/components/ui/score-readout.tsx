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
    <div className={cn("flex items-center space-x-8", className)} {...props}>
      <div className="relative">
        <div className="relative flex flex-col items-center justify-center p-8 bg-panel border-2 border-black rounded-lg shadow-comic">
          <div className="text-mist text-xs font-mono uppercase tracking-widest mb-2">Overall Score</div>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-6xl text-fog font-bold">{score}</span>
            <span className="font-mono text-3xl text-mist/50">/ 100</span>
          </div>
          <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white text-xl font-bold font-serif border border-zinc-700">
            {grade}
          </div>
        </div>
      </div>
      {streak !== undefined && (
        <div className="flex flex-col justify-center h-full">
          <div className="text-sm text-zinc-950/80 mb-1 font-serif">Security streak</div>
          <div className="text-xl font-mono font-bold text-zinc-950">{streak} days</div>
        </div>
      )}
    </div>
  )
}
