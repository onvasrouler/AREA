import { AlertCircle, Car } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-gray-100 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>
            <Input
              type="email"
              placeholder="example@email.com"
            />
          </div>
          <div className="space-y-2 relative">
          <Label htmlFor="password">
              Password
            </Label>
            <Input
              type="password"
              placeholder="Enter your password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <p className="text-center mb-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
          <Button type="submit" className="w-full py-2 sm:py-3">
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
