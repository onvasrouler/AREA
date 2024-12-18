import React, { useState, useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa";
import AreaLogo from "../../../assets/AREA.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceDialog } from "./ServiceDialog";

export function Navbar({ username, services, onServiceSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(value.trim() !== "");
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSearchTerm("");
    setIsDropdownOpen(false);
    onServiceSelect(service);
  };

  const handleCloseDialog = () => {
    setSelectedService(null);
  };

  return (
    <nav>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          <div className="flex items-center">
            <img src={AreaLogo} alt="AREA Logo" className="w-8 h-8 mr-2" />
            <span className="text-2xl font-bold">AREA</span>
          </div>
          
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="text-lg font-medium whitespace-nowrap">
              Welcome back, {username}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <Input
                type="search"
                placeholder="Search services..."
                className="w-full sm:w-[200px] md:w-[300px]"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {isDropdownOpen && filteredServices.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleServiceSelect(service)}
                    >
                      {service.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src="/placeholder-avatar.jpg" alt={username} />
                    <AvatarFallback>
                      <FaUser className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
  );
}

