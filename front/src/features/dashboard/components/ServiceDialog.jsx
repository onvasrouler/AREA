import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function ServiceDialog({ isOpen, onClose, service }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>This is where you can add more details about {service.name}.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

