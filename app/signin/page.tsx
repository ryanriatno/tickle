import { SignInForm } from "@/components/auth/sign-in-form"
import { AuthDebug } from "@/components/auth/auth-debug"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold">Tickle</h1>
          <p className="text-muted-foreground">Pomodoro Timer with Task Management</p>
        </div>
        <SignInForm />
        <AuthDebug />
      </div>
    </div>
  )
}
