import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getApiClient } from "@/common/client/APIClient"

export function ServiceDialog({ isOpen, onClose, service, isDiscordAuthenticated, isGithubAuthenticated,
  isSpotifyAuthenticated, isOneDriveAuthenticated, isGmailAuthenticated, isInstagramAuthenticated }) {
  const apiClient = getApiClient();
  const [discordServers, setDiscordServers] = useState([]);
  const [discordChannels, setDiscordChannels] = useState({});


  const handleDiscordLogin = () => {
    const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI;
    const AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&response_type=code&scope=identify%20guilds`;

    window.location.href = AUTH_URL;
  };

  const handleGithubLogin = () => {
    const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const SCOPE = "repo user";
    const CALLBACK_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    const AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${CALLBACK_URI}&scope=${SCOPE}`;

    window.location.href = AUTH_URL;
  };

  const handleSpotifyLogin = () => {
    console.log("Spotify login");
  }

  const handleOneDriveLogin = () => {
    console.log("OneDrive login");
  }

  const handleGmailLogin = () => {
    console.log("Gmail login");
  }

  const handleInstagramLogin = () => {
    console.log("Instagram login");
  }

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen && service.name === "Discord") {
        fetchServers();
      }
      if (isOpen && service.name === "GitHub") {
        console.log("GitHub service opened");
      }
    };
    fetchData();
  }, [isOpen, service.name, fetchServers]);

  const fetchServers = async () => {
    const session = localStorage.getItem("session");

    if (session && isDiscordAuthenticated) {
      try {
        const serversResponse = await apiClient.get("get_my_discord_server", {
          session: session,
        });

        const responseData = await serversResponse.json();

        if (responseData && responseData.data) {
          setDiscordServers(responseData.data);
        }
      } catch (error) {
        console.error("Error fetching Discord servers:", error);
      }
    }
  };

  const fetchChannels = async (serverId) => {
    const session = localStorage.getItem("session");
    if (!session) {
      console.error("No session found. Please log in.");
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_DISCORD_CHANNELS_FETCH_URL}${serverId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "session": session,
          },
        }
      );
      const responseData = await response.json();

      if (responseData && responseData.data) {
        setDiscordChannels(prevChannels => ({
          ...prevChannels,
          [serverId]: responseData.data
        }));
      }
    } catch (error) {
      console.error("Error fetching Discord channels:", error);
    }
  };

  const renderServiceContent = () => {
    switch (service.name) {
      case "Discord":
        return (
          <div className="p-4">
            {!isDiscordAuthenticated ? (
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
              <div>
                <h1 className="text-lg font-semibold mb-2">LOGGED IN</h1>
              </div>
            )}
          </div>
        )
      case "GitHub":
        return (
          <div className="p-4">
            {!isGithubAuthenticated ? (
              <div className="flex flex-col items-center">
                <p className="mb-4">You need to log in with Github to access this service.</p>
                <Button
                  onClick={handleGithubLogin}
                  className="font-bold py-2 px-4 rounded"
                >
                  Login with Github
                </Button>
              </div>
            ) : (
              <div>
                <h1 className="text-lg font-semibold mb-2">LOGGED IN</h1>
              </div>
            )}
          </div>
        )
      case "Spotify":
        return (
          <div className="p-4">
          {!isSpotifyAuthenticated ? (
            <div className="flex flex-col items-center">
              <p className="mb-4">You need to log in with Spotify to access this service.</p>
              <Button
                onClick={handleSpotifyLogin}
                className="font-bold py-2 px-4 rounded"
              >
                Login with Spotify
              </Button>
            </div>
          ) : (
            <div>
              <h1 className="text-lg font-semibold mb-2">LOGGED IN</h1>
            </div>
          )}
        </div>
        )
      case "OneDrive":
        return (
          <div className="p-4">
          {!isOneDriveAuthenticated ? (
            <div className="flex flex-col items-center">
              <p className="mb-4">You need to log in with OneDrive to access this service.</p>
              <Button
                onClick={handleOneDriveLogin}
                className="font-bold py-2 px-4 rounded"
              >
                Login with OneDrive
              </Button>
            </div>
          ) : (
            <div>
              <h1 className="text-lg font-semibold mb-2">LOGGED IN</h1>
            </div>
          )}
        </div>
        )
      case "Gmail":
        return (
          <div className="p-4">
          {!isGmailAuthenticated ? (
            <div className="flex flex-col items-center">
              <p className="mb-4">You need to log in with Gmail to access this service.</p>
              <Button
                onClick={handleGmailLogin}
                className="font-bold py-2 px-4 rounded"
              >
                Login with Gmail
              </Button>
            </div>
          ) : (
            <div>
              <h1 className="text-lg font-semibold mb-2">LOGGED IN</h1>
            </div>
          )}
        </div>
        )
      case "Instagram":
        return (
          <div className="p-4">
          {!isInstagramAuthenticated ? (
            <div className="flex flex-col items-center">
              <p className="mb-4">You need to log in with Instagram to access this service.</p>
              <Button
                onClick={handleInstagramLogin}
                className="font-bold py-2 px-4 rounded"
              >
                Login with Instagram
              </Button>
            </div>
          ) : (
            <div>
              <h1 className="text-lg font-semibold mb-2">LOGGED IN</h1>
            </div>
          )}
        </div>
        )
      default:
        return (
          <div className="p-4">
            <p>Unknown service selected.</p>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
          <DialogDescription>
            {service.description}
          </DialogDescription>
        </DialogHeader>
        {renderServiceContent()}
      </DialogContent>
    </Dialog>
  )
}
