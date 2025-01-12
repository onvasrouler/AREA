"use client"

import * as React from "react"
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Trash2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

export function AreasList({ areas: initialAreas }) {
  const [areas, setAreas] = React.useState(initialAreas || [])
  const [statuses, setStatuses] = React.useState({})
  const [isOpen, setIsOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState(null)
  const [editingName, setEditingName] = React.useState("")
  const { toast } = useToast()

  React.useEffect(() => {
    setAreas(initialAreas || [])
    setStatuses(
      Object.fromEntries((initialAreas || []).map((area, index) => [index, area.active]))
    )
  }, [initialAreas])

  const handleStatusChange = async (index) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}activeAreas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          session: localStorage.getItem("session"),
        },
        body: JSON.stringify({
          id: areas[index].id,
          active: !statuses[index],
        }),
      })
      if (response.ok) {
        setStatuses((prev) => ({
          ...prev,
          [index]: !prev[index],
        }))
        toast({
          title: "Area status updated",
          description: "The area status has been successfully updated",
          variant: "default",
        })
      } else {
        console.error("Error:", response.statusText)
        toast({
          title: "Error",
          description: "Failed to update area status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleAreaDeletion = async (area) => {
    try {
      const session = localStorage.getItem("session")
      const body = JSON.stringify({ id: area.id })
      const headers = {
        "Content-Type": "application/json",
        "session": session,
      }
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}area`, {
        method: "DELETE",
        headers,
        body,
      })
      if (!response.ok) {
        toast({
          title: "Error",
          description: "An error occurred while deleting the area",
          variant: "destructive",
        })
        throw new Error("Error deleting area")
      } else {
        toast({
          title: "Area deleted",
          description: "The area has been successfully deleted",
          variant: "default",
        })
        setAreas((prevAreas) => prevAreas.filter((item) => item.id !== area.id))
      }
    } catch (error) {
      console.error("Error deleting area:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the area",
        variant: "destructive",
      })
    }
  }

  const handleEditStart = (area) => {
    setEditingId(area.id)
    setEditingName(area.name)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditingName("")
  }

  const handleEditSave = async (area) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}area`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          session: localStorage.getItem("session"),
        },
        body: JSON.stringify({
          id: area.id,
          name: editingName,
          action: area.action,
          reaction: area.reaction,
        }),
      })
      if (response.ok) {
        setAreas((prevAreas) =>
          prevAreas.map((a) =>
            a.id === area.id ? { ...a, name: editingName } : a
          )
        )
        setEditingId(null)
        setEditingName("")
        toast({
          title: "Area name updated",
          description: "The area name has been successfully updated",
          variant: "default",
        })
      } else {
        console.error("Error:", response.statusText)
        toast({
          title: "Error",
          description: "Failed to update area name",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the area name",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-4 p-4">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 hover:text-white"
          >
            <span className="text-2xl font-bold text-primary w-full text-center hover:text-white">Actions - Reactions</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-center">Name</TableHead>
                  <TableHead className="text-center">Service</TableHead>
                  <TableHead className="text-center">Linked Service</TableHead>
                  <TableHead className="w-[50px] text-center">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.map((area, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Switch
                        checked={statuses[index] || false}
                        onCheckedChange={() => handleStatusChange(index)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-center">
                      {editingId === area.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSave(area)}
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleEditCancel}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <span
                          onClick={() => handleEditStart(area)}
                          className="cursor-pointer hover:underline"
                        >
                          {area.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-center">{area.action.service}</TableCell>
                    <TableCell className="font-medium text-center">{area.reaction.service}</TableCell>
                    <TableCell className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAreaDeletion(area)
                        }}
                      >
                        <Trash2 className="text-red-600 hover:text-white" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

