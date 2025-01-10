import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getApiClient } from "@/common/client/APIClient";
import { useNavigate } from "react-router-dom";
import ServicesInfos from "@features/ServicesInfos";
import { Footer } from "@features/dashboard/components/Footer";
import { Header } from './components/Header';
import { AccountTab } from './components/AccountTab';
import { SecurityTab } from './components/SecurityTab';
import { ServicesTab } from './components/ServicesTab';

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

  const handleLogoutFromServices = async (serviceName) => {
    try {
      const session = localStorage.getItem('session');
      if (session) {
        let apiEndpoint = `logout/${serviceName}`;
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${apiEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'session': session
          }
        });
        if (response.ok) {
          console.log(`Successfully disconnected from ${serviceName}`);
          setLoggedInServices((prev) => ({
            ...prev,
            [serviceName]: false,
          }));
        } else {
          console.error(`Failed to disconnect from ${serviceName}`);
        }
      }
    } catch (error) {
      console.error('Error disconnecting from service:', error);
    }
  };

  const handleRefreshServicesTokens = async (serviceName) => {
    try {
      const session = localStorage.getItem('session');
      if (session) {
        let apiEndpoint = `auth/refresh/${serviceName}`;
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${apiEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'session': session,
          },
        });
        console.log(response);
        if (response.ok) {
          console.log(`Token for ${serviceName} refreshed successfully`);
          const refreshedToken = await response.json();
          setServiceExpirations((prev) => ({
            ...prev,
            [serviceName]: new Date(refreshedToken.expire_at).toLocaleString(),
          }));
        } else {
          console.error(`Failed to refresh token for ${serviceName}`);
        }
      }
    } catch (error) {
      console.error('Error refreshing service token:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
    >
      <Header handleLogout={handleLogout} navigate={navigate} />

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
                  <AccountTab
                    username={username}
                    email={email}
                    setUsername={setUsername}
                    setEmail={setEmail}
                    handleSaveChanges={handleSaveChanges}
                    handleLogoutAllDevices={handleLogoutAllDevices}
                    handleProfileDeletion={handleProfileDeletion}
                  />
                </TabsContent>
                <TabsContent key="security" value="security">
                  <SecurityTab
                    showPasswordFields={showPasswordFields}
                    handleRequestPasswordChange={handleRequestPasswordChange}
                    resetToken={resetToken}
                    setResetToken={setResetToken}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmNewPassword={confirmNewPassword}
                    setConfirmNewPassword={setConfirmNewPassword}
                    handleSaveChanges={handleSaveChanges}
                  />
                </TabsContent>
                <TabsContent key="services" value="services">
                  <ServicesTab
                    ServicesInfos={ServicesInfos}
                    serviceExpirations={serviceExpirations}
                    loggedInServices={loggedInServices}
                    handleRefreshServicesTokens={handleRefreshServicesTokens}
                    handleLogoutFromServices={handleLogoutFromServices}
                  />
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
