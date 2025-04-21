import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Register - Museum Ticketing',
  description: 'Create an account for the museum ticketing system',
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <RegisterForm />
    </div>
  );
} 