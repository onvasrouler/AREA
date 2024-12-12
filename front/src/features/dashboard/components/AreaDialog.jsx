import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function AreaDialog({ isOpen, onClose, service }) {
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

