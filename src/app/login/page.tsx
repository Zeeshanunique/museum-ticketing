import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login - Museum Ticketing',
  description: 'Login to access the museum ticketing dashboard',
};

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <LoginForm />
    </div>
  );
} 