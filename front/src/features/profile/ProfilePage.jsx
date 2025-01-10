import { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { LogOut, LayoutDashboard, Settings, RefreshCcw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { Footer } from "@features/dashboard/components/Footer"
import { motion, AnimatePresence } from "framer-motion"

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
  const [serviceExpirations, setServiceExpirations] = useState({});

  const fetchUserData = async () => {
    const session = localStorage.getItem('session');
    if (session) {
      try {
        const response = await apiClient.get('profile_info', {
          session: session,
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setUsername(data.data.username);
          setEmail(data.data.email);
          const expirations = {
            discord: data.data.logged_in_discord && data.data.discord_expire_at
              ? new Date(data.data.discord_expire_at).toLocaleString()
              : "N/A",
            github: data.data.logged_in_github && data.data.github_expire_at
              ? new Date(data.data.github_expire_at).toLocaleString()
              : "N/A",
            spotify: data.data.logged_in_spotify && data.data.spotify_expire_at
              ? new Date(data.data.spotify_expire_at).toLocaleString()
              : "N/A",
          };
          const loggedIn = {
            discord: data.data.logged_in_discord && data.data.discord_expire_at
              ? new Date(data.data.discord_expire_at) > new Date()
              : false,
            github: data.data.logged_in_github && data.data.github_expire_at
              ? new Date(data.data.github_expire_at) > new Date()
              : false,
            spotify: data.data.logged_in_spotify && data.data.spotify_expire_at
              ? new Date(data.data.spotify_expire_at) > new Date()
              : false,
          };
          setLoggedInServices(loggedIn);
          setServiceExpirations(expirations);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full px-4 sm:px-6 lg:px-8 bg-primary text-white"
      >
        <div className="flex items-center justify-between h-16 relative">
          <div className="flex items-center">
            <img src={AreaLogo} alt="AREA Logo" className="w-8 h-8 mr-2" />
            <h1 className="text-2xl font-bold">AREA</h1>
          </div>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center">
            <Settings className="mr-2 h-6 w-6" />
            <span className="text-2xl font-bold">Settings</span>
          </div>
          <div className="flex items-center bg-primary text-white">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="rounded-full">
                  <FaUser className="h-8 w-8" />
                </Button>
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
      </motion.div>

      <motion.main 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex-grow container mx-auto px-4 py-8"
      >
        <div className="max-w-4xl mx-auto">
          <Tabs
            defaultValue="account"
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <TabsList className="flex space-x-4 bg-white justify-center w-full">
                <TabsTrigger
                  value="account"
                  className="data-[state=inactive]:text-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=inactive]:text-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="data-[state=inactive]:text-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Services
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <div className="mt-6">
              <AnimatePresence>
                <TabsContent key="account" value="account">
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
                            <Button variant="destructive" className="w-full">
                              Delete Account
                            </Button>
                          </motion.div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account
                              and remove your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleProfileDeletion}>
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </motion.div>
                  </motion.form>
                </TabsContent>
                <TabsContent key="security" value="security">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-center">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button onClick={handleRequestPasswordChange} className="mt-10">
                          Request password change
                        </Button>
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {showPasswordFields && (
                        <motion.form
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          onSubmit={(e) => e.preventDefault()}
                          className="space-y-4"
                        >
                          <div className="text-center">
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
                          <div className='flex justify-center'>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button onClick={handleSaveChanges} className="mr-2 ">
                                Save Changes
                              </Button>
                            </motion.div>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </TabsContent>
                <TabsContent key="services" value="services">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Table>
                      <TableCaption>Your connected services</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Token expiration date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Refresh </TableHead>
                          <TableHead>Disconnect</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {ServicesInfos.map((service, index) => (
                            <motion.tr
                              key={service.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.2, delay: index * 0.1 }}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  {service.name}
                                </div>
                              </TableCell>
                              <TableCell>{service.description}</TableCell>
                              <TableCell>{serviceExpirations[service.name.toLowerCase()] || 'N/A'}</TableCell>
                              <TableCell>
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className={
                                    loggedInServices[service.name.toLowerCase()]
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {loggedInServices[service.name.toLowerCase()]
                                    ? "Connected"
                                    : serviceExpirations[service.name.toLowerCase()] !== "N/A" &&
                                      new Date(serviceExpirations[service.name.toLowerCase()]) <= new Date()
                                      ? "Token Expired"
                                      : "Not Connected"}
                                </motion.span>
                              </TableCell>
                              <TableCell>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                  <Button variant="icon">
                                    <RefreshCcw />
                                  </Button>
                                </motion.div>
                              </TableCell>
                              <TableCell>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                  <Button variant="destructive">Disconnect</Button>
                                </motion.div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </motion.main>
      <Footer />
    </motion.div>
  );
}
