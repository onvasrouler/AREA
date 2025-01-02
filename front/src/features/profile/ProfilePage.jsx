import { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { getApiClient } from "@/common/client/APIClient"
import AreaLogo from "../../assets/AREA.png";
import { useNavigate } from "react-router-dom";

export function ProfilePage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const apiClient = getApiClient();
  const navigate = useNavigate();

  const fetchUserData = async () => {
    const session = localStorage.getItem('session');
    if (session) {
      try {
        const response = await apiClient.get("profile_info", {
          session: session
        });
        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
          setEmail(data.data.email);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      console.error('No session found');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = async () => {
    try {
      const session = localStorage.getItem('session');
      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Session': session
          }
        });
        if (response.ok) {
          localStorage.removeItem('session');
          navigate('/login');
        } else {
          console.error('Failed to logout');
        }
      } else {
        console.error('No session found');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleProfileEdit = async () => {
    try {
      const session = localStorage.getItem('session');
      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Session': session
          }
        })
        if (response.ok) {
          console.log('Profile edited successfully');
        } else {
          console.error('Failed to edit profile');
        }
      } else {
        console.error('No session found');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    console.log('Profile edit submitted');
  };

  const handleProfileDeletion = () => {
    // Implement profile deletion logic here
    console.log('Profile deletion requested');
  };

  const handleLogoutAllDevices = async () => {
    try {
      const session = localStorage.getItem('session');
      console.log('Session:', session);
      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}logouteverywhere`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Session': session
          }
        })
        localStorage.removeItem('session');
        if (response.ok) {
          navigate('/login');
        } else {
          console.error('Failed to logout from all devices');
        }
      } else {
        console.error('No session found');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16 relative">
        <div className="flex items-center">
          <img src={AreaLogo} alt="AREA Logo" className="w-8 h-8 mr-2" />
          <h1 className="text-lg font-semibold">Profile</h1>
        </div>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarFallback>
                  <FaUser />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <div className="text-center">
                  <DropdownMenuItem className="focus:bg-primary focus:text-primary-foreground cursor-pointer" onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-primary focus:text-primary-foreground cursor-pointer" onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-primary focus:text-primary-foreground cursor-pointer" onClick={() => handleLogout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='flex items-center justify-center mt-8'>
        <Card className="w-full max-w-4xl shadow-lg rounded-md">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="flex space-x-4">
                <TabsTrigger
                  value="account"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Services
                </TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
                </form>
              </TabsContent>
              <TabsContent value="security">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm your new password"
                    />
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="services">
                <p>Services</p>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between mt-6">
              <Button onClick={handleProfileEdit} className="mr-2">Save Changes</Button>
              <Button onClick={handleLogoutAllDevices} variant="outline">Logout from All Devices</Button>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-4">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleProfileDeletion}>Delete Account</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
