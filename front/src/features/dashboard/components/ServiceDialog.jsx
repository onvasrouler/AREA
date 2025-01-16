import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { AreaDialog } from "./AreaDialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Trash2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast";

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
    const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
    const SCOPE = 'user-library-read user-read-currently-playing';
    const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;
    window.location.href = AUTH_URL;
    console.log("Spotify login")
  },
  handleTwitchLogin: () => {
    const CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_TWITCH_REDIRECT_URI;
    const SCOPE = "user:read:follows";
    const AUTH_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`;
    window.location.href = AUTH_URL;
  }
}

export function ServiceDialog({ isOpen, onClose, service, authStatus, onAreaCreated, onAreaDeleted }) {
  const isAuthenticated = authStatus && authStatus[`is${service.name}Authenticated`]
  const handleLogin = handleLoginFunctions[`handle${service.name}Login`]
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false)
  const [areas, setAreas] = useState([]);
  const { toast } = useToast();

useEffect(() => {
  if (isOpen && isAuthenticated) {
    const session = localStorage.getItem("session");

    fetch(`${import.meta.env.VITE_BACKEND_URL}area`, {
      method: "GET",
      headers: {
        "session": session
      }
    })
      .then(res => {
        return res.json();
      })
      .then(data => {
        if (data?.data) {
          const filteredAreas = data.data.filter(item => item.action.service === service.name.toLowerCase());
          setAreas(filteredAreas);
        } else {
          setAreas([]);
          toast({
            title: "No areas",
            description: "No areas found for this service",
            variant: "destructive"
          })
        }
      })
      .catch(err => {
        if (err instanceof TypeError) {
          console.error("Error fetching areas:", err.message);
        } else {
          console.error("Unexpected error:", err);
        }
      });
  }
}, [isOpen, isAuthenticated, service.name]);

  const handleAreaDeletion = async (area) => {
    try {
      const session = localStorage.getItem("session");
      const body = JSON.stringify({ id: area.id });
      const headers = {
        "Content-Type": "application/json",
        "session": session,
      };
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}area`, {
        method: "DELETE",
        headers,
        body,
      });
      if (!response.ok) {
        toast({
          title: "Error",
          description: "Error deleting area",
          variant: "destructive",
        });
        throw new Error("Error deleting area");
      } else {
        const newAreas = areas.filter(item => item.id !== area.id);
        setAreas(newAreas);
        toast({
          title: "Area deleted",
          description: "Area has been successfully deleted",
          variant: "default",
        });

        if (onAreaDeleted) {
          onAreaDeleted(area.id);
        }
      }
    } catch (error) {
      console.error("Error deleting area:", error);
    }
  };

  function formatJsonValues(data) {
    const formatters = {
      service: (value) => capitalizeFirstLetter(value),
      on: (value) => value.replace(/_/g, " "),
      react: (value) => capitalizeFirstLetter(value.replace(/_/g, " ")),
    };

    function capitalizeFirstLetter(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function formatObject(obj) {
      if (Array.isArray(obj)) {
        return obj.map(formatObject);
      } else if (obj && typeof obj === "object") {
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            key,
            formatters[key] ? formatters[key](value) : formatObject(value),
          ])
        );
      }
      return obj;
    }

    return formatObject(data);
  }

  const AccordionItems = (
    <Accordion type="single" collapsible className="w-full pr-2">
      {areas.map((rawArea) => {
        const area = formatJsonValues(rawArea);

        return (
          <AccordionItem key={area.name} value={area.name} className="pr-8 relative">
            <AccordionTrigger>{area.name}</AccordionTrigger>
            <AccordionContent>
              <div className="text-left space-y-2">
                <div>
                  <strong>Area's name :</strong> {area.name}
                </div>
                <div>
                  When the action <strong>{area.action.arguments.on}</strong> happens on <strong>{area.action.service}</strong>,
                </div>
                <div>
                  <strong>{area.reaction.service}</strong> reacts by sending <strong>{area.reaction.arguments.react}</strong>: <strong>{area.reaction.arguments.message}</strong>
                </div>
              </div>
            </AccordionContent>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-2 -mr-6"
              onClick={(e) => {
                e.stopPropagation();
                handleAreaDeletion(rawArea);
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </AccordionItem>
        );
      })}
    </Accordion>
  );

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
        isGitHubAuthenticated={authStatus.isGitHubAuthenticated}
        isSpotifyAuthenticated={authStatus.isSpotifyAuthenticated}
        isTwitchAuthenticated={authStatus.isTwitchAuthenticated}
        isGmailAuthenticated={authStatus.isGmailAuthenticated}
        isWeatherAuthenticated={authStatus.isWeatherAuthenticated}
        onAreaCreated={(newArea) => {
          setAreas(prevAreas => [...prevAreas, newArea]);
          if (onAreaCreated) {
            onAreaCreated(newArea);
          }
        }}
      />
    </>
  )
}
