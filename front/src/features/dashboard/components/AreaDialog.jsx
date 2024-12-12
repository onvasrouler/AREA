import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import areaData  from "@/AREA.json"

export function AreaDialog({ isOpen, onClose, service }) {
  const [linkedService, setLinkedService] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [selectedReaction, setSelectedReaction] = useState('')

  const services = Object.keys(areaData).filter(s => s !== service.name)
  const actions = linkedService ? Object.keys(areaData[linkedService].actions) : []
  const reactions = service.name ? Object.keys(areaData[service.name].reactions) : []

  useEffect(() => {
    setSelectedAction('')
    setSelectedReaction('')
  }, [linkedService])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            Create AREA for {service.name}
          </DialogTitle>
          <DialogDescription className="text-center">
            Set up your automation for {service.name}
          </DialogDescription>
        </DialogHeader>
        <Separator className="bg-primary" />
        <Select value={linkedService} onValueChange={setLinkedService}>
          <SelectTrigger>
            <SelectValue placeholder="Link With" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
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
              {actions.map((action) => (
                <SelectItem key={action} value={action}>{areaData[linkedService].actions[action]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select className="flex-1" value={selectedReaction} onValueChange={setSelectedReaction}>
            <SelectTrigger>
              <SelectValue placeholder="Reaction"/>
            </SelectTrigger>
            <SelectContent>
              {reactions.map((reaction) => (
                <SelectItem key={reaction} value={reaction}>{reaction}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="p-4">
          <p>Here you can add the form or content for creating an AREA.</p>
          {/* Add your AREA creation form or content here */}
        </div>
        <div className="flex justify-between mt-6">
          <Button
            variant="destructive"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

