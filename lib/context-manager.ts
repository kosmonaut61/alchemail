// Context Manager - Handles dynamic context item management
import { ContextItem, CONTEXT_REPOSITORY } from './context-repository'

// In-memory storage for custom context items (in a real app, this would be persisted)
let customContextItems: ContextItem[] = []

// Get all context items (original + custom)
export function getAllContextItems(): ContextItem[] {
  return [...CONTEXT_REPOSITORY, ...customContextItems]
}

// Add a new context item
export function addContextItem(item: ContextItem): void {
  // Check if item with same ID already exists
  const existingItem = customContextItems.find(i => i.id === item.id)
  if (existingItem) {
    // Update existing item
    const index = customContextItems.findIndex(i => i.id === item.id)
    customContextItems[index] = item
  } else {
    // Add new item
    customContextItems.push(item)
  }
  
  // Persist to localStorage
  saveCustomContextItems()
}

// Remove a context item
export function removeContextItem(itemId: string): void {
  customContextItems = customContextItems.filter(item => item.id !== itemId)
  saveCustomContextItems()
}

// Update a context item
export function updateContextItem(itemId: string, updates: Partial<ContextItem>): void {
  const index = customContextItems.findIndex(item => item.id === itemId)
  if (index !== -1) {
    customContextItems[index] = { ...customContextItems[index], ...updates }
    saveCustomContextItems()
  }
}

// Get context items by category (including custom items)
export function getContextItemsByCategory(category: ContextItem['category']): ContextItem[] {
  return getAllContextItems().filter(item => item.category === category)
}

// Get context items by industry (including custom items)
export function getContextItemsByIndustry(industry: string): ContextItem[] {
  return getAllContextItems().filter(item => 
    item.industry?.some(ind => ind.toLowerCase().includes(industry.toLowerCase()))
  )
}

// Get context items by persona (including custom items)
export function getContextItemsByPersona(persona: string): ContextItem[] {
  return getAllContextItems().filter(item => 
    item.persona?.some(p => p.toLowerCase() === persona.toLowerCase())
  )
}

// Get context items by pain points (including custom items)
export function getContextItemsByPainPoints(painPoints: string[]): ContextItem[] {
  return getAllContextItems().filter(item => 
    item.pain_points?.some(pp => painPoints.includes(pp))
  )
}

// Get context items by keywords (including custom items)
export function getContextItemsByKeywords(keywords: string[]): ContextItem[] {
  return getAllContextItems().filter(item => 
    item.keywords?.some(keyword => 
      keywords.some(k => keyword.toLowerCase().includes(k.toLowerCase()))
    )
  )
}

// Check if an item is custom (not in original repository)
export function isCustomContextItem(itemId: string): boolean {
  return customContextItems.some(item => item.id === itemId)
}

// Get only custom context items
export function getCustomContextItems(): ContextItem[] {
  return [...customContextItems]
}

// Save custom context items to localStorage
function saveCustomContextItems(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('alchemail_custom_context', JSON.stringify(customContextItems))
    } catch (error) {
      console.error('Failed to save custom context items:', error)
    }
  }
}

// Load custom context items from localStorage
function loadCustomContextItems(): void {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('alchemail_custom_context')
      if (saved) {
        customContextItems = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load custom context items:', error)
      customContextItems = []
    }
  }
}

// Initialize the context manager
export function initializeContextManager(): void {
  loadCustomContextItems()
}

// Reset custom context items (useful for testing or clearing all custom items)
export function resetCustomContextItems(): void {
  customContextItems = []
  saveCustomContextItems()
}
