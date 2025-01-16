import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

import areaData from '@/AREA.json';

export function AreaDialog({ isOpen, onClose, service, isDiscordAuthenticated, isGitHubAuthenticated, isSpotifyAuthenticated, isTwitchAuthenticated, isGmailAuthenticated, onAreaCreated }) {
  const [linkedService, setLinkedService] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedReaction, setSelectedReaction] = useState('');
  const [argumentsData, setArgumentsData] = useState({});
  const [discordServers, setDiscordServers] = useState([]);
  const [discordChannels, setDiscordChannels] = useState({});
  const [selectedServerId, setSelectedServerId] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [discordUserId, setDiscordUserId] = useState('');
  const [formData, setFormData] = useState({});
  const [authError, setAuthError] = useState('');
  const [areaName, setAreaName] = useState('');
  const currentService = areaData.services.find(s => s.name === service.name);
  const { toast } = useToast()

  const services = areaData.services
    .filter(s => s.name !== service.name)
    .map(s => s.name);

  const actions = currentService?.actions.filter(action => {
    return !linkedService || action.validLinkedServices?.includes(linkedService);
  }) || [];

  const reactions = linkedService
    ? areaData.services
        .find(s => s.name === linkedService)?.reactions.filter(reaction => {
          const action = actions.find(a => a.type === selectedAction);
          return action?.validReactions?.includes(reaction.type);
        }) || []
    : [];

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const checkServiceAuth = (serviceName) => {
    switch (serviceName) {
      case 'Discord':
        return isDiscordAuthenticated;
      case 'GitHub':
        return isGitHubAuthenticated;
      case 'Spotify':
        return isSpotifyAuthenticated;
      case 'Twitch':
        return isTwitchAuthenticated;
      case 'Gmail':
        return isGmailAuthenticated;
      default:
        return false;
    }
  };

  const handleLinkedServiceChange = (value) => {
    setLinkedService(value);
    if (!checkServiceAuth(value)) {
      setAuthError(`You need to authenticate with ${value} before creating an AREA.`);
    } else {
      setAuthError('');
    }
    setSelectedAction('');
    setSelectedReaction('');
  };

  const fetchServers = async () => {
    const session = localStorage.getItem("session");
    if (session) {
      try {
        const response = await fetch(`${import.meta.env.VITE_DISCORD_SERVERS_FETCH_URL}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            session: session,
          },
        });
        if (!response.ok) throw new Error("Invalid response");
        const responseData = await response.json();
        if (responseData?.data) {
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
      const response = await fetch(`${import.meta.env.VITE_DISCORD_CHANNELS_FETCH_URL}${serverId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          session: session,
        },
      });
      if (!response.ok) throw new Error("Invalid response");
      const responseData = await response.json();
      if (responseData?.data) {
        setDiscordChannels(prevChannels => ({
          ...prevChannels,
          [serverId]: responseData.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching Discord channels:", error);
    }
  };

  const fetchDiscordUserId = async () => {
    const session = localStorage.getItem("session");
    if (!session) {
      console.error("No session found. Please log in.");
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_DISCORD_FETCH_USERID_URL}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          session: session,
        },
      });
      console.log(response);
      if (!response.ok) throw new Error("Invalid response");
      const responseData = await response.json();
      if (responseData?.data) {
        setDiscordUserId(responseData.data);
      }
    } catch (error) {
      console.error("Error fetching Discord user ID:", error);
    }
  };

  const buildRequestBody = () => {
    const actionArguments = {
      on: selectedAction || ""
    };

    let reactionArguments = {};

    if (linkedService === "Gmail") {
      reactionArguments = {
        email: formData.email || "",
        object: formData.object || "",
        message: formData.message || ""
      };
    } else if (linkedService === "GitHub" || linkedService === "Spotify" || linkedService === "Twitch") {
      reactionArguments = {
        content: selectedReaction || ""
      };
    } else {
      reactionArguments = {
        react: selectedReaction || ""
      }
    }

    if (service.name === "Discord") {
      actionArguments.userId = discordUserId;
    }

    if (service.name === "Weather") {
      console.log("Weather service");
    }

    if (linkedService === "Discord") {
      if (selectedReaction === "message") {
        if (selectedServerId) {
          reactionArguments.server = selectedServerId;
        }
        if (selectedChannelId) {
          reactionArguments.channel = selectedChannelId;
        }
      } else if (selectedReaction === "private_message") {
        if (discordUserId) {
          reactionArguments.userId = discordUserId;
        } else {
          console.error("No discord user ID found.");
        }
      }
    } else if (linkedService === "GitHub") {
      reactionArguments.content = selectedReaction;
      if (discordUserId) {
        reactionArguments.userId = discordUserId;
      }
    }

    Object.entries(argumentsData).forEach(([key]) => {
      if (formData[key] !== undefined && formData[key] !== '') {
        reactionArguments[key] = formData[key];
      }
    });

    return {
      name: areaName,
      action: {
        service: service.name.toLowerCase(),
        arguments: actionArguments,
      },
      reaction: {
        service: linkedService.toLowerCase(),
        arguments: reactionArguments,
      },
    };
  };

  const handleSubmit = async () => {
    const session = localStorage.getItem("session");
    if (!session) {
      console.error("No session found. Please log in.");
      toast({
        title: "Error",
        description: "No session found. Please log in.",
        variant: "destructive",
      });
      return;
    }

    const requestBody = buildRequestBody();
    console.log("Request body:", JSON.stringify(requestBody));
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}area`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          session: session,
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error("Failed to save AREA");
      toast({
        title: "Success",
        description: "AREA created successfully!",
      });
      if (onAreaCreated) {
        onAreaCreated(requestBody);
      }
      onClose();
    } catch (error) {
      console.error("Error creating AREA:", error);
      toast({
        title: "Error",
        description: "Failed to create AREA. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setSelectedAction('');
    setSelectedReaction('');
    setArgumentsData({});
    setSelectedServerId('');
    setSelectedChannelId('');
    setDiscordUserId('');
    fetchServers();
    fetchDiscordUserId();
  }, []);

  useEffect(() => {
    if (selectedReaction && linkedService) {
      const reaction = areaData.services
        .find(s => s.name === linkedService)?.reactions
        .find(r => r.type === selectedReaction);
      setArgumentsData(reaction?.arguments || {});
    }
  }, [selectedReaction, linkedService]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Create AREA for {service.name}</DialogTitle>
          <DialogDescription className="text-center">Set up your automation for {service.name}</DialogDescription>
        </DialogHeader>
        <Separator className="bg-primary" />

        <div className="mt-4">
          <label className="block mb-1">AREA Name</label>
          <Textarea
            placeholder="Enter a name for your AREA"
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
          />
        </div>

        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <Select value={linkedService} onValueChange={handleLinkedServiceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Link With" />
          </SelectTrigger>
          <SelectContent>
            {services.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-4 mt-4">
          <Select className="flex-1" value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger>
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              {actions.map(action => (
                <SelectItem key={action.type} value={action.type}>{action.display}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select className="flex-1" value={selectedReaction} onValueChange={setSelectedReaction}>
            <SelectTrigger>
              <SelectValue placeholder="Reaction" />
            </SelectTrigger>
            <SelectContent>
              {reactions.map(reaction => (
                <SelectItem key={reaction.type} value={reaction.type}>{reaction.display}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {Object.entries(argumentsData).map(([key, value]) => (
          <div key={key} className="mt-4">
            {value.component === "TextArea" && (
              <div>
                <label className="block mb-1">{value.label}</label>
                <Textarea
                  placeholder={value.description}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                />
              </div>
            )}
            {value.component === "Select" && linkedService === "Discord" && (
              <>
                {key === "serverId" && (
                  <Select onValueChange={(serverId) => {
                    setSelectedServerId(serverId);
                    fetchChannels(serverId);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={value.description} />
                    </SelectTrigger>
                    <SelectContent>
                      {discordServers.map(server => (
                        <SelectItem key={server.id} value={server.id}>{server.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {key === "channelId" && selectedServerId && (
                  <Select onValueChange={(channelId) => {
                    setSelectedChannelId(channelId);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={value.description} />
                    </SelectTrigger>
                    <SelectContent>
                      {discordChannels[selectedServerId]?.map(channel => (
                        <SelectItem key={channel.id} value={channel.id}>{channel.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </>
            )}
          </div>
        ))}

        <div className="flex justify-between mt-6">
          <Button variant="destructive" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={!!authError}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
