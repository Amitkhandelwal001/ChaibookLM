import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/signup" className="ml-1 text-primary hover:underline font-medium">
          Sign up
        </Link>
      </CardFooter>
    </Card>
  );
};
