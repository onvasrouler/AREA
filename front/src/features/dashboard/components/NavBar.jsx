import { useState } from "react"
import AreaLogo from "../../../assets/AREA.png"
import { FaUser } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ServiceDialog } from "./ServiceDialog"

export function Navbar({ username, services }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedService, setSelectedService] = useState(null)

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setSearchTerm("")
  }

  const handleCloseDialog = () => {
    setSelectedService(null)
  }

  return (
    <nav className="bg-primary text-primary-foreground p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src={AreaLogo} alt="AREA Logo" className="w-6 h-6" />
          <span className="text-xl font-bold">AREA</span>
        </div>
        <div className="flex-1 text-center">
          <span className="text-lg">Welcome back {username}</span>
        </div>
        <div className="flex items-center space-x-4 relative">
          <Input
            type="search"
            placeholder="Search for services..."
            className="max-w-sm bg-primary-foreground text-primary"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-md shadow-lg z-50">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="p-2 hover:bg-gray-100 rounded-md cursor-pointer text-black text-center font-semibold"
                  onClick={() => handleServiceSelect(service)}
                >
                  {service.name}
                </div>
              ))}
            </div>
          )}
          <Button variant="ghost" size="icon">
            <FaUser className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {selectedService && (
        <ServiceDialog
          isOpen={!!selectedService}
          onClose={handleCloseDialog}
          service={selectedService}
        />
      )}
    </nav>
  )
}
