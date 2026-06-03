import { Logo } from '@/components/atoms/Logo'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
      <div className="mb-8">
        <Logo />
      </div>
      <h1 className="mb-6 text-3xl font-extrabold">Create your account</h1>
      <RegisterForm />
    </div>
  )
}
