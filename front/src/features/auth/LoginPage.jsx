'use client'

import AreaLogo from "../../assets/AREA.png"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getApiClient } from "@/common/client/APIClient";
import { useNavigate } from "react-router-dom"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signUpSchema = loginSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
})

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const form = useForm({
    resolver: zodResolver(isLogin ? loginSchema : signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(isLogin ? {} : { username: "" }),
    },
  })

  const forgotPasswordForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const confirmRegistrationForm = useForm({
    defaultValues: {
      token: '',
    },
  })

  const apiClient = getApiClient()

  const navigate = useNavigate()

  const submitLogin = async (values) => {
    try {
      console.log("Attempting to log in with:", values);
      const response = await apiClient.post("api/auth/login", {
        email: values.email,
        password: values.password,
      });
      if (response.status === 200 || response.status === 201) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
          console.log(data.token);
          console.log("Logged in successfully");
          window.location.href = "/notes";
        }
      } else {
        console.error("Failed to log in:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("An error occurred during login:", error.message || error);
    }
  };

  const submitUserCreation = async (values) => {
    try {
      console.log("Creating user with values:", values);

      const response = await apiClient.post("api/users/register", {
        email: values.email,
        password: values.password,
        name: values.name,
        surname: values.surname,
        username: values.username.startsWith("@") ? values.username : "@" + values.username,
      });

      if (response.status === 201) {
        console.log("User created successfully. Logging in...");

        const responseLogin = await apiClient.post("api/auth/login", {
          email: values.email,
          password: values.password,
        });

        if (responseLogin.status === 200 || responseLogin.status === 201) {
          const data = await responseLogin.json();
          if (data.token) {
            localStorage.setItem("token", data.token);
            console.log("Logged in successfully after user creation");
            window.location.href = "/notes";
          } else {
            console.error("No token received after user creation");
          }
        } else {
          console.error("Login failed after user creation:", responseLogin.status, responseLogin.statusText);
        }
      } else {
        console.error("Failed to create user:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("An error occurred during user creation:", error.message || error);
    }
  };

  const onSubmit = async (data) => {
    if (!isLogin) {
      const response = await apiClient.post("register", {
        email: data.email,
        password: data.password,
        username: data.username,
      })

      if (response.status === 200) {
        setRegisteredEmail(data.email)
        setShowConfirmDialog(true)
      }
    } else {
      // Handle login logic here
    }
  }

  const handleForgotPassword = async (values) => {
    console.log(values)
  }

  const handleConfirmRegistration = (data) => {
    // Handle confirm registration logic here
    console.log('Confirm registration with token:', data.token)
    //close dialog
    //login request
    //redirect to /dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <img src={AreaLogo} alt="AREA Logo" className="w-24 h-24" />
            <h2 className="text-[50px] font-bold text-center">AREA</h2>
          </div>
          <CardTitle className="text-center">{isLogin ? "Login" : "Sign Up"}</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Enter your credentials to access your account" : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {isLogin ? "Login" : "Sign Up"}
              </Button>
              <Button
                type="button"
                className="w-full flex items-center justify-center"
                onClick={() => handleOAuthLogin("google")}
              >
                <img
                  src="src/assets/google.png"
                  alt="Google logo"
                  className="w-5 h-5 mr-2"
                />
                {isLogin ? "Login with Google" : "Sign Up with Google"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            variant="link"
            className="w-full"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Button>
          {isLogin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="w-full">
                  Forgot Password?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Forgot Password</DialogTitle>
                  <DialogDescription>
                    Enter your email address to reset your password.
                  </DialogDescription>
                </DialogHeader>
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                    <FormField
                      control={forgotPasswordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" className="w-full">
                        Reset Password
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your registration</DialogTitle>
            <DialogDescription>
              Check your mailbox and enter the token sent to {registeredEmail}
            </DialogDescription>
          </DialogHeader>
          <Form {...confirmRegistrationForm}>
            <form onSubmit={confirmRegistrationForm.handleSubmit(handleConfirmRegistration)} className="space-y-4">
              <FormField
                control={confirmRegistrationForm.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your token" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="w-full">
                  Submit Token
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
