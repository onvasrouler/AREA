import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronDown, Plus } from 'lucide-react'
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getApiClient } from "@/common/client/APIClient"

export function ServiceDialog({ isOpen, onClose, service, isDiscordAuthenticated, isGithubAuthenticated, services }) {
  const apiClient = getApiClient();
  const [discordServers, setDiscordServers] = useState([]);
  const [discordChannels, setDiscordChannels] = useState({});
  const [githubRepos, setGithubRepos] = useState([]);
  const [githubPullRequests, setGithubPullRequest] = useState({});
  const [linkedService, setLinkedService] = useState(() => {
    const saved = localStorage.getItem(`${service.name}_linked_service`);
    return saved || "Link With";
  });
  const [actionReactionButtons, setActionReactionButtons] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  useEffect(() => {
    localStorage.setItem(`${service.name}_linked_service`, linkedService);
  }, [linkedService, service.name]);

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

  const handleSaveChanges = async () => {
    const session = localStorage.getItem("session");
    if (!session) {
      console.error("No session found. Please log in.");
      return;
    }
  
    const areas = actionReactionButtons.map(button => {
      let actionArguments = {};
      if (button.action === "New repository") actionArguments.on = "new_repo";
      else if (button.action === "New issue") actionArguments.on = "new_issue";
      else if (button.action === "New commit") actionArguments.on = "new_commit";
      else if (button.action === "New pull request") actionArguments.on = "new_pr";
  
      let reactionArguments = {};
      if (button.reaction === "Send private message") {
        reactionArguments.react = "private_message";
        // You need to implement a way to get the user ID
        reactionArguments.userId = getUserId();
      } else if (button.reaction === "Send message in channel") {
        reactionArguments.react = "channel_message";
        reactionArguments.serverId = selectedServer;
        reactionArguments.channelId = selectedChannel;
      }
  
      return {
        action: {
          service: "github",
          arguments: actionArguments
        },
        reaction: {
          service: "discord",
          arguments: reactionArguments
        }
      };
    });
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/area`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'session': session
        },
        body: JSON.stringify(areas)
      });
  
      if (response.ok) {
        console.log("Changes saved successfully");
        // Optionally, you can update the UI to show a success message
      } else {
        console.error("Failed to save changes");
        // Optionally, you can update the UI to show an error message
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      // Optionally, you can update the UI to show an error message
    }
  
    localStorage.setItem(`${service.name}_actions_reactions`, JSON.stringify(actionReactionButtons));
  };
  
  const getUserId = async () => {
    const session = localStorage.getItem("session");
    if (!session) {
      console.error("No session found. Please log in.");
      return null;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get_my_user_id`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'session': session
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        return data.userId;
      } else {
        console.error("Failed to get user ID");
        return null;
      }
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  };

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

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen && service.name === "Discord") {
        fetchServers();
      }
      if (isOpen && service.name === "GitHub") {
        loadSavedState();
        await fetchRepositories();
        await fetchPullRequests();
      }
    };
    console.log("Services:", services);
    fetchData();
  }, [isOpen, service.name]);

  const loadSavedState = () => {
    const savedState = localStorage.getItem(`${service.name}_actions_reactions`);
    if (savedState) {
      setActionReactionButtons(JSON.parse(savedState));
    }
  };

  const renderServiceContent = () => {
    switch (service.name) {
      case "Discord":
        return (
          <div className="p-6">
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
                  <div className="space-y-4">
                    <Select onValueChange={(value) => {
                      setSelectedServer(value);
                      fetchChannels(value);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a server" />
                      </SelectTrigger>
                      <SelectContent>
                        {discordServers.map((server) => (
                          <SelectItem key={server.id} value={server.id}>
                            {server.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedServer && discordChannels[selectedServer] && (
                      <Select onValueChange={setSelectedChannel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {discordChannels[selectedServer].map((channel) => (
                            <SelectItem key={channel.id} value={channel.id}>
                              {channel.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ) : (
                  <p>No Discord servers found.</p>
                )}
              </div>
            )}
          </div>
        )
      case "GitHub":
        return (
          <div className="p-6">
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
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {actionReactionButtons.map((button, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="default" className="bg-primary text-primary-foreground">
                              {button.action || "Action"}
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => {
                              const newButtons = [...actionReactionButtons];
                              newButtons[index] = { ...newButtons[index], action: "New repository" };
                              setActionReactionButtons(newButtons);
                            }}>New repository</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => {
                              const newButtons = [...actionReactionButtons];
                              newButtons[index] = { ...newButtons[index], action: "New issue" };
                              setActionReactionButtons(newButtons);
                            }}>New issue</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => {
                              const newButtons = [...actionReactionButtons];
                              newButtons[index] = { ...newButtons[index], action: "New commit" };
                              setActionReactionButtons(newButtons);
                            }}>New commit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => {
                              const newButtons = [...actionReactionButtons];
                              newButtons[index] = { ...newButtons[index], action: "New pull request" };
                              setActionReactionButtons(newButtons);
                            }}>New pull request</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="default" className="bg-primary text-primary-foreground">
                              {button.reaction || "Reaction"}
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => {
                              const newButtons = [...actionReactionButtons];
                              newButtons[index] = { ...newButtons[index], reaction: "Send private message" };
                              setActionReactionButtons(newButtons);
                            }}>Send private message</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => {
                              const newButtons = [...actionReactionButtons];
                              newButtons[index] = { ...newButtons[index], reaction: "Send message in channel" };
                              setActionReactionButtons(newButtons);
                            }}>Send message in channel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {button.action && button.reaction && (
                        <div className="ml-4 text-sm text-gray-600">
                          On: "{button.action}" Do: "{button.reaction}"
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newButtons = [...actionReactionButtons];
                          newButtons.splice(index, 1);
                          setActionReactionButtons(newButtons);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="default"
                      className="bg-primary text-primary-foreground"
                      onClick={() => {
                        setActionReactionButtons([...actionReactionButtons, {}]);
                      }}
                    >
                      Add AREA
                      <Plus className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      className="bg-primary text-primary-foreground"
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </Button>
                  </div>
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
      <DialogContent className="w-[80vw] h-[80vh] max-w-[1200px] max-h-[800px] p-9">
        <DialogHeader className="flex flex-col space-y-1.5 text-center sm:text-left">
          <div className="flex justify-between items-center">
            <DialogTitle>{service.name}</DialogTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="bg-primary text-primary-foreground">
                  {linkedService}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {services.map((service) => (
                  <DropdownMenuItem
                    key={service.id}
                    onSelect={() => {
                      setLinkedService(service.name);
                      localStorage.setItem(`${service.name}_linked_service`, service.name);
                    }}
                  >
                    {service.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <DialogDescription>
            {service.description}
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4" />
        {renderServiceContent()}
      </DialogContent>
    </Dialog>
  )
}

