"use client"

import * as React from "react"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export function AreasList({ areas }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [statuses, setStatuses] = React.useState(
    Object.fromEntries(areas.map((area, index) => [index, true]))
  )

  const handleStatusChange = (index) => {
    setStatuses(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
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
            className="w-full flex items-center justify-between p-4"
          >
            <span className="text-2xl font-bold text-primary w-full text-center">Actions - Reactions</span>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.map((area, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Switch
                        checked={statuses[index]}
                        onCheckedChange={() => handleStatusChange(index)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-center">{area.name}</TableCell>
                    <TableCell className="font-medium text-center">{area.action.service}</TableCell>
                    <TableCell className="font-medium text-center">{area.reaction.service}</TableCell>
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

