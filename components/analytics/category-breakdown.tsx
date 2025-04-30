import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TaskCategoryStats } from "@/lib/utils/analytics-helpers"

interface CategoryBreakdownProps {
  categories: TaskCategoryStats[]
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  // Array of tailwind colors for the bars
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
  ]

  // Calculate total for percentage
  const total = categories.reduce((sum, category) => sum + category.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.length === 0 ? (
            <p className="text-center text-muted-foreground">No categories found</p>
          ) : (
            categories.map((category, index) => (
              <div key={category.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{category.category}</span>
                  <span className="text-muted-foreground">{Math.round((category.count / total) * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${colors[index % colors.length]}`}
                    style={{ width: `${(category.count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
