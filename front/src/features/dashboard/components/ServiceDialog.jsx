import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { AreaDialog } from "./AreaDialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Trash2 } from 'lucide-react'

const handleLoginFunctions = {
  handleDiscordLogin: () => {
    const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI;
    const AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&response_type=code&scope=identify%20guilds`;
    window.location.href = AUTH_URL;
  },
  handleGitHubLogin: () => {
      const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const SCOPE = "repo user";
      const CALLBACK_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI;
      const AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${CALLBACK_URI}&scope=${SCOPE}`;
      window.location.href = AUTH_URL;
  },
  handleSpotifyLogin: () => {
    // Implement Spotify login logic
    console.log("Spotify login")
  },
  handleOneDriveLogin: () => {
    // Implement OneDrive login logic
    console.log("OneDrive login")
  },
  handleGmailLogin: () => {
    // Implement Gmail login logic
    console.log("Gmail login")
  },
  handleInstagramLogin: () => {
    // Implement Instagram login logic
    console.log("Instagram login")
  }
}

export function ServiceDialog({ isOpen, onClose, service, authStatus, isDiscordAuthenticated }) {
  const isAuthenticated = authStatus[`is${service.name}Authenticated`]
  const handleLogin = handleLoginFunctions[`handle${service.name}Login`]
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false)
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      const session = localStorage.getItem("session");

      fetch(`${import.meta.env.VITE_BACKEND_URL}area`, {
        method: "GET",
        headers: {
          "session": session
        }
      })
        .then(res => res.json())
        .then(data => {
          const filteredAreas = data.data.filter(item => item.action.service === service.name.toLowerCase());
          setAreas(filteredAreas);
        })
        .catch(err => console.error("Error fetching areas:", err));
    }
  }, [isOpen, isAuthenticated, service.name]);

  const handleAreaDeletion = async (area) => {
    try {
      const session = localStorage.getItem("session");
      const body = JSON.stringify({ id: area.id });
      const headers = {
        "Content-Type": "application/json",
        "session": session
      };
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}area`, {
        method: "DELETE",
        headers,
        body
      })
      if (!response.ok) {
        throw new Error("Error deleting area");
      } else {
        const newAreas = areas.filter(item => item.id !== area.id);
        setAreas(newAreas);
      }
    } catch (error) {
      console.error("Error deleting area:", error);
    }
    console.log("Area to be deleted:", area);
  }

  const AccordionItems = (
    <Accordion type="single" collapsible className="w-full pr-2">
      {areas.map(area => (
        <AccordionItem key={area.id} value={area.id} className="pr-8 relative">
          <AccordionTrigger>{area.id}</AccordionTrigger>
          <AccordionContent>
            <pre className="whitespace-pre-wrap text-left">
              {JSON.stringify(area, null, 2)}
            </pre>
          </AccordionContent>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-2 -mr-6"
            onClick={(e) => {
              e.stopPropagation();
              handleAreaDeletion(area);
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete area</span>
          </Button>
        </AccordionItem>
      ))}
    </Accordion>
  )

  const renderServiceContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center p-4">
          <p className="mb-4">You need to log in with {service.name} to access this service.</p>
          <Button
            onClick={handleLogin}
            className="font-bold py-2 px-4 rounded"
          >
            Login with {service.name}
          </Button>
        </div>
      )
    } else {
      return (
        <div className="flex flex-col h-full">
          {areas.length > 5 ? (
            <ScrollArea className="h-[300px] w-full pr-6">
              {AccordionItems}
            </ScrollArea>
          ) : (
            AccordionItems
          )}
        </div>
      )
    }
  }

  const handleAreaDialogClose = () => {
    setIsAreaDialogOpen(false)
  }

  return (
    <>
      <Dialog open={isOpen && !isAreaDialogOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-full max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-center">
              {service.name}
            </DialogTitle>
            <DialogDescription className="text-center">
              {service.description}
            </DialogDescription>
          </DialogHeader>
          <Separator className="bg-primary" />
          <ScrollArea className="flex-grow">
            <div className="p-4">
              {renderServiceContent()}
            </div>
          </ScrollArea>
          {isAuthenticated && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => setIsAreaDialogOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Create AREA
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <AreaDialog
        isOpen={isAreaDialogOpen}
        onClose={handleAreaDialogClose}
        service={service}
        isDiscordAuthenticated={authStatus.isDiscordAuthenticated}
      />
    </>
  )
}

