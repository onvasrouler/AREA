import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getApiClient } from "@/common/client/APIClient"

export function ServiceDialog({ isOpen, onClose, service, isDiscordAuthenticated }) {
  const apiClient = getApiClient();
  const [discordServers, setDiscordServers] = useState([]);
  const [discordChannels, setDiscordChannels] = useState({});

  const [githubRepos, setGithubRepos] = useState([]);
  const [isGithubAuthenticated, setIsGithubAuthenticated] = useState(false);

  const handleDiscordLogin = () => {
    const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI;
    const AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&response_type=code&scope=identify%20guilds`;

    window.location.href = AUTH_URL;
  };

  const handleGithubLogin = () => {
    const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    const AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=repo`;

    window.location.href = AUTH_URL;
  };

  useEffect(() => {
    if (isOpen && service.name === "Discord") {
      fetchServers();
    }
  }, [isOpen, service.name]);

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

  const handleServerSelect = (serverId) => {
    if (!discordChannels[serverId]) {
      fetchChannels(serverId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
          <DialogDescription>{service.description}</DialogDescription>
        </DialogHeader>
        <div className="p-4">
          {service.name === "Discord" ? (
            <>
              {!isDiscordAuthenticated ? (
                <div className="flex flex-col items-center">
                  <p className="mb-4">
                    You need to log in with Discord to access this service.
                  </p>
                  <Button
                    onClick={handleDiscordLogin}
                    className="font-bold py-2 px-4 rounded"
                  >
                    Login with Discord
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Your Discord Servers
                  </h3>
                  {discordServers.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {discordServers.map((server) => (
                        <AccordionItem key={server.id} value={server.id}>
                          <AccordionTrigger
                            onClick={() => handleServerSelect(server.id)}
                            className="flex items-center space-x-2"
                          >
                            {server.icon && (
                              <img
                                src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                                alt={`${server.name} icon`}
                                className="w-6 h-6 rounded-full mr-2"
                              />
                            )}
                            {server.name}
                          </AccordionTrigger>
                          <AccordionContent>
                            {discordChannels[server.id] ? (
                              discordChannels[server.id].length > 0 ? (
                                <ul className="space-y-1 pl-8">
                                  {discordChannels[server.id].map((channel) => (
                                    <li key={channel.id}>{channel.name}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="pl-8">
                                  No channels found for this server.
                                </p>
                              )
                            ) : (
                              <p className="pl-8">Loading channels...</p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <p>No Discord servers found.</p>
                  )}
                </div>
              )}
            </>
          ) : service.name === "GitHub" ? (
            <>
              {!isGithubAuthenticated ? (
                <div className="flex flex-col items-center">
                  <p className="mb-4">
                    You need to log in with GitHub to access this service.
                  </p>
                  <Button
                    onClick={handleGithubLogin}
                    className="font-bold py-2 px-4 rounded"
                  >
                    Login with GitHub
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Your GitHub Repositories
                  </h3>
                  {githubRepos.length > 0 ? (
                    <ul className="space-y-2">
                      {githubRepos.map((repo) => (
                        <li
                          key={repo.id}
                          className="flex items-center space-x-2"
                        >
                          <span className="font-medium">{repo.name}</span>
                          <span className="text-gray-500">{repo.language}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No repositories found.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p>Service not supported.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
