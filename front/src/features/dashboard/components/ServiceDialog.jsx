import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react";
import { getApiClient } from "@/common/client/APIClient"

export function ServiceDialog({ isOpen, onClose, service, isDiscordAuthenticated }) {
  const apiClient = getApiClient();
  const [discordServers, setDiscordServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [discordChannels, setDiscordChannels] = useState([]);

  const handleDiscordLogin = () => {
    const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI;
    const AUTH_URL = `${import.meta.env.VITE_DISCORD_AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&response_type=code&scope=identify%20guilds`;

    window.location.href = AUTH_URL;
    console.log("Logging in with Discord");
  };

  useEffect(() => {
    const fetchDiscordData = async () => {
      const discordToken = localStorage.getItem("discordToken");
      const session = localStorage.getItem("session");

      if (discordToken && isDiscordAuthenticated) {
        try {
          // Get available Discord servers for the user
          const serversResponse = await apiClient.get("get_my_discord_server", {
            session: session,
          });
          console.log(serversResponse.data);
          if (serversResponse.data && serversResponse.data.data) {
            setDiscordServers(serversResponse.data.data);
          }
        } catch (error) {
          console.error("Error fetching Discord servers:", error);
        }
      } else {
        console.error("No Discord token found or not authenticated. Please log in.");
      }
    };

    fetchDiscordData();
  }, [isDiscordAuthenticated]);

  useEffect(() => {
    const fetchChannels = async () => {
      if (selectedServer) {
        const session = localStorage.getItem("session");
        try {
          const channelsResponse = await apiClient.get("get_list_of_channels", {
            session: session,
            guildId: selectedServer,
          });

          if (channelsResponse.data && channelsResponse.data.data) {
            setDiscordChannels(channelsResponse.data.data);
          }
        } catch (error) {
          console.error("Error fetching Discord channels:", error);
        }
      }
    };

    fetchChannels();
  }, [selectedServer]);

  const handleServerSelect = (serverId) => {
    setSelectedServer(serverId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
          <DialogDescription>
            {service.description}
          </DialogDescription>
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
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Discord Servers</h3>
              {discordServers.length > 0 ? (
                <ul className="space-y-2">
                  {discordServers.map((server) => (
                    <li key={server.id} className="flex items-center space-x-2">
                      {server.icon && (
                        <img
                          src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                          alt={`${server.name} icon`}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <Button
                        onClick={() => handleServerSelect(server.id)}
                        variant={selectedServer === server.id ? "default" : "outline"}
                      >
                        {server.name}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No Discord servers found.</p>
              )}

              {selectedServer && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold mb-2">Channels</h4>
                  {discordChannels.length > 0 ? (
                    <ul className="space-y-1">
                      {discordChannels.map((channel) => (
                        <li key={channel.id}>{channel.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No channels found for this server.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
