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

import areaData from '@/AREA.json';

export function AreaDialog({ isOpen, onClose, service }) {
  const [linkedService, setLinkedService] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedReaction, setSelectedReaction] = useState('');
  const [argumentsData, setArgumentsData] = useState({});
  const [discordServers, setDiscordServers] = useState([]);
  const [discordChannels, setDiscordChannels] = useState({});
  const [selectedServerId, setSelectedServerId] = useState('');

  const currentService = areaData.services.find(s => s.name === service.name);
  const services = areaData.services.filter(s => s.name !== service.name).map(s => s.name);
  const actions = currentService?.actions || [];
  const reactions = linkedService ? areaData.services.find(s => s.name === linkedService)?.reactions || [] : [];

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

  useEffect(() => {
    setSelectedAction('');
    setSelectedReaction('');
    setArgumentsData({});
    setSelectedServerId('');
    if (linkedService === "Discord") {
      fetchServers();
    }
  }, [linkedService, service]);

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

        <Select value={linkedService} onValueChange={setLinkedService}>
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
                <Textarea placeholder={value.description} />
              </div>
            )}
            {value.component === "Select" && key === "serverId" && (
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
            {value.component === "Select" && key === "channelId" && selectedServerId && (
              <Select>
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
          </div>
        ))}

        <div className="flex justify-between mt-6">
          <Button variant="destructive" onClick={onClose}>Cancel</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
