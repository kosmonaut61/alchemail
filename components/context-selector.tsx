"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContextItem } from "@/lib/context-repository"

interface ContextSelectorProps {
  signal: string
  persona: string
  painPoints: string[]
  onContextChange: (selectedItems: ContextItem[]) => void
  onClose: () => void
}

export function ContextSelector({ signal, persona, painPoints, onContextChange, onClose }: ContextSelectorProps) {
  const [allItems, setAllItems] = useState<ContextItem[]>([])
  const [suggestedItems, setSuggestedItems] = useState<ContextItem[]>([])
  const [selectedItems, setSelectedItems] = useState<ContextItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showOnlySuggested, setShowOnlySuggested] = useState(true)

  useEffect(() => {
    analyzeContext()
  }, [signal, persona, painPoints])

  const analyzeContext = async () => {
    if (!signal || !persona) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/analyze-context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signal,
          persona,
          painPoints,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAllItems(data.allItems)
        setSuggestedItems(data.suggestedItems)
        setSelectedItems(data.suggestedItems) // Auto-select suggested items
        onContextChange(data.suggestedItems)
      }
    } catch (error) {
      console.error("Error analyzing context:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleItemToggle = (item: ContextItem, checked: boolean) => {
    if (checked) {
      const newSelected = [...selectedItems, item]
      setSelectedItems(newSelected)
      onContextChange(newSelected)
    } else {
      const newSelected = selectedItems.filter(i => i.id !== item.id)
      setSelectedItems(newSelected)
      onContextChange(newSelected)
    }
  }

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesSuggested = !showOnlySuggested || suggestedItems.some(s => s.id === item.id)
    
    return matchesSearch && matchesCategory && matchesSuggested
  })

  const categoryCounts = allItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Card className="shadow-lg max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Context Selector
            </CardTitle>
            <CardDescription>
              AI-suggested context items for your email. Customize the selection below.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search context items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryCounts).map(([category, count]) => (
                <SelectItem key={category} value={category}>
                  {category.replace('_', ' ')} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="suggested-only"
              checked={showOnlySuggested}
              onCheckedChange={(checked) => setShowOnlySuggested(checked as boolean)}
            />
            <label htmlFor="suggested-only" className="text-sm font-medium">
              Show only suggested
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {allItems.length}</span>
          <span>Suggested: {suggestedItems.length}</span>
          <span>Selected: {selectedItems.length}</span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Analyzing context...
          </div>
        )}

        {/* Context Items */}
        {!isLoading && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredItems.map((item) => {
              const isSelected = selectedItems.some(s => s.id === item.id)
              const isSuggested = suggestedItems.some(s => s.id === item.id)
              
              return (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'
                  } ${isSuggested ? 'ring-2 ring-green-200' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleItemToggle(item, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {item.category.replace('_', ' ')}
                        </Badge>
                        {isSuggested && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            Suggested
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.content}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.industry?.map(industry => (
                          <Badge key={industry} variant="outline" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                        {item.pain_points?.map(pp => (
                          <Badge key={pp} variant="outline" className="text-xs">
                            {pp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedItems.length} items selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSelectedItems([])}>
              Clear All
            </Button>
            <Button variant="outline" onClick={() => {
              setSelectedItems(suggestedItems)
              onContextChange(suggestedItems)
            }}>
              Reset to Suggested
            </Button>
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
