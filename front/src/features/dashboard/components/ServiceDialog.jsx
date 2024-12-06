import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function ServiceDialog({ isOpen, onClose, service, isDiscordAuthenticated }) {
  const handleDiscordLogin = () => {
    const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI;
    const AUTH_URL = `${import.meta.env.VITE_DISCORD_AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&response_type=code&scope=identify%20guilds`;

    window.location.href = AUTH_URL;
    console.log("Logging in with Discord");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {service.name === "Discord" && !isDiscordAuthenticated ? (
            <div className="flex flex-col items-center">
              <p className="mb-4">You need to log in with Discord to access this service.</p>
              <Button
                onClick={handleDiscordLogin}
                className="font-bold py-2 px-4 rounded"
              >
                Login with Discord
              </Button>
            </div>
          ) : (
            <p>This is where you can add more details about {service.name}.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

