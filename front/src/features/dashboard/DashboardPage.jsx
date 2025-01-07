"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@features/dashboard/components/NavBar"
import { ServiceDialog } from "@features/dashboard/components/ServiceDialog"
import { getApiClient } from "@/common/client/APIClient"
import ServicesInfos from "@features/ServicesInfos"

export function DashboardPage() {
  const [username, setUsername] = useState("User")
  const [selectedService, setSelectedService] = useState(null)
  const [authStatus, setAuthStatus] = useState({
    isDiscordAuthenticated: false,
    isGithubAuthenticated: false,
    isSpotifyAuthenticated: false,
    isOneDriveAuthenticated: false,
    isGmailAuthenticated: false,
    isInstagramAuthenticated: false
  })
  const apiClient = getApiClient()

  const services = ServicesInfos

  useEffect(() => {
    const fetchUserData = async () => {
      const session = localStorage.getItem("session");
      if (session) {
        try {
          const response = await apiClient.get("sessions", {
            session: session
          });

          if (response.ok) {
            const data = await response.json();
            setUsername(data.username);
          } else {
            console.error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      } else {
        console.error('No session found');
      }
    };

    const checkServicesAuth = async () => {
      const session = localStorage.getItem("session");
      if (session) {
        try {
          const response = await apiClient.get("profile_info", {
            session: session
          });
          const responseData = await response.json();

          setAuthStatus({
            isDiscordAuthenticated: responseData.data?.logged_in_discord === true,
            isGitHubAuthenticated: responseData.data?.logged_in_github === true,
            isSpotifyAuthenticated: false, // Add actual check when available
            isOneDriveAuthenticated: false, // Add actual check when available
            isGmailAuthenticated: false, // Add actual check when available
            isInstagramAuthenticated: false // Add actual check when available
          });
        } catch (error) {
          console.error("Error:", error);
        }
      } else {
        console.error("No session found");
      }
    };

    checkServicesAuth();
    fetchUserData();
  }, [apiClient]);

  const handleCardClick = (service) => {
    setSelectedService(service)
  }

  const handleCloseDialog = () => {
    setSelectedService(null)
  }

  const handleServiceSelect = (service) => {
    setSelectedService(service)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        username={username}
        services={services}
        onServiceSelect={handleServiceSelect}
        authStatus={authStatus}
      />
      <main className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              style={{ backgroundColor: service.bgColor }}
              className="overflow-hidden cursor-pointer transition-transform hover:scale-105"
              onClick={() => handleCardClick(service)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-32 h-32">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="object-contain w-full h-full rounded-lg"
                    />
                  </div>
                  <h3 className={service.titleStyle}>
                    {service.name}
                  </h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      {selectedService && (
        <ServiceDialog
          isOpen={!!selectedService}
          onClose={handleCloseDialog}
          service={selectedService}
          authStatus={authStatus}
          isDiscordAuthenticated={authStatus.isDiscordAuthenticated}
        />
      )}
    </div>
  )
}
