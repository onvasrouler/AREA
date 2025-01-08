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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ServicesInfos from "@features/ServicesInfos"

export function ProfilePage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [activeTab, setActiveTab] = useState('account');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loggedInServices, setLoggedInServices] = useState([]);
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
          setLoggedInServices({
            discord: data.data.logged_in_discord,
            github: data.data.logged_in_github,
          });
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
  }, []);

  const handleLogout = async () => {
    try {
      const session = localStorage.getItem('session');
      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'session': session
          }
        });
        if (response.ok) {
          localStorage.removeItem('session');
          navigate('/login');
        } else {
          console.error('Failed to logout');
        }
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
            'session': session
          },
          body: JSON.stringify({
            username,
            email
          })
        });
        if (response.ok) {
          console.log('Profile edited successfully');
        } else {
          console.error('Failed to edit profile');
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (newPassword !== confirmNewPassword) {
        console.error('Passwords do not match');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}resetpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken: resetToken,
          newPassword: newPassword,
        }),
      });

      if (response.ok) {
        console.log('Password changed successfully');
        setShowPasswordFields(false);
        setResetToken('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        console.log(response);
        console.error('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleRequestPasswordChange = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });
      if (response.ok) {
        setShowPasswordFields(true);
        console.log('Password change request sent');
      } else {
        console.error('Failed to request password change');
      }
    } catch {
      console.error('Error requesting password change');
    }
  };

  const handleProfileDeletion = () => {
    console.log('Profile deletion requested');
  };

  const handleLogoutAllDevices = async () => {
    try {
      const session = localStorage.getItem('session');
      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}logouteverywhere`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'session': session
          }
        });
        localStorage.removeItem('session');
        if (response.ok) {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveChanges = () => {
    if (activeTab === 'security') {
      handlePasswordChange();
    } else {
      handleProfileEdit();
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
                <DropdownMenuItem
                  className="focus:bg-primary focus:text-primary-foreground cursor-pointer"
                  onClick={() => navigate("/dashboard")}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="focus:bg-primary focus:text-primary-foreground cursor-pointer"
                  onClick={handleLogout}
                >
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
            <Tabs
              defaultValue="account"
              className="w-full"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="flex space-x-4 bg-white">
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
                <div className="flex justify-center mb-6">
                  <Button onClick={handleRequestPasswordChange}>
                    Request password change
                  </Button>
                </div>
                {showPasswordFields && (
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    <div className="space-y-2 flex justify-center">
                      A reset token has been sent to your email. Please enter it below.
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resetToken">Reset Token</Label>
                      <Input
                        id="resetToken"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder="Enter the received reset token"
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
                )}
              </TabsContent>
              <TabsContent value="services">
                <Table>
                  <TableCaption>Your connected services</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ServicesInfos.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {service.name}
                          </div>
                        </TableCell>
                        <TableCell>{service.description}</TableCell>
                        <TableCell>
                          {loggedInServices[service.name.toLowerCase()] ? (
                            <span className="text-green-600">Connected</span>
                          ) : (
                            <span className="text-red-600">Not Connected</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between mt-6">
              <Button onClick={handleSaveChanges} className="mr-2">
                Save Changes
              </Button>
              <Button onClick={handleLogoutAllDevices} variant="outline">
                Logout from all devices
              </Button>
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

