"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navbar } from "@features/dashboard/components/NavBar"
import { ServiceDialog } from "@features/dashboard/components/ServiceDialog"
import { getApiClient } from "@/common/client/APIClient"
import ServicesInfos from "@features/ServicesInfos"
import { Search, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { Footer } from "@features/dashboard/components/Footer"
import { Separator } from "@/components/ui/separator"
import { AreasList } from "@features/dashboard/components/AreasList"

export function DashboardPage() {
  const [selectedService, setSelectedService] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authStatus, setAuthStatus] = useState({
    isDiscordAuthenticated: false,
    isGithubAuthenticated: false,
    isSpotifyAuthenticated: false,
    isOneDriveAuthenticated: false,
    isGmailAuthenticated: false,
    isInstagramAuthenticated: false,
    isTwitchAuthenticated: false
  })
  const apiClient = getApiClient()
  const services = ServicesInfos
  const [areas, setAreas] = useState([]);

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAreaCreated = (newArea) => {
    setAreas(prevAreas => [...prevAreas, newArea]);
  };

  useEffect(() => {
    const checkServicesAuth = async () => {
      const session = localStorage.getItem("session")
      if (session) {
        try {
          const response = await apiClient.get("profile_info", {
            session: session
          })
          const responseData = await response.json()

          setAuthStatus({
            isDiscordAuthenticated: responseData.data?.logged_in_discord === true && responseData.data?.logged_in_discord !== "session_expired",
            isGitHubAuthenticated: responseData.data?.logged_in_github === true && responseData.data?.logged_in_github !== "session_expired",
            isSpotifyAuthenticated: responseData.data?.logged_in_spotify === true && responseData.data?.logged_in_spotify !== "session_expired",
            isOneDriveAuthenticated: false,
            isGmailAuthenticated: true,
            isInstagramAuthenticated: false,
            isTwitchAuthenticated: responseData.data?.logged_in_twitch === true && responseData.data?.logged_in_twitch !== "session_expired"
          })
        } catch (error) {
          console.error("Error:", error)
        }
      }
      setIsLoading(false)
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    const fetchAreas = async () => {
      try {
        const session = localStorage.getItem("session");
        const response = await apiClient.get("area", {
          session: session
        })
        const data = await response.json()
        console.log("Areas:", data.data);
        if (data?.data) {
          setAreas(data.data);
        } else {
          setAreas([]);
        }
      } catch (error) {
        console.error("Error fetching areas:", error);
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    Promise.all([checkServicesAuth(), fetchAreas()])

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }

  }, [])

  const handleCardClick = (service) => {
    setSelectedService(service)
  }

  const handleCloseDialog = () => {
    setSelectedService(null)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setIsDropdownOpen(value.trim() !== "")
  }

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setSearchTerm("")
    setIsDropdownOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar/>
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar/>
      <main className="flex-grow flex flex-col items-center p-4 sm:p-8">
        <div className="w-full max-w-3xl mb-8">
          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center border rounded-lg shadow-md">
                  <Search className="ml-3 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    type="search"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                {isDropdownOpen && filteredServices.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card rounded-lg border shadow-lg">
                    <div className="max-h-[300px] overflow-auto py-1">
                      {filteredServices.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => handleServiceSelect(service)}
                          className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-muted hover:text-white rounded-lg"
                        >
                          <span>{service.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full max-w-7xl">
          <Separator className="mb-8 border-t-2" />
            <div className="font-bold mb-8 text-center">
              <span className="text-2xl font-bold text-primary">
                SERVICES
              </span>
            </div>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {(searchTerm ? filteredServices : services).map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    style={{ backgroundColor: service.bgColor }}
                    className="overflow-hidden cursor-pointer h-full transition-shadow hover:shadow-lg"
                    onClick={() => handleCardClick(service)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-32 h-32 group">
                          <motion.img
                            src={service.image}
                            alt={service.name}
                            className="object-contain w-full h-full rounded-lg transition-transform group-hover:scale-110"
                            initial={false}
                            whileHover={{ scale: 1.05 }}
                          />
                        </div>
                        <h3 className={`text-xl font-semibold text-center ${service.titleStyle}`}>
                          {service.name}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          <Separator className="mt-8 border-t-2" />
          <div className="font-bold mb-8 mt-8">
              <AreasList areas={areas} />
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedService && (
          <ServiceDialog
            isOpen={!!selectedService}
            onClose={handleCloseDialog}
            service={selectedService}
            authStatus={authStatus}
            onAreaCreated={handleAreaCreated}
          />
        )}
      </AnimatePresence>
      <Footer />
    </div>
  )
}

