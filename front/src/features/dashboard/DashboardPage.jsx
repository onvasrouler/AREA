"use client"

import discordImage from "../../assets/services/Discord.png"
import githubImage from "../../assets/services/Github.png"
import spotifyImage from "../../assets/services/Spotify.png"
import onedriveImage from "../../assets/services/Onedrive.png"
import gmailImage from "../../assets/services/Gmail.png"
import instagramImage from "../../assets/services/Instagram.png"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@features/dashboard/components/NavBar"
import { ServiceDialog } from "@features/dashboard/components/ServiceDialog"

export function DashboardPage() {
  const [username, setUsername] = useState("User")
  const [selectedService, setSelectedService] = useState(null)

  const services = [
    { id: 1, name: "Discord", image: discordImage, bgColor: "#526af1", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 2, name: "GitHub", image: githubImage, bgColor: "#000000", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 3, name: "Spotify", image: spotifyImage, bgColor: "#1DB954", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 4, name: "OneDrive", image: onedriveImage, bgColor: "#0849b0", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 5, name: "Gmail", image: gmailImage, bgColor: "#ffdc5c", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 6, name: "Instagram", image: instagramImage, bgColor: "#E4405F", titleStyle: "text-2xl font-bold text-center text-white" },
  ]

  const handleCardClick = (service) => {
    setSelectedService(service)
  }

  const handleCloseDialog = () => {
    setSelectedService(null)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar username={username} />
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
        />
      )}
    </div>
  )
}

