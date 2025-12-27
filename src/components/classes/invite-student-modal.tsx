"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, CheckCircle2 } from "lucide-react"

interface InviteStudentModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ClassInfo {
  id: string
  name: string
  classCode: string
  studentCount: number
}

export function InviteStudentModal({ isOpen, onClose }: InviteStudentModalProps) {
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Fetch user's classes
  const fetchClasses = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/classes")
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchClasses()
    }
  }, [isOpen])

  const copyClassCode = async () => {
    if (!selectedClass) return

    try {
      await navigator.clipboard.writeText(selectedClass.classCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy class code:", error)
      alert("Failed to copy class code")
    }
  }

  const generateInviteLink = () => {
    if (!selectedClass) return ""
    return `${window.location.origin}/join/${selectedClass.classCode}`
  }

  const copyInviteLink = async () => {
    const link = generateInviteLink()
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy invite link:", error)
      alert("Failed to copy invite link")
    }
  }

  const handleClose = () => {
    setSelectedClass(null)
    setCopied(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Students to Class</DialogTitle>
          <DialogDescription>
            Share the class code or invite link with your students so they can join your class.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Class Selection */}
          <div className="grid gap-2">
            <Label htmlFor="class">Select Class</Label>
            {loading ? (
              <div className="text-sm text-gray-500">Loading classes...</div>
            ) : classes.length > 0 ? (
              <Select onValueChange={(value) => {
                const selected = classes.find(c => c.id === value)
                setSelectedClass(selected || null)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class to invite students to" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name} ({classItem.studentCount} students)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-gray-500">
                No classes found. Create a class first to invite students.
              </div>
            )}
          </div>

          {selectedClass && (
            <>
              {/* Class Code */}
              <div className="grid gap-2">
                <Label>Class Code</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={selectedClass.classCode}
                    readOnly
                    className="font-mono text-lg text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyClassCode}
                    className="shrink-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Students can enter this code to join your class
                </p>
              </div>

              {/* Invite Link */}
              <div className="grid gap-2">
                <Label>Invite Link</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={generateInviteLink()}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyInviteLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Share this link with students for easy joining
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Instructions for Students:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Visit the student dashboard</li>
                  <li>2. Click &quot;Join Class&quot; tab</li>
                  <li>3. Enter the class code: <code className="bg-blue-100 px-1 rounded">{selectedClass.classCode}</code></li>
                  <li>4. Click &quot;Join Class&quot; button</li>
                </ol>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}