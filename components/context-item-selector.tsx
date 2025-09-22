"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import { ContextItem } from "@/lib/context-repository"
import { getAllContextItems, getContextItemsByCategory } from "@/lib/context-manager"

interface ContextItemSelectorProps {
  onAddItem: (item: ContextItem) => void
  existingItems: ContextItem[]
  trigger?: React.ReactNode
}

export function ContextItemSelector({ onAddItem, existingItems, trigger }: ContextItemSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const allItems = getAllContextItems()
  const categories = [...new Set(allItems.map(item => item.category))].sort()

  // Filter items based on search term
  const filteredItems = allItems.filter(item => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.content.toLowerCase().includes(searchLower) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower)) ||
      item.industry?.some(ind => ind.toLowerCase().includes(searchLower))
    )
  })

  // Check if item is already selected
  const isItemSelected = (item: ContextItem) => {
    return existingItems.some(existing => existing.id === item.id)
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'customer':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
      case 'case_study':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
      case 'statistic':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700'
      case 'quote':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700'
      case 'value_prop':
        return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:border-pink-700'
      case 'language_style':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-700'
      case 'pain_points':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700'
    }
  }

  const content = (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search context items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Categories */}
      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-4 h-10">
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="text-sm px-4 py-2"
            >
              {category === 'language_style' ? 'Style' : category.replace('_', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => {
          const categoryItems = getContextItemsByCategory(category as ContextItem['category'])
          const filteredCategoryItems = categoryItems.filter(item => 
            filteredItems.some(filtered => filtered.id === item.id)
          )

          return (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {filteredCategoryItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No items found matching your search.' : 'No items in this category.'}
                  </div>
                ) : (
                  filteredCategoryItems.map((item, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border ${getCategoryColor(category)} shadow-sm`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm leading-tight pr-4">{item.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-75 bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full">
                            {category === 'language_style' ? 'style' : category}
                          </span>
                          <Button
                            size="sm"
                            variant={isItemSelected(item) ? "secondary" : "default"}
                            disabled={isItemSelected(item)}
                            onClick={() => {
                              onAddItem(item)
                              setOpen(false)
                            }}
                            className="h-8 px-3"
                          >
                            {isItemSelected(item) ? (
                              "Added"
                            ) : (
                              <>
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Keywords */}
                      {item.keywords && item.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.keywords.slice(0, 3).map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {item.keywords.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.keywords.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Context Items to Sequence</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return content
}
