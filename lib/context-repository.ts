// Context Repository - Categorized items for dynamic context selection

export interface ContextItem {
  id: string
  title: string
  content: string
  category: 'customer' | 'resource' | 'value_prop' | 'statistic' | 'quote' | 'language_style' | 'pain_points'
  industry?: string[]
  persona?: string[]
  pain_points?: string[]
  keywords?: string[]
  url?: string
}

export const CONTEXT_REPOSITORY: ContextItem[] = [
  // Customers by Industry
  {
    id: 'retail_customers',
    title: 'Retail Customers',
    content: 'Notable Retail customers include Dollar Tree, Albertsons, Staples, Wayfair, Foot Locker, U-Haul, Abercrombie, Floor & Decor, Ace',
    category: 'customer',
    industry: ['retail', 'food_retail', 'ecommerce'],
    keywords: ['retail', 'store', 'chain', 'grocery', 'shopping']
  },
  {
    id: 'food_beverage_customers',
    title: 'Food & Beverage Customers',
    content: 'Notable Food & Beverage customers include Frito Lay, AB, Olam, Molson Coors, Pepsi BV, Simmons, Mastronardi, Organic Valley, Nutrabolt, Megamex, Dole, Darigold, Olipop, LesserEvil, Hint',
    category: 'customer',
    industry: ['food_beverage', 'food_production', 'beverage'],
    keywords: ['food', 'beverage', 'snack', 'drink', 'production', 'manufacturing']
  },
  {
    id: 'automotive_customers',
    title: 'Automotive Customers',
    content: 'Notable Automotive customers include Honda, Bridgestone, Discount Tire',
    category: 'customer',
    industry: ['automotive', 'tire', 'manufacturing'],
    keywords: ['auto', 'car', 'tire', 'vehicle', 'automotive']
  },
  {
    id: 'logistics_customers',
    title: 'Logistics Customers',
    content: 'Notable Logistics customers include DHL, EZRack, ArcBest, Roadrunner, US Cold Storage, Allen Dist.',
    category: 'customer',
    industry: ['logistics', 'transportation', 'warehousing'],
    keywords: ['logistics', 'shipping', 'transport', 'warehouse', 'distribution']
  },
  {
    id: 'manufacturing_customers',
    title: 'Manufacturing Customers',
    content: 'Notable Manufacturing customers include Unilever, Whirlpool, Stanley B&D, Jones Soda, Tyson, Mars, Land O\'Lakes, Smithfield, HP Hood, Butterball',
    category: 'customer',
    industry: ['manufacturing', 'food_production', 'consumer_goods'],
    keywords: ['manufacturing', 'production', 'factory', 'plant', 'industrial']
  },

  // Resources
  {
    id: 'dollar_tree_case_study',
    title: 'Dollar Tree Case Study',
    content: 'Dollar Tree saved $3.2 million in freight spend within 6 months, and $6M in 2024 using Emerge. Average lane was ~2% below market average.',
    category: 'resource',
    industry: ['retail', 'food_retail'],
    keywords: ['dollar tree', 'retail', 'savings', 'cost reduction'],
    pain_points: ['cost'],
    url: 'https://www.emergemarket.com/resource/dollar-tree-study'
  },
  {
    id: 'golden_state_foods_case_study',
    title: 'Golden State Foods Case Study',
    content: '18% reduction in transportation costs, increased RFP qty to 10 per year. Pool of carriers expanded from 35 to 55—a 57% increase. 35 of their 69 lanes gained new options.',
    category: 'resource',
    industry: ['food_beverage', 'food_production'],
    keywords: ['golden state foods', 'food', 'carrier expansion', 'rfp'],
    pain_points: ['cost', 'efficiency'],
    url: 'https://www.emergemarket.com/resource/golden-state-foods-case-study'
  },
  {
    id: 'ezrack_case_study',
    title: 'EZRack Case Study',
    content: 'Realized 6 figure savings in less than a year, saves countless man hours in manual work.',
    category: 'resource',
    industry: ['logistics', 'warehousing'],
    keywords: ['ezrack', 'logistics', 'savings', 'automation'],
    pain_points: ['effort', 'efficiency'],
    url: 'https://www.emergemarket.com/resource/ezrack-case-study'
  },
  {
    id: 'pepsi_case_study',
    title: 'Pepsi Co. Case Study',
    content: 'Reduced the time to run RFP\'s by 20%.',
    category: 'resource',
    industry: ['food_beverage', 'beverage'],
    keywords: ['pepsi', 'beverage', 'rfp', 'time savings'],
    pain_points: ['effort', 'efficiency'],
    url: 'https://www.emergemarket.com/resource/pepsi-bottling-case-study'
  },
  {
    id: 'premier_carrier_program_case_study',
    title: 'Premier Carrier Program Case Study',
    content: 'Premier Carrier Program provides enhanced service levels and priority access to capacity through strategic carrier partnerships.',
    category: 'resource',
    industry: ['logistics', 'transportation'],
    keywords: ['premier carrier', 'program', 'service levels', 'capacity', 'partnerships'],
    pain_points: ['efficiency'],
    url: 'https://www.emergemarket.com/resource/premier-carrier-case-study'
  },
  {
    id: 'dbin_case_study',
    title: 'DBIN Case Study',
    content: 'Dynamic Book It Now (DBIN) enables instant freight booking with real-time pricing and immediate carrier confirmation.',
    category: 'resource',
    industry: ['logistics', 'transportation'],
    keywords: ['dbin', 'dynamic book it now', 'instant booking', 'real-time pricing', 'immediate confirmation'],
    pain_points: ['efficiency', 'effort'],
    url: 'https://www.emergemarket.com/resource/dynamic-book-it-now-case-study'
  },
  {
    id: 'platform_overview_video',
    title: 'Emerge Platform Overview Video',
    content: 'Quick 30-second platform overview video showcasing Emerge\'s core capabilities for freight procurement, carrier access, and key platform features. This is a high-level introduction to the platform, not a detailed case study walkthrough. Use this video to introduce prospects to the platform capabilities, separate from specific customer case studies.',
    category: 'resource',
    industry: ['logistics', 'transportation', 'retail', 'food_beverage', 'manufacturing', 'automotive'],
    keywords: ['platform', 'overview', 'video', 'demo', 'freight', 'procurement', 'carrier management', '30 second', 'quick', 'introduction', 'capabilities'],
    pain_points: ['efficiency', 'effort', 'cost'],
    url: 'https://emergemarket.wistia.com/medias/mnrknev8dc'
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
    content: 'Limited/unused networks leave lanes uncovered → solved w/ 1,000s of vetted carriers in Emerge. Results in ↑ coverage and better lane options.',
    category: 'value_prop',
    pain_points: ['efficiency'],
    keywords: ['coverage', 'carriers', 'network', 'lanes', 'capacity']
  },

  // Statistics
  {
    id: 'dollar_tree_stats',
    title: 'Dollar Tree Statistics',
    content: 'Within 6 months, Dollar Tree saved $3.2 million in freight spend, in 2024 Dollar Tree saved $6M using Emerge. Average lane was ~2% below market average.',
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
  },
  
  // Persona-specific context items
  // Operations C-Suite
  {
    id: 'operations_c_suite_pain_points',
    title: 'Operations C-Suite Pain Points',
    content: 'Strategic cost optimization vs service reliability balance, limited visibility into end-to-end freight costs, difficulty maintaining flexibility with long-term contracts, fragmented processes across regions and business units, manual time-consuming procurement processes, high administrative overhead managing multiple carriers, lack of real-time visibility into disruptions, volatile freight rates and market cycles, limited ability to benchmark carrier rates effectively, difficulty proving cost savings to stakeholders.',
    category: 'pain_points',
    persona: ['operations_c_suite'],
    keywords: ['operations', 'c-suite']
  },
  {
    id: 'operations_c_suite_tone_profile',
    title: 'Operations C-Suite Tone Profile',
    content: 'Strategic, executive-level language focusing on ROI, scalability, and enterprise-wide impact. Use terms like "strategic initiatives," "enterprise-wide," "C-level visibility," and "board-level metrics." Emphasize high-level business outcomes and competitive advantage.',
    category: 'language_style',
    persona: ['operations_c_suite'],
    keywords: ['operations', 'c-suite']
  },
  
  // Operations Upper Management
  {
    id: 'operations_upper_management_pain_points',
    title: 'Operations Upper Management Pain Points',
    content: 'Strategic Challenges: balancing cost optimization with service reliability and customer expectations, limited visibility into end-to-end freight costs making it hard to forecast and budget accurately, difficulty in maintaining flexibility while also committing to long-term carrier contracts. Operational Pain Points: fragmented processes across regions, modes, and business units that hinder standardization, manual time-consuming tendering and carrier selection processes, high administrative overhead due to managing multiple carriers, freight forwarders, and brokers, lack of real-time visibility into shipment status, exceptions, and disruptions.',
    category: 'pain_points',
    persona: ['operations_upper_management'],
    keywords: ['operations', 'upper management']
  },
  {
    id: 'operations_upper_management_tone_profile',
    title: 'Operations Upper Management Tone Profile',
    content: 'Management-focused language emphasizing operational efficiency, team leadership, and departmental impact. Use terms like "operational excellence," "team productivity," "process optimization," and "departmental metrics." Focus on practical solutions and team management challenges.',
    category: 'language_style',
    persona: ['operations_upper_management'],
    keywords: ['operations', 'upper management']
  },
  
  // Operations Middle Management
  {
    id: 'operations_middle_management_pain_points',
    title: 'Operations Middle Management Pain Points',
    content: 'Day-to-day operational execution challenges, managing team workload during peak shipping seasons, coordinating between different departments and carriers, implementing new processes while maintaining current operations, limited budget authority for carrier negotiations, pressure to meet cost reduction targets, managing carrier relationships and performance issues, handling exceptions and disruptions in real-time, training team members on new systems and processes, reporting to upper management on operational metrics.',
    category: 'pain_points',
    persona: ['operations_middle_management'],
    keywords: ['operations', 'middle management']
  },
  {
    id: 'operations_middle_management_tone_profile',
    title: 'Operations Middle Management Tone Profile',
    content: 'Practical, hands-on language focusing on execution, team management, and daily operations. Use terms like "day-to-day," "hands-on," "practical solutions," "team coordination," and "operational execution." Emphasize practical implementation and team management.',
    category: 'language_style',
    persona: ['operations_middle_management'],
    keywords: ['operations', 'middle management']
  },
  
  // Operations Entry Level
  {
    id: 'operations_entry_level_pain_points',
    title: 'Operations Entry Level Pain Points',
    content: 'Learning complex freight and logistics processes, managing multiple carrier relationships and systems, handling high volume of daily operational tasks, understanding freight rates and market dynamics, coordinating shipments across different modes and regions, managing exceptions and problem resolution, learning to use various transportation management systems, understanding compliance and regulatory requirements, managing customer service and communication, learning to negotiate with carriers.',
    category: 'pain_points',
    persona: ['operations_entry_level'],
    keywords: ['operations', 'entry level']
  },
  {
    id: 'operations_entry_level_tone_profile',
    title: 'Operations Entry Level Tone Profile',
    content: 'Supportive, educational language focusing on learning, growth, and skill development. Use terms like "learning opportunity," "skill development," "career growth," "mentorship," and "professional development." Emphasize support and learning.',
    category: 'language_style',
    persona: ['operations_entry_level'],
    keywords: ['operations', 'entry level']
  },
  
  // Operations Intern
  {
    id: 'operations_intern_pain_points',
    title: 'Operations Intern Pain Points',
    content: 'Understanding basic freight and logistics concepts, learning company processes and systems, managing administrative tasks and data entry, understanding different transportation modes, learning to communicate with carriers and customers, understanding basic cost and pricing concepts, managing time and meeting deadlines, learning to use company software and tools, understanding basic compliance requirements, learning to work in a team environment.',
    category: 'pain_points',
    persona: ['operations_intern'],
    keywords: ['operations', 'intern']
  },
  {
    id: 'operations_intern_tone_profile',
    title: 'Operations Intern Tone Profile',
    content: 'Encouraging, educational language focusing on learning, exploration, and professional development. Use terms like "learning experience," "exploration," "discovery," "mentorship," and "professional growth." Emphasize learning and development opportunities.',
    category: 'language_style',
    persona: ['operations_intern'],
    keywords: ['operations', 'intern']
  },
  
  // Finance C-Suite
  {
    id: 'finance_c_suite_pain_points',
    title: 'Finance C-Suite Pain Points',
    content: 'Strategic financial planning and budgeting challenges, limited visibility into transportation cost drivers, difficulty forecasting freight costs accurately, managing financial risk in volatile freight markets, ensuring compliance with financial regulations, optimizing working capital tied up in transportation, managing currency fluctuations in global operations, ensuring accurate financial reporting and controls, managing relationships with financial stakeholders, balancing cost control with operational requirements.',
    category: 'pain_points',
    persona: ['finance_c_suite'],
    keywords: ['finance', 'c-suite']
  },
  {
    id: 'finance_c_suite_tone_profile',
    title: 'Finance C-Suite Tone Profile',
    content: 'Executive financial language emphasizing ROI, financial performance, and strategic financial planning. Use terms like "financial performance," "ROI," "strategic planning," "financial controls," and "stakeholder value." Focus on high-level financial outcomes.',
    category: 'language_style',
    persona: ['finance_c_suite'],
    keywords: ['finance', 'c-suite']
  },
  
  // Finance Upper Management
  {
    id: 'finance_upper_management_pain_points',
    title: 'Finance Upper Management Pain Points',
    content: 'Managing transportation budget and cost control, ensuring accurate financial reporting and analysis, managing financial relationships with carriers, ensuring compliance with financial regulations, managing financial performance metrics, ensuring proper financial controls and processes, managing financial risk and exposure, ensuring proper financial planning and forecasting, managing financial relationships with stakeholders, ensuring proper financial controls and audits.',
    category: 'pain_points',
    persona: ['finance_upper_management'],
    keywords: ['finance', 'upper management']
  },
  {
    id: 'finance_upper_management_tone_profile',
    title: 'Finance Upper Management Tone Profile',
    content: 'Management financial language emphasizing departmental financial performance, team management, and financial controls. Use terms like "financial management," "departmental performance," "financial controls," and "team leadership." Focus on financial management and team leadership.',
    category: 'language_style',
    persona: ['finance_upper_management'],
    keywords: ['finance', 'upper management']
  },
  
  // Finance Middle Management
  {
    id: 'finance_middle_management_pain_points',
    title: 'Finance Middle Management Pain Points',
    content: 'Day-to-day financial operations and reporting, managing financial data and analysis, coordinating with operations on budget planning, managing financial relationships with carriers, ensuring accurate financial reporting, managing financial performance metrics, ensuring compliance with financial regulations, managing financial risk and exposure, ensuring proper financial controls and processes, managing financial relationships with stakeholders.',
    category: 'pain_points',
    persona: ['finance_middle_management'],
    keywords: ['finance', 'middle management']
  },
  {
    id: 'finance_middle_management_tone_profile',
    title: 'Finance Middle Management Tone Profile',
    content: 'Practical financial language emphasizing execution, financial analysis, and team coordination. Use terms like "financial analysis," "practical solutions," "team coordination," and "financial execution." Focus on practical financial management.',
    category: 'language_style',
    persona: ['finance_middle_management'],
    keywords: ['finance', 'middle management']
  },
  
  // Finance Entry Level
  {
    id: 'finance_entry_level_pain_points',
    title: 'Finance Entry Level Pain Points',
    content: 'Learning financial concepts and processes, managing financial data and reporting, understanding financial regulations and compliance, learning to use financial systems and tools, managing financial relationships with carriers, understanding financial performance metrics, learning to analyze financial data, understanding financial risk management, managing financial documentation and records, learning to work with financial stakeholders.',
    category: 'pain_points',
    persona: ['finance_entry_level'],
    keywords: ['finance', 'entry level']
  },
  {
    id: 'finance_entry_level_tone_profile',
    title: 'Finance Entry Level Tone Profile',
    content: 'Supportive financial language emphasizing learning, skill development, and professional growth. Use terms like "financial learning," "skill development," "professional growth," and "financial education." Focus on learning and development.',
    category: 'language_style',
    persona: ['finance_entry_level'],
    keywords: ['finance', 'entry level']
  },
  
  // Finance Intern
  {
    id: 'finance_intern_pain_points',
    title: 'Finance Intern Pain Points',
    content: 'Understanding basic financial concepts, learning company financial processes, managing financial data entry and reporting, understanding financial regulations and compliance, learning to use financial systems and tools, understanding financial performance metrics, learning to analyze basic financial data, understanding financial risk management, managing financial documentation and records, learning to work with financial stakeholders.',
    category: 'pain_points',
    persona: ['finance_intern'],
    keywords: ['finance', 'intern']
  },
  {
    id: 'finance_intern_tone_profile',
    title: 'Finance Intern Tone Profile',
    content: 'Encouraging financial language emphasizing learning, exploration, and professional development. Use terms like "financial learning," "exploration," "discovery," and "professional development." Focus on learning and exploration.',
    category: 'language_style',
    persona: ['finance_intern'],
    keywords: ['finance', 'intern']
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
