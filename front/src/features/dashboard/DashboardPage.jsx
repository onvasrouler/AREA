"use client"

import discordImage from "../../assets/services/Discord.png"
import githubImage from "../../assets/services/Github.png"
import spotifyImage from "../../assets/services/Spotify.png"
import onedriveImage from "../../assets/services/Onedrive.png"
import gmailImage from "../../assets/services/Gmail.png"
import instagramImage from "../../assets/services/Instagram.png"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@features/dashboard/components/NavBar"
import { ServiceDialog } from "@features/dashboard/components/ServiceDialog"
import { getApiClient } from "@/common/client/APIClient"

export function DashboardPage() {
  const [username, setUsername] = useState("User")
  const [selectedService, setSelectedService] = useState(null)
  const [isDiscordAuthenticated, setIsDiscordAuthenticated] = useState(false)
  const apiClient = getApiClient()

  const services = [
    { id: 1, name: "Discord", description: "Manage Discord service", image: discordImage, bgColor: "#526af1", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 2, name: "GitHub", description: "Manage GitHub service", image: githubImage, bgColor: "#000000", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 3, name: "Spotify", description: "Manage Spotfiy service", image: spotifyImage, bgColor: "#1DB954", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 4, name: "OneDrive", description: "Manage OneDrive service", image: onedriveImage, bgColor: "#0849b0", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 5, name: "Gmail", description: "Manage Gmail service", image: gmailImage, bgColor: "#ffdc5c", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 6, name: "Instagram", description: "Manage Instagram service", image: instagramImage, bgColor: "#E4405F", titleStyle: "text-2xl font-bold text-center text-white" },
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      const session = localStorage.getItem("session");
      if (session) {
        console.log("Session:", session);
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

    const checkDiscordAuth = async () => {
      const discordToken = localStorage.getItem("discordToken");
      console.log("Discord token:", discordToken);

      if (discordToken) {
        try {
          const response = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${discordToken}` },
          });

          if (response.ok) {
            setIsDiscordAuthenticated(true);
          } else {
            console.error("Discord token is invalid or expired");
            setIsDiscordAuthenticated(false);
            localStorage.removeItem("discordToken");
          }
        } catch (error) {
          console.error("Error validating Discord token:", error);
          setIsDiscordAuthenticated(false);
        }
      }
    };

    checkDiscordAuth();
    fetchUserData();
  }, [apiClient]);

  const handleCardClick = (service) => {
      setSelectedService(service)
  }

  const handleCloseDialog = () => {
    setSelectedService(null)
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar username={username} services={services} />
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
          isDiscordAuthenticated={isDiscordAuthenticated}
        />
      )}
    </div>
  )
}

