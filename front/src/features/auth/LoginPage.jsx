'use client'

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

  const onSubmit = async (values) => {
    console.log(values)
    if (isLogin) {
      await submitLogin(values)
    } else {
      await submitUserCreation(values)
    }
  }

  const handleForgotPassword = async (values) => {
    console.log(values)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Login" : "Sign Up"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your credentials to access your account"
              : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <>
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
                </>
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
    </div>
  )
}