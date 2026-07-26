import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SignupForm } from '../components/SignupForm';

export const SignupPage = () => {
  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your details to get started with KitbookLM</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="ml-1 text-primary hover:underline font-medium">
          Log in
        </Link>
      </CardFooter>
    </Card>
  );
};
