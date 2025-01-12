import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function PasswordResetComponent() {
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [showResetTokenDialog, setShowResetTokenDialog] = useState(false);
  const { toast } = useToast();

  const forgotPasswordForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetPasswordForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      resetToken: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleForgotPassword = async (values) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });

      if (response.ok) {
        toast({
          title: "Reset Link Sent",
          description: "Check your email for instructions to reset your password.",
          variant: "default",
        });
        setShowForgotPasswordDialog(false);
        setShowResetTokenDialog(true);
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "Request Failed",
          description: data.message || "Unable to process password reset request.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "System Error",
        description: "Unable to connect to the server. Please try again later.",
      });
    }
  };

  const handleResetPassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "The passwords you entered don't match. Please try again.",
      });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}resetpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken: values.resetToken,
          newPassword: values.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully reset. You can now log in.",
          variant: "default",
        });
        setShowResetTokenDialog(false);
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "Reset Failed",
          description: data.message || "Invalid or expired reset token.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "System Error",
        description: "Unable to connect to the server. Please try again later.",
      });
    }
  };

  return (
    <>
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogTrigger asChild>
          <Button variant="link" onClick={() => setShowForgotPasswordDialog(true)}>Forgot Password?</Button>
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

      <Dialog open={showResetTokenDialog} onOpenChange={setShowResetTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
            <DialogDescription>
              Enter the reset token you received via email and your new password.
            </DialogDescription>
          </DialogHeader>
          <Form {...resetPasswordForm}>
            <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <FormField
                control={resetPasswordForm.control}
                name="resetToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reset Token</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your reset token" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetPasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetPasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your new password" {...field} />
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
    </>
  );
}
