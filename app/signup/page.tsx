import { SignUpForm } from "@/components/auth/sign-up-form"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold">Tickle</h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
