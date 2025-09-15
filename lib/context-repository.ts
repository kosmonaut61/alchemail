// Context Repository - Categorized items for dynamic context selection

export interface ContextItem {
  id: string
  title: string
  content: string
  category: 'customer' | 'case_study' | 'value_prop' | 'statistic' | 'quote' | 'language_style'
  industry?: string[]
  persona?: string[]
  pain_points?: string[]
  keywords?: string[]
}

export const CONTEXT_REPOSITORY: ContextItem[] = [
  // Customers by Industry
  {
    id: 'retail_customers',
    title: 'Retail Customers',
    content: 'Dollar Tree, Albertsons, Staples, Wayfair, Foot Locker, U-Haul, Abercrombie, Floor & Decor, Ace',
    category: 'customer',
    industry: ['retail', 'food_retail', 'ecommerce'],
    keywords: ['retail', 'store', 'chain', 'grocery', 'shopping']
  },
  {
    id: 'food_beverage_customers',
    title: 'Food & Beverage Customers',
    content: 'Frito Lay, AB, Olam, Molson Coors, Pepsi BV, Simmons, Mastronardi, Organic Valley, Nutrabolt, Megamex, Dole, Darigold, Olipop, LesserEvil, Hint',
    category: 'customer',
    industry: ['food_beverage', 'food_production', 'beverage'],
    keywords: ['food', 'beverage', 'snack', 'drink', 'production', 'manufacturing']
  },
  {
    id: 'automotive_customers',
    title: 'Automotive Customers',
    content: 'Honda, Bridgestone, Discount Tire',
    category: 'customer',
    industry: ['automotive', 'tire', 'manufacturing'],
    keywords: ['auto', 'car', 'tire', 'vehicle', 'automotive']
  },
  {
    id: 'logistics_customers',
    title: 'Logistics Customers',
    content: 'DHL, EZRack, ArcBest, Roadrunner, US Cold Storage, Allen Dist.',
    category: 'customer',
    industry: ['logistics', 'transportation', 'warehousing'],
    keywords: ['logistics', 'shipping', 'transport', 'warehouse', 'distribution']
  },
  {
    id: 'manufacturing_customers',
    title: 'Manufacturing Customers',
    content: 'Unilever, Whirlpool, Stanley B&D, Jones Soda, Tyson, Mars, Land O\'Lakes, Smithfield, HP Hood, Butterball',
    category: 'customer',
    industry: ['manufacturing', 'food_production', 'consumer_goods'],
    keywords: ['manufacturing', 'production', 'factory', 'plant', 'industrial']
  },

  // Case Studies
  {
    id: 'dollar_tree_case_study',
    title: 'Dollar Tree Case Study',
    content: 'Dollar Tree saved $3.2 million in freight spend within 6 months, and $6M in 2024 using ProcureOS. Average lane was ~2% below market average.',
    category: 'case_study',
    industry: ['retail', 'food_retail'],
    keywords: ['dollar tree', 'retail', 'savings', 'cost reduction'],
    pain_points: ['cost']
  },
  {
    id: 'golden_state_foods_case_study',
    title: 'Golden State Foods Case Study',
    content: '18% reduction in transportation costs, increased RFP qty to 10 per year. Pool of carriers expanded from 35 to 55—a 57% increase. 35 of their 69 lanes gained new options.',
    category: 'case_study',
    industry: ['food_beverage', 'food_production'],
    keywords: ['golden state foods', 'food', 'carrier expansion', 'rfp'],
    pain_points: ['cost', 'efficiency']
  },
  {
    id: 'ezrack_case_study',
    title: 'EZRack Case Study',
    content: 'Realized 6 figure savings in less than a year, saves countless man hours in manual work.',
    category: 'case_study',
    industry: ['logistics', 'warehousing'],
    keywords: ['ezrack', 'logistics', 'savings', 'automation'],
    pain_points: ['effort', 'efficiency']
  },
  {
    id: 'pepsi_case_study',
    title: 'Pepsi Co. Case Study',
    content: 'Reduced the time to run RFP\'s by 20%.',
    category: 'case_study',
    industry: ['food_beverage', 'beverage'],
    keywords: ['pepsi', 'beverage', 'rfp', 'time savings'],
    pain_points: ['effort', 'efficiency']
  },

  // Value Propositions
  {
    id: 'cost_savings_value_prop',
    title: 'Cost Savings Value Prop',
    content: 'Benchmark rates vs live market data → avoid overspend. Results in ↓ costs through better rate visibility and negotiation.',
    category: 'value_prop',
    pain_points: ['cost'],
    keywords: ['cost', 'savings', 'spend', 'budget', 'money']
  },
  {
    id: 'efficiency_value_prop',
    title: 'Efficiency Value Prop',
    content: 'Centralized carrier engagement; automated tendering/comms → save time. Run RFPs, manage spot freight, analyze spend faster/more accurately.',
    category: 'value_prop',
    pain_points: ['effort', 'efficiency'],
    keywords: ['efficiency', 'time', 'automation', 'streamline', 'faster']
  },
  {
    id: 'coverage_value_prop',
    title: 'Coverage Value Prop',
    content: 'Limited/unused networks leave lanes uncovered → solved w/ 1,000s of vetted carriers in Emerge Marketplace. Results in ↑ coverage and better lane options.',
    category: 'value_prop',
    pain_points: ['efficiency'],
    keywords: ['coverage', 'carriers', 'network', 'lanes', 'capacity']
  },

  // Statistics
  {
    id: 'dollar_tree_stats',
    title: 'Dollar Tree Statistics',
    content: 'Within 6 months, Dollar Tree saved $3.2 million in freight spend, in 2024 Dollar Tree saved $6M using ProcureOS. Average lane was ~2% below market average.',
    category: 'statistic',
    industry: ['retail'],
    keywords: ['dollar tree', 'savings', '6 months', '6M', '2% below market']
  },
  {
    id: 'golden_state_stats',
    title: 'Golden State Foods Statistics',
    content: '18% reduction in transportation costs, increased RFP qty to 10 per year since they are so easy to run. During their most recent event, the pool of carriers expanded from 35 to 55—a 57% increase.',
    category: 'statistic',
    industry: ['food_beverage'],
    keywords: ['18% reduction', '10 per year', '57% increase', '35 to 55 carriers']
  },

  // Customer Quotes
  {
    id: 'dollar_tree_quote',
    title: 'Dollar Tree Quote',
    content: '"Emerge is baked into our savings"',
    category: 'quote',
    industry: ['retail'],
    keywords: ['dollar tree', 'savings', 'baked in']
  },
  {
    id: 'golden_state_quote',
    title: 'Golden State Foods Quote',
    content: '"Emerge has been the best partner in terms of service — they check all the boxes for us. We truly see this as a long-lasting partnership."',
    category: 'quote',
    industry: ['food_beverage'],
    keywords: ['golden state foods', 'partnership', 'service', 'long-lasting']
  },
  {
    id: 'ezrack_quote',
    title: 'EZRack Quote',
    content: '"Emerge provides the best marriage between a TMS and finding coverage" and "We got planners out of emails and spreadsheets."',
    category: 'quote',
    industry: ['logistics'],
    keywords: ['ezrack', 'tms', 'coverage', 'emails', 'spreadsheets']
  },

  // Language Styles
  {
    id: 'enterprise_language',
    title: 'Enterprise Language Style',
    content: 'Use "I know enterprise pricing isn\'t one-size-fits-all..." instead of "Your enterprise needs...". Focus on scalability, ROI, and enterprise-level challenges.',
    category: 'language_style',
    persona: ['Enterprise'],
    keywords: ['enterprise', 'scalability', 'roi', 'enterprise-level']
  },
  {
    id: 'smb_language',
    title: 'SMB Language Style',
    content: 'Use "I know every dollar counts when you\'re growing..." instead of "Small businesses need...". Focus on growth, efficiency, and cost-consciousness.',
    category: 'language_style',
    persona: ['SMB'],
    keywords: ['small business', 'growing', 'every dollar counts', 'growth']
  },
  {
    id: 'cost_focused_language',
    title: 'Cost-Focused Language Style',
    content: 'Use "I\'d love to show you what your numbers could look like" and "I think you\'d be surprised at how much you could save." Focus on savings and cost reduction.',
    category: 'language_style',
    pain_points: ['cost'],
    keywords: ['cost', 'savings', 'numbers', 'save', 'budget']
  },
  {
    id: 'efficiency_focused_language',
    title: 'Efficiency-Focused Language Style',
    content: 'Use "I know how tough it can be to manage all those spreadsheets and emails" and "What if you could automate that entire process?" Focus on time savings and automation.',
    category: 'language_style',
    pain_points: ['effort', 'efficiency'],
    keywords: ['efficiency', 'automation', 'time', 'spreadsheets', 'emails']
  }
]

// Helper functions for context selection
export function getContextItemsByCategory(category: ContextItem['category']): ContextItem[] {
  return CONTEXT_REPOSITORY.filter(item => item.category === category)
}

export function getContextItemsByIndustry(industry: string): ContextItem[] {
  return CONTEXT_REPOSITORY.filter(item => 
    item.industry?.some(ind => ind.toLowerCase().includes(industry.toLowerCase()))
  )
}

export function getContextItemsByPersona(persona: string): ContextItem[] {
  return CONTEXT_REPOSITORY.filter(item => 
    item.persona?.some(p => p.toLowerCase() === persona.toLowerCase())
  )
}

export function getContextItemsByPainPoints(painPoints: string[]): ContextItem[] {
  return CONTEXT_REPOSITORY.filter(item => 
    item.pain_points?.some(pp => painPoints.includes(pp))
  )
}

export function getContextItemsByKeywords(keywords: string[]): ContextItem[] {
  return CONTEXT_REPOSITORY.filter(item => 
    item.keywords?.some(keyword => 
      keywords.some(k => keyword.toLowerCase().includes(k.toLowerCase()))
    )
  )
}
