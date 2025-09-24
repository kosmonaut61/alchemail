"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Filter, X, Plus, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContextItem } from "@/lib/context-repository"

interface ContextSelectorProps {
  signal: string
  persona: string
  painPoints: string[]
  selectedContextItems: ContextItem[]
  allContextItems: ContextItem[]
  onContextChange: (selectedItems: ContextItem[]) => void
  onClose: () => void
}

export function ContextSelector({ signal, persona, painPoints, selectedContextItems, allContextItems, onContextChange, onClose }: ContextSelectorProps) {
  const [allItems, setAllItems] = useState<ContextItem[]>([])
  const [suggestedItems, setSuggestedItems] = useState<ContextItem[]>([])
  const [selectedItems, setSelectedItems] = useState<ContextItem[]>(selectedContextItems)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showOnlySuggested, setShowOnlySuggested] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [customItem, setCustomItem] = useState({
    title: "",
    content: "",
    category: "case_study" as ContextItem['category'],
    industry: [] as string[],
    pain_points: [] as string[],
    keywords: [] as string[],
    url: ""
  })

  // Initialize with passed selected items
  useEffect(() => {
    setSelectedItems(selectedContextItems)
  }, [selectedContextItems])

  // Initialize all items and suggested items from props
  useEffect(() => {
    setAllItems(allContextItems)
    // Extract suggested items from selectedContextItems (these are the AI-suggested ones)
    setSuggestedItems(selectedContextItems)
  }, [allContextItems, selectedContextItems])


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

  const handleAddCustomItem = () => {
    if (!customItem.title.trim() || !customItem.content.trim()) return

    const newItem: ContextItem = {
      id: `custom_${Date.now()}`,
      title: customItem.title,
      content: customItem.content,
      category: customItem.category,
      industry: customItem.industry,
      pain_points: customItem.pain_points,
      keywords: customItem.keywords,
      url: customItem.url || undefined
    }

    // Add to all items and selected items
    const updatedAllItems = [...allItems, newItem]
    const updatedSelectedItems = [...selectedItems, newItem]
    
    setAllItems(updatedAllItems)
    setSelectedItems(updatedSelectedItems)
    onContextChange(updatedSelectedItems)

    // Reset form
    setCustomItem({
      title: "",
      content: "",
      category: "case_study",
      industry: [],
      pain_points: [],
      keywords: [],
      url: ""
    })
    setShowAddForm(false)
  }

  const handleSelectAll = () => {
    const allFilteredItems = filteredItems
    setSelectedItems(allFilteredItems)
    onContextChange(allFilteredItems)
  }

  const handleClearAll = () => {
    setSelectedItems([])
    onContextChange([])
  }

  const filteredItems = allItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      const matchesSuggested = !showOnlySuggested || suggestedItems.some(s => s.id === item.id)
      
      return matchesSearch && matchesCategory && matchesSuggested
    })
    .sort((a, b) => {
      const aIsSuggested = suggestedItems.some(s => s.id === a.id)
      const bIsSuggested = suggestedItems.some(s => s.id === b.id)
      
      // AI suggested items come first
      if (aIsSuggested && !bIsSuggested) return -1
      if (!aIsSuggested && bIsSuggested) return 1
      
      // Within each group, sort alphabetically by title
      return a.title.localeCompare(b.title)
    })

  const categoryCounts = allItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-primary/10">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              Context Selector
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Browse and select context items for your email. All items are shown by default - use filters to narrow down your selection.
            </CardDescription>
          </div>
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
              Show only AI suggested
            </label>
          </div>
        </div>

        {/* Stats and Quick Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Total: {allItems.length}</span>
            <span>Suggested: {suggestedItems.length}</span>
            <span>Selected: {selectedItems.length}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="border-border/50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryFilter("case_study")}
              className="border-border/50"
            >
              Case Studies
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryFilter("customer")}
              className="border-border/50"
            >
              Customers
            </Button>
          </div>
        </div>

        {/* Add Custom Context Form */}
        {showAddForm && (
          <Card className="border-border/50 bg-card/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Add Custom Context Item</CardTitle>
              <CardDescription>Add a custom context item for this email campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    placeholder="e.g., Custom Case Study"
                    value={customItem.title}
                    onChange={(e) => setCustomItem({...customItem, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={customItem.category} onValueChange={(value) => setCustomItem({...customItem, category: value as ContextItem['category']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="case_study">Case Study</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="value_prop">Value Proposition</SelectItem>
                      <SelectItem value="statistic">Statistic</SelectItem>
                      <SelectItem value="quote">Quote</SelectItem>
                      <SelectItem value="language_style">Language Style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Content *</label>
                <Textarea
                  placeholder="Describe the context item..."
                  value={customItem.content}
                  onChange={(e) => setCustomItem({...customItem, content: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">URL (Optional)</label>
                <Input
                  placeholder="https://example.com"
                  value={customItem.url}
                  onChange={(e) => setCustomItem({...customItem, url: e.target.value})}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddCustomItem} disabled={!customItem.title.trim() || !customItem.content.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading context items...
          </div>
        )}

        {/* Context Items */}
        {!isLoading && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No items found matching your criteria.</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            ) : (
              (() => {
                const suggestedItemsList = filteredItems.filter(item => suggestedItems.some(s => s.id === item.id))
                const otherItems = filteredItems.filter(item => !suggestedItems.some(s => s.id === item.id))
                
                return (
                  <>
                    {/* AI Suggested Items */}
                    {suggestedItemsList.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 py-2">
                          <div className="h-px bg-green-500/30 flex-1"></div>
                          <span className="text-xs font-medium text-green-400 px-2">AI Suggested ({suggestedItemsList.length})</span>
                          <div className="h-px bg-green-500/30 flex-1"></div>
                        </div>
                        {suggestedItemsList.map((item) => {
                          const isSelected = selectedItems.some(s => s.id === item.id)
                          const isSuggested = true
                          
                          return (
                            <div
                              key={item.id}
                              className={`p-4 border rounded-lg transition-all duration-200 ${
                                isSelected ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10' : 'bg-card/50 hover:bg-card border-border/50'
                              } ring-2 ring-green-500/30`}
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
                                    <Badge variant="default" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                      AI Suggested
                                    </Badge>
                                    {item.url && (
                                      <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">
                                        Has URL
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
                                  {item.url && (
                                    <div className="mt-2">
                                      <a 
                                        href={item.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                                      >
                                        View case study →
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </>
                    )}
                    
                    {/* Other Items - Grouped by Category */}
                    {otherItems.length > 0 && (
                      <>
                        {suggestedItemsList.length > 0 && (
                          <div className="flex items-center gap-2 py-2">
                            <div className="h-px bg-border/50 flex-1"></div>
                            <span className="text-xs font-medium text-muted-foreground px-2">All Items ({otherItems.length})</span>
                            <div className="h-px bg-border/50 flex-1"></div>
                          </div>
                        )}
                        
                        {/* Group other items by category */}
                        {(() => {
                          const groupedItems = otherItems.reduce((acc, item) => {
                            if (!acc[item.category]) {
                              acc[item.category] = []
                            }
                            acc[item.category].push(item)
                            return acc
                          }, {} as Record<string, typeof otherItems>)
                          
                          return Object.entries(groupedItems).map(([category, items]) => (
                            <div key={category} className="space-y-2">
                              {/* Category Section Header */}
                              <div className="flex items-center gap-2 py-2">
                                <div className="h-px bg-primary/30 flex-1"></div>
                                <span className="text-sm font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full">
                                  {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({items.length})
                                </span>
                                <div className="h-px bg-primary/30 flex-1"></div>
                              </div>
                              
                              {/* Items in this category */}
                              {items.map((item) => {
                          const isSelected = selectedItems.some(s => s.id === item.id)
                          const isSuggested = false
                          
                          return (
                            <div
                              key={item.id}
                              className={`p-4 border rounded-lg transition-all duration-200 ${
                                isSelected ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10' : 'bg-card/50 hover:bg-card border-border/50'
                              }`}
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
                                    {item.url && (
                                      <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">
                                        Has URL
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
                                  {item.url && (
                                    <div className="mt-2">
                                      <a 
                                        href={item.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                                      >
                                        View case study →
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                              </div>
                            </div>
                          ))
                        })()}
                      </>
                    )}
                  </>
                )
              })()
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedItems.length} items selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSelectAll} size="sm">
              Select All Visible
            </Button>
            <Button variant="outline" onClick={handleClearAll} size="sm">
              Clear All
            </Button>
            <Button variant="outline" onClick={() => {
              setSelectedItems(suggestedItems)
              onContextChange(suggestedItems)
            }} size="sm">
              Reset to Suggested
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
