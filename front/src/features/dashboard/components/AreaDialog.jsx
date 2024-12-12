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

  const currentService = areaData.services.find(s => s.name === service.name);
  const services = areaData.services.filter(s => s.name !== service.name).map(s => s.name);
  const actions = currentService?.actions || [];
  const reactions = linkedService ? areaData.services.find(s => s.name === linkedService)?.reactions || [] : [];

  useEffect(() => {
    setSelectedAction('');
    setSelectedReaction('');
    setArgumentsData({});
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

        {Object.entries(argumentsData).length > 0 && (
          <div className="p-4">
            <ul>
              {Object.entries(argumentsData).map(([key, value]) => (
                <li key={key} className="mb-2">
                  {value.component === 'TextArea' && (
                    <div>
                      <label className="block mb-1">{value.label}</label>
                      <Textarea placeholder={value.description} />
                    </div>
                  )}
                  {value.component === 'Select' && (
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={value.description} />
                      </SelectTrigger>
                    </Select>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="destructive" onClick={onClose}>Cancel</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
