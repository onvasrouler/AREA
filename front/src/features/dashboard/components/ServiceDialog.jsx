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

  const [githubRepos, setGithubRepos] = useState([]);
  const [isGithubAuthenticated, setIsGithubAuthenticated] = useState(false);

  const handleDiscordLogin = () => {
    const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI;
    const AUTH_URL = `${import.meta.env.VITE_DISCORD_AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&response_type=code&scope=identify%20guilds`;

    window.location.href = AUTH_URL;
  };

  const handleGithubLogin = () => {
    const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    const AUTH_URL = `${import.meta.env.VITE_GITHUB_AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=repo`;

    window.location.href = AUTH_URL;
  };

  useEffect(() => {
    const fetchDiscordData = async () => {
      const session = localStorage.getItem("session");

      if (session) {
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
      } else {
        console.error("No Discord token found or not authenticated. Please log in.");
      }
    };

    fetchDiscordData();
  }, [isDiscordAuthenticated]);

  useEffect(() => {
    const fetchChannels = async () => {
      if (!selectedServer)
        return;

      const session = localStorage.getItem("session");
      if (!session) {
        console.error("No session found. Please log in.");
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:8080/get_list_of_channels?guildId=${selectedServer}`,
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
          setDiscordChannels(responseData.data);
        } else {
          setDiscordChannels([]);
        }
      } catch (error) {
        console.error("Error fetching Discord channels:", error);
      }
    };

    fetchChannels();
  }, [selectedServer]);

  useEffect(() => {
    const fetchGithubData = async () => {
      const session = localStorage.getItem("session");

      if (!session) {
        console.error("No github session found. Please log in.");
        return;
      }

      try {
        const response = await apiClient.get("get_my_repos", {
          session: session,
        });

        const responseData = await response.json();

        if (responseData && responseData.data) {
          setGithubRepos(responseData.data);
          setIsGithubAuthenticated(true);
        } else {
          setGithubRepos([]);
          setIsGithubAuthenticated(false);
        }
      } catch (error) {
        console.error("Error fetching Github repositories:", error);
      }
    };

    if (service.name === "Github") {
      fetchGithubData();
    }
  }, [service.name]);

  const handleServerSelect = (serverId) => {
    setSelectedServer(serverId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
          <DialogDescription>{service.description}</DialogDescription>
        </DialogHeader>
        <div className="p-4">
          {service.name === "Discord" && (
            <>
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
            </>
          )}

          {service.name === "GitHub" && (
            <>
              {!isGithubAuthenticated ? (
                <div className="flex flex-col items-center">
                  <p className="mb-4">You need to log in with GitHub to access this service.</p>
                  <Button
                    onClick={handleGithubLogin}
                    className="font-bold py-2 px-4 rounded"
                  >
                    Login with GitHub
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your GitHub Repositories</h3>
                  {githubRepos.length > 0 ? (
                    <ul className="space-y-2">
                      {githubRepos.map((repo) => (
                        <li key={repo.id} className="flex items-center space-x-2">
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
