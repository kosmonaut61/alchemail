"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Edit, Save, XCircle } from "lucide-react"
import { ContextItem } from "@/lib/context-repository"
import { useToast } from "@/hooks/use-toast"

interface ContextItemFormProps {
  item?: ContextItem
  onSave: (item: ContextItem) => void
  onCancel?: () => void
  trigger?: React.ReactNode
  isEditing?: boolean
}

export function ContextItemForm({ item, onSave, onCancel, trigger, isEditing = false }: ContextItemFormProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<ContextItem>>({
    id: '',
    title: '',
    content: '',
    category: 'customer',
    industry: [],
    persona: [],
    pain_points: [],
    keywords: [],
    url: ''
  })
  const [newKeyword, setNewKeyword] = useState('')
  const [newIndustry, setNewIndustry] = useState('')
  const [newPersona, setNewPersona] = useState('')
  const [newPainPoint, setNewPainPoint] = useState('')
  const { toast } = useToast()

  const categories = [
    { value: 'customer', label: 'Customer' },
    { value: 'case_study', label: 'Case Study' },
    { value: 'value_prop', label: 'Value Proposition' },
    { value: 'statistic', label: 'Statistic' },
    { value: 'quote', label: 'Quote' },
    { value: 'language_style', label: 'Language Style' },
    { value: 'pain_points', label: 'Pain Points' }
  ]

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        industry: item.industry || [],
        persona: item.persona || [],
        pain_points: item.pain_points || [],
        keywords: item.keywords || [],
        url: item.url || ''
      })
    } else {
      setFormData({
        id: '',
        title: '',
        content: '',
        category: 'customer',
        industry: [],
        persona: [],
        pain_points: [],
        keywords: [],
        url: ''
      })
    }
  }, [item])

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Title and content are required.",
        variant: "destructive",
      })
      return
    }

    const newItem: ContextItem = {
      id: formData.id || `custom_${Date.now()}`,
      title: formData.title,
      content: formData.content,
      category: formData.category as ContextItem['category'],
      industry: formData.industry,
      persona: formData.persona,
      pain_points: formData.pain_points,
      keywords: formData.keywords,
      url: formData.url
    }

    onSave(newItem)
    setOpen(false)
    
    toast({
      title: isEditing ? "Context Item Updated" : "Context Item Added",
      description: `${newItem.title} has been ${isEditing ? 'updated' : 'added'} to the context repository.`,
    })
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords?.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }))
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }))
  }

  const addIndustry = () => {
    if (newIndustry.trim() && !formData.industry?.includes(newIndustry.trim())) {
      setFormData(prev => ({
        ...prev,
        industry: [...(prev.industry || []), newIndustry.trim()]
      }))
      setNewIndustry('')
    }
  }

  const removeIndustry = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industry: prev.industry?.filter(i => i !== industry) || []
    }))
  }

  const addPersona = () => {
    if (newPersona.trim() && !formData.persona?.includes(newPersona.trim())) {
      setFormData(prev => ({
        ...prev,
        persona: [...(prev.persona || []), newPersona.trim()]
      }))
      setNewPersona('')
    }
  }

  const removePersona = (persona: string) => {
    setFormData(prev => ({
      ...prev,
      persona: prev.persona?.filter(p => p !== persona) || []
    }))
  }

  const addPainPoint = () => {
    if (newPainPoint.trim() && !formData.pain_points?.includes(newPainPoint.trim())) {
      setFormData(prev => ({
        ...prev,
        pain_points: [...(prev.pain_points || []), newPainPoint.trim()]
      }))
      setNewPainPoint('')
    }
  }

  const removePainPoint = (painPoint: string) => {
    setFormData(prev => ({
      ...prev,
      pain_points: prev.pain_points?.filter(pp => pp !== painPoint) || []
    }))
  }

  const content = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter context item title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as ContextItem['category'] }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Enter context item content"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL (Optional)</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
          placeholder="Enter URL if applicable"
        />
      </div>

      <div className="space-y-2">
        <Label>Keywords</Label>
        <div className="flex gap-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Add keyword"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
          />
          <Button type="button" onClick={addKeyword} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.keywords?.map((keyword, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {keyword}
              <XCircle 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeKeyword(keyword)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Industries</Label>
        <div className="flex gap-2">
          <Input
            value={newIndustry}
            onChange={(e) => setNewIndustry(e.target.value)}
            placeholder="Add industry"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIndustry())}
          />
          <Button type="button" onClick={addIndustry} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.industry?.map((industry, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {industry}
              <XCircle 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeIndustry(industry)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Personas</Label>
        <div className="flex gap-2">
          <Input
            value={newPersona}
            onChange={(e) => setNewPersona(e.target.value)}
            placeholder="Add persona"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPersona())}
          />
          <Button type="button" onClick={addPersona} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.persona?.map((persona, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {persona}
              <XCircle 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removePersona(persona)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Pain Points</Label>
        <div className="flex gap-2">
          <Input
            value={newPainPoint}
            onChange={(e) => setNewPainPoint(e.target.value)}
            placeholder="Add pain point"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPainPoint())}
          />
          <Button type="button" onClick={addPainPoint} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.pain_points?.map((painPoint, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {painPoint}
              <XCircle 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removePainPoint(painPoint)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => {
          setOpen(false)
          onCancel?.()
        }}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Update' : 'Add'} Context Item
        </Button>
      </div>
    </div>
  )

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Context Item' : 'Add New Context Item'}
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return content
}
