import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import the AREA.json data
import areaData from '@/AREA.json';

export function AreaDialog({ isOpen, onClose, service }) {
  const [linkedService, setLinkedService] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedReaction, setSelectedReaction] = useState('');

  const currentService = areaData.services.find(s => s.name === service.name);
  const services = areaData.services.filter(s => s.name !== service.name).map(s => s.name);
  const actions = currentService?.actions || [];
  const reactions = linkedService ? areaData.services.find(s => s.name === linkedService)?.reactions || [] : [];

  useEffect(() => {
    setSelectedAction('');
    setSelectedReaction('');
  }, [linkedService, service]);

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

        <div className="p-4">
          <p>Here you can add the form or content for creating an AREA.</p>
          {selectedReaction && linkedService && (
            <div>
              <h3>Required Arguments:</h3>
              <ul>
                {areaData.services.find(s => s.name === linkedService)?.reactions.find(r => r.type === selectedReaction)?.arguments &&
                  Object.entries(
                    areaData.services.find(s => s.name === linkedService)?.reactions.find(r => r.type === selectedReaction)?.arguments
                  ).map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))
                }
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="destructive" onClick={onClose}>Cancel</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
