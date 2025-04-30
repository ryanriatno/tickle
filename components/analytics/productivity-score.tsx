import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProductivityScoreProps {
  score: number
}

export function ProductivityScore({ score }: ProductivityScoreProps) {
  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-blue-500"
    if (score >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  // Determine message based on score
  const getScoreMessage = () => {
    if (score >= 80) return "Excellent productivity!"
    if (score >= 60) return "Good progress!"
    if (score >= 40) return "Making progress."
    return "Room for improvement."
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Productivity Score</CardTitle>
        <CardDescription>Based on completed tasks and pomodoros</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className={`text-5xl font-bold ${getScoreColor()}`}>{score}%</div>
          <Progress value={score} className="w-full" />
          <p className="text-sm text-muted-foreground">{getScoreMessage()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
