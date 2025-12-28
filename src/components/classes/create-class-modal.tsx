"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, Copy, X } from "lucide-react"

interface CreateClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdClass, setCreatedClass] = useState<{ name: string; classCode: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name.trim()) {
      setError("Class name is required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setCreatedClass({ name: data.class.name, classCode: data.class.classCode })
        setShowSuccess(true)
        setFormData({ name: "", description: "" })
        onSuccess?.()
      } else {
        setError(data.error || "Failed to create class")
      }
    } catch (error) {
      console.error("Error creating class:", error)
      setError("Failed to create class. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = async () => {
    if (createdClass?.classCode) {
      await navigator.clipboard.writeText(createdClass.classCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setFormData({ name: "", description: "" })
    setError("")
    setShowSuccess(false)
    setCreatedClass(null)
    setCopied(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {showSuccess && createdClass ? (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-center">Class Created Successfully!</DialogTitle>
              <DialogDescription className="text-center">
                Your class &quot;{createdClass.name}&quot; has been created. Share the class code with your students.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 text-center">
                <p className="text-sm text-violet-600 mb-2">Class Code</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-violet-700 tracking-wider">
                    {createdClass.classCode}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCode}
                    className="text-violet-600 hover:text-violet-700 hover:bg-violet-100"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-2">Copied to clipboard!</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full bg-violet-600 hover:bg-violet-700">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Create a new class and get a unique class code for students to join.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <X className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="name">Class Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mathematics Grade 10"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the class..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700">
                  {loading ? "Creating..." : "Create Class"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}