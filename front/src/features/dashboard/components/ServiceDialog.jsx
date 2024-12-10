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

export function ServiceDialog({ isOpen, onClose, service, isDiscordAuthenticated, isGithubAuthenticated }) {
  const apiClient = getApiClient();
  const [discordServers, setDiscordServers] = useState([]);
  const [discordChannels, setDiscordChannels] = useState({});
  const [githubRepos, setGithubRepos] = useState([]);
  const [githubPullRequests, setGithubPullRequest] = useState({});

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

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen && service.name === "Discord") {
        fetchServers();
      }
      if (isOpen && service.name === "GitHub") {
        await fetchRepositories();
        await fetchPullRequests();
      }
    };
  
    fetchData();
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

  const fetchRepositories = async() => {
    const session = localStorage.getItem("session");
    if (session && isGithubAuthenticated) {
      try {
        const reposResponse = await apiClient.get("get_my_repos", {
          session: session,
        });

        const responseData = await reposResponse.json();

        if (responseData?.data?.data) {
          const data = responseData.data.data;

        setGithubRepos(data);
    
          console.log("Fetched Repositories:", data);
        } else {
          console.warn("No repositories items found in the response.");
        }

      if (responseData && responseData.data) {
          setGithubRepos(responseData.data);
        }
      } catch (error) {
        console.error("Error fetching Github repositories:", error);
      }
    }
  };

  const fetchPullRequests = async() => {
    const session = localStorage.getItem("session");

    if (!session) {
      console.error("No session found. Please log in.");
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_GITHUB_PR_FETCH_URL}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "session": session,
          },
        }
      );
      console.log(response)
      const responseData = await response.json();

      if (responseData?.data?.data?.items) {
        const items = responseData.data.data.items;

      setGithubPullRequest(items);
  
        console.log("Fetched Pull Requests:", items);
      } else {
        console.warn("No pull request items found in the response.");
      }

      if (responseData && responseData.data) {
        setGithubPullRequest(prevPullRequest => ({
          ...prevPullRequest,
        }));
      }
    } catch (error) {
      console.error("Error fetching Github pull requests:", error);
    }
  };

  const handleServerSelect = (serverId) => {
    if (!discordChannels[serverId]) {
      fetchChannels(serverId);
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
                <h3 className="text-lg font-semibold mb-2">Your Discord Servers</h3>
                {discordServers.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {discordServers.map((server) => (
                      <AccordionItem key={server.id} value={server.id}>
                        <AccordionTrigger onClick={() => handleServerSelect(server.id)} className="flex items-center space-x-2">
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
                              <p className="pl-8">No channels found for this server.</p>
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
                <div className="mb-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="repositories">
                      <AccordionTrigger className="no-underline font-semibold text-lg">Your repositories</AccordionTrigger>
                      <AccordionContent>
                        {Object.keys(githubRepos).length > 0 ? (
                          <ul className="space-y-1 pl-4">
                            {Object.values(githubRepos).flat().map((repo) => (
                              <li key={repo.id} className="list-disc">
                                {repo.name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="pl-4">No repositories found.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                <div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="pull-requests">
                      <AccordionTrigger className="no-underline font-semibold text-lg">Your pull requests</AccordionTrigger>
                      <AccordionContent>
                        {Object.keys(githubPullRequests).length > 0 ? (
                          <ul className="space-y-1 pl-4">
                            {Object.values(githubPullRequests).flat().map((pr) => (
                              <li key={pr.id} className="list-disc">
                                {pr.title}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="pl-4">No pull requests found.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
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
