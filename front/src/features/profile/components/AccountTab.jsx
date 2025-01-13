import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";

export function AccountTab({
  username,
  email,
  setUsername,
  setEmail,
  handleSaveChanges,
  handleLogoutAllDevices,
  handleProfileDeletion
}) {
  const [deletePassword, setDeletePassword] = useState("");
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [confirmationToken, setConfirmationToken] = useState("");
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await handleProfileDeletion(deletePassword);
      setDeletePassword("");
      setShowTokenDialog(true);
    } catch (error) {
      console.error('Error initiating profile deletion:', error);
    }
  };

  const handleConfirmDeletion = async () => {
    try {
      const session = localStorage.getItem('session');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}profile/confirm`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'session': session
        },
        body: JSON.stringify({
          token: confirmationToken
        })
      });

      if (response.ok) {
        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted",
          variant: "default",
        });
        localStorage.removeItem('session');
        window.location.href = '/login';
      } else {
        toast({
          title: "Account deletion failed",
          description: "An error occurred while trying to delete your account",
          variant: "destructive",
        });
        console.error('Failed to confirm profile deletion');
      }
    } catch (error) {
      console.error('Error confirming profile deletion:', error);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      onSubmit={(e) => e.preventDefault()}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </div>

      <motion.div
        className="space-y-4 pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleSaveChanges} className="mr-2">
              Save Changes
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleLogoutAllDevices}>
              Logout from all devices
            </Button>
          </motion.div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button aria-label="Delete Account" className="w-full bg-red-700">
                Delete Account
              </Button>
            </motion.div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="deletePassword">Please enter your password to confirm</Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletePassword("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Account Deletion</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  Please enter the confirmation token sent to your email address.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="confirmationToken">Confirmation Token</Label>
                  <Input
                    id="confirmationToken"
                    value={confirmationToken}
                    onChange={(e) => setConfirmationToken(e.target.value)}
                    placeholder="Enter confirmation token"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setShowTokenDialog(false);
                setConfirmationToken("");
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeletion}>
                Confirm Account Deletion
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </motion.form>
  );
}

