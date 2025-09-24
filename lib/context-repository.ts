// Context Repository - Categorized items for dynamic context selection

export interface ContextItem {
  id: string
  title: string
  content: string
  category: 'customer' | 'resource' | 'value_prop' | 'statistic' | 'quote' | 'language_style' | 'pain_points' | 'solution'
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
    content: 'Notable Food & Beverage customers include Molson Coors, Pepsi BV, Simmons, Mastronardi, Organic Valley, Nutrabolt, Megamex, Dole, Darigold, Olipop, LesserEvil, Hint',
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
    id: 'operational_efficiency_value_prop',
    title: 'Operational Efficiency Value Prop',
    content: 'Automate and streamline freight procurement → save time and effort. Reduces manual work and speeds up quote-to-booking cycles for greater productivity.',
    category: 'value_prop',
    pain_points: ['efficiency'],
    keywords: ['efficiency', 'time', 'productivity', 'automation', 'streamline']
  },
  {
    id: 'visibility_control_value_prop',
    title: 'Visibility & Control Value Prop',
    content: 'Real-time shipment tracking and centralized oversight → proactive control. Prevents blind spots and enables swift responses to delays, improving operational coordination.',
    category: 'value_prop',
    pain_points: ['visibility'],
    keywords: ['visibility', 'tracking', 'oversight', 'real-time', 'communication']
  },
  {
    id: 'capacity_network_value_prop',
    title: 'Network Capacity Value Prop',
    content: 'Extensive carrier network and instant capacity access → no more capacity shortfalls. Ensures reliable coverage with 45,000+ vetted carriers and elite partners for any load.',
    category: 'value_prop',
    pain_points: ['capacity'],
    keywords: ['capacity', 'network', 'carriers', 'coverage', 'reliability']
  },
  {
    id: 'data_insights_value_prop',
    title: 'Data Insights Value Prop',
    content: 'Data-driven insights and analytics → smarter decisions. Custom dashboards and benchmarking reveal savings, performance metrics, and opportunities to optimize procurement strategies.',
    category: 'value_prop',
    pain_points: ['insight'],
    keywords: ['analytics', 'insights', 'reporting', 'benchmarking', 'optimization']
  },
  {
    id: 'reliability_quality_value_prop',
    title: 'Quality & Reliability Value Prop',
    content: 'High-quality carrier partnerships → improved reliability. Rigorous vetting and scorecards ensure carriers meet safety and performance standards, reducing risks and delays.',
    category: 'value_prop',
    pain_points: ['reliability'],
    keywords: ['reliability', 'quality', 'performance', 'safety', 'on-time']
  },
  {
    id: 'integrations_value_prop',
    title: 'Seamless Integrations Value Prop',
    content: 'Seamless integrations with TMS and partners → unified workflow. Connect existing systems via API to eliminate double entry, enhance data flow, and automate procurement steps in one platform.',
    category: 'value_prop',
    pain_points: ['integration'],
    keywords: ['integration', 'TMS', 'automation', 'data flow', 'unified']
  },
  {
    id: 'flexibility_value_prop',
    title: 'Flexibility & Scalability Value Prop',
    content: 'Flexible procurement strategies → adapt to change quickly. Use mini-bids and AI scenario modeling to adjust to market conditions, handle surges, and rapidly implement optimal freight solutions.',
    category: 'value_prop',
    pain_points: ['flexibility'],
    keywords: ['flexibility', 'adaptability', 'resilience', 'scenario', 'dynamic']
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

  // Pain Points
  {
    id: 'cost',
    title: 'High Freight Spend & Budget Overruns',
    content: 'Shippers often overspend on freight due to limited visibility into market rates and budget alignment. Without benchmarking against live market data, freight costs can quickly exceed budgets.',
    category: 'pain_points',
    keywords: ['overspend', 'budget', 'cost', 'benchmarking']
  },
  {
    id: 'time',
    title: 'Time-Consuming Manual Processes',
    content: 'Traditional freight procurement (annual RFPs, spot quotes) takes too long. Manual spreadsheets and email-driven bids can drag on for months, consuming resources and delaying decisions.',
    category: 'pain_points',
    keywords: ['slow', 'manual', 'RFP delays', 'time-consuming', 'inefficient']
  },
  {
    id: 'capacity',
    title: 'Limited Carrier Network Access',
    content: 'Many shippers work with a narrow pool of carriers due to time or resource constraints. Inviting only familiar carriers to bids means an under-representation of available capacity, leading to suboptimal rates and potential coverage gaps.',
    category: 'pain_points',
    keywords: ['limited carriers', 'capacity constraints', 'network', 'coverage gaps']
  },
  {
    id: 'fragmentation',
    title: 'Fragmented Procurement Workflow',
    content: 'Freight procurement data and communications are often siloed across emails and spreadsheets. This fragmentation makes it difficult to track RFPs, counteroffers, and contracts, resulting in version-control issues and miscommunication.',
    category: 'pain_points',
    keywords: ['fragmented', 'siloed', 'spreadsheets', 'manual tracking']
  },
  {
    id: 'visibility',
    title: 'Lack of Market Transparency',
    content: 'Shippers lack real-time visibility into market pricing and lane performance. Without transparent market data or benchmarking tools, they struggle to make informed decisions and miss opportunities for cost improvement.',
    category: 'pain_points',
    keywords: ['no visibility', 'market data', 'transparency', 'unknown rates']
  },
  {
    id: 'reliability',
    title: 'Carrier Quality & Reliability Concerns',
    content: 'Onboarding new carriers can be risky without proper vetting. Shippers worry about unknown carriers\' safety, compliance, and service reliability, as using unverified carriers can lead to service failures or compliance issues.',
    category: 'pain_points',
    keywords: ['carrier vetting', 'reliability', 'compliance', 'trust']
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

  // Solutions / Features
  {
    id: 'contract_procurement_feature',
    title: 'Contract Procurement',
    content: 'Run efficient annual RFPs and mini-bids with advanced tools. Emerge\'s platform provides carrier insights and robust benchmarking optimized for the contract bid process, streamlining negotiations to secure the best long-term rates.',
    category: 'solution',
    pain_points: ['cost', 'time', 'capacity', 'fragmentation'],
    keywords: ['annual bids', 'mini bids', 'RFP automation', 'contract rates', 'benchmarking']
  },
  {
    id: 'spot_procurement_feature',
    title: 'Spot Procurement',
    content: 'Find on-demand freight coverage fast with confidence in your rates. The platform enables seamless RFQ execution, instant "Book It Now" carrier booking, plus real-time tracking and visibility for superior operational control in spot moves.',
    category: 'solution',
    pain_points: ['time', 'visibility', 'cost'],
    keywords: ['spot quotes', 'instant booking', 'tracking', 'visibility', 'on-demand']
  },
  {
    id: 'emerge_marketplace_feature',
    title: 'Emerge Marketplace',
    content: 'Grow your carrier network instantly via a digital marketplace of 45,000+ pre-vetted, asset-based carriers. Shippers tap into reliable capacity with competitive bidding, integrating these carriers into RFPs and spot tenders to drive down costs.',
    category: 'solution',
    pain_points: ['capacity', 'reliability', 'cost', 'fragmentation'],
    keywords: ['carrier marketplace', 'vetted carriers', 'capacity', 'competitive rates']
  },
  {
    id: 'emerge_ai_feature',
    title: 'Emerge AI Tools (ProcureOS)',
    content: 'Leverage AI-driven procurement intelligence to optimize outcomes. Emerge AI (within ProcureOS) uses machine learning to model scenarios and benchmark decisions against market data, matching loads with ideal carriers for both contract and spot freight.',
    category: 'solution',
    pain_points: ['cost', 'time', 'visibility'],
    keywords: ['AI optimization', 'Scenario Builder', 'Rate Pulse', 'lane matching', 'automation']
  },
  {
    id: 'integrations_feature',
    title: 'Integrations & Data Partners',
    content: 'Seamlessly connect Emerge with your existing systems and data sources. Out-of-the-box TMS integrations (e.g., Oracle OTM, MercuryGate) bring Emerge\'s features into your workflow, while data partners like FreightWaves SONAR (market trends) and project44 (real-time tracking) enrich your procurement intelligence.',
    category: 'solution',
    pain_points: ['fragmentation', 'visibility', 'integration'],
    keywords: ['TMS integration', 'FreightWaves', 'project44', 'data integration', 'workflow']
  },
  {
    id: 'premier_partners_feature',
    title: 'Premier Partners Program',
    content: 'Access an elite tier of carriers with proven performance. Emerge\'s Premier Carriers and Partners compete for your business, driving down rates through healthy competition and maintaining high service standards as reflected in their scorecards. Their large fleets also offer dedicated capacity for high-volume needs.',
    category: 'solution',
    pain_points: ['capacity', 'reliability', 'cost'],
    keywords: ['Premier carriers', 'elite network', 'service quality', 'dedicated capacity']
  },
  {
    id: 'capacity_link_feature',
    title: 'Capacity Link (Carrier API Connectivity)',
    content: 'Integrate carriers on a deeper level with API connectivity. Through Capacity Link, network carriers connect via EDI/API for seamless tendering and tracking directly in their system. This automation enables faster load coverage, competitive spot bidding, and minimal manual intervention via partners like Bitfreighter and others.',
    category: 'solution',
    pain_points: ['time', 'integration', 'capacity'],
    keywords: ['API integration', 'EDI', 'automation', 'carrier connectivity']
  },
  {
    id: 'reporting_analytics_feature',
    title: 'Reporting & Analytics',
    content: 'Make data-driven decisions with in-depth analytics. Emerge provides customizable dashboards and reports for scenario tracking, lane benchmarking, savings analysis, and cross-event comparisons, giving shippers strategic insights to continuously improve procurement outcomes.',
    category: 'solution',
    pain_points: ['visibility', 'cost', 'time'],
    keywords: ['analytics', 'dashboards', 'benchmark reports', 'insights', 'KPIs']
  },
  {
    id: 'carrier_scorecards_feature',
    title: 'Carrier Scorecards',
    content: 'Evaluate carrier performance and compliance at a glance. Emerge\'s Carrier Scorecards combine FMCSA safety and compliance data with custom performance metrics, offering shippers transparent insight into carrier reliability for more informed carrier selection in bids.',
    category: 'solution',
    pain_points: ['reliability', 'visibility'],
    keywords: ['carrier performance', 'scorecards', 'safety metrics', 'compliance']
  },

  // Language Styles - Generic (for cross-persona use)
  {
    id: 'enterprise_language',
    title: 'Enterprise Language Style',
    content: 'Use "I know enterprise pricing isn\'t one-size-fits-all..." instead of "Your enterprise needs...". Focus on scalability, ROI, and enterprise-level challenges. Best for large organizations and C-suite executives.',
    category: 'language_style',
    persona: ['ceo', 'coo', 'cfo', 'cpo', 'csco'],
    keywords: ['enterprise', 'scalability', 'roi', 'enterprise-level']
  },
  {
    id: 'smb_language',
    title: 'SMB Language Style',
    content: 'Use "I know every dollar counts when you\'re growing..." instead of "Small businesses need...". Focus on growth, efficiency, and cost-consciousness. Best for growing companies and owner/founders.',
    category: 'language_style',
    persona: ['owner_founder', 'first_logistics_manager'],
    keywords: ['small business', 'growing', 'every dollar counts', 'growth']
  },
  {
    id: 'cost_focused_language',
    title: 'Cost-Focused Language Style',
    content: 'Use "I\'d love to show you what your numbers could look like" and "I think you\'d be surprised at how much you could save." Focus on savings and cost reduction. Best for finance roles and cost-conscious personas.',
    category: 'language_style',
    persona: ['cfo', 'cpo', 'finance_upper_management', 'finance_middle_management', 'finance_entry_level'],
    pain_points: ['cost'],
    keywords: ['cost', 'savings', 'numbers', 'save', 'budget']
  },
  {
    id: 'efficiency_focused_language',
    title: 'Efficiency-Focused Language Style',
    content: 'Use "I know how tough it can be to manage all those spreadsheets and emails" and "What if you could automate that entire process?" Focus on time savings and automation. Best for operations roles and efficiency-focused personas.',
    category: 'language_style',
    persona: ['coo', 'csco', 'operations_upper_management', 'operations_middle_management', 'operations_entry_level'],
    pain_points: ['effort', 'efficiency'],
    keywords: ['efficiency', 'automation', 'time', 'spreadsheets', 'emails']
  },
  
  // Persona-specific context items
  // CEO
  {
    id: 'ceo_pain_points',
    title: 'CEO Pain Points',
    content: 'Strategic Challenges: balancing shareholder demands for profitability with resilient, sustainable freight procurement, limited visibility into how freight costs impact overall corporate strategy, difficulty aligning freight procurement with growth goals. Operational Pain Points: fragmented procurement practices across business units reducing efficiency, over-reliance on outdated procurement models that limit agility, inefficient communication between freight procurement and other strategic functions.',
    category: 'pain_points',
    persona: ['ceo'],
    keywords: ['ceo', 'strategic', 'executive', 'corporate']
  },
  {
    id: 'ceo_tone_profile',
    title: 'CEO Tone Profile',
    content: 'Be direct and decisive – cut to the chase with the big picture. Focus on outcomes and strategy – emphasize long-term vision, market position, and competitive edge. Use high-level language – avoid operational details unless directly tied to business growth or risk. Concise but compelling – short, impactful phrasing that reinforces urgency and direction.',
    category: 'language_style',
    persona: ['ceo'],
    keywords: ['ceo', 'strategic', 'executive', 'vision', 'competitive']
  },
  
  // COO
  {
    id: 'coo_pain_points',
    title: 'COO Pain Points',
    content: 'Strategic Challenges: translating the CEO\'s vision into executable operational strategies, balancing growth, efficiency, and agility in a fast-changing environment, scaling operations to support expansion while keeping costs under control. Operational Efficiency: eliminating silos between business units to improve collaboration, streamlining processes and reducing inefficiencies in workflows, maintaining consistent performance across global operations.',
    category: 'pain_points',
    persona: ['coo'],
    keywords: ['coo', 'operations', 'execution', 'efficiency']
  },
  {
    id: 'coo_tone_profile',
    title: 'COO Tone Profile',
    content: 'Be pragmatic and operational – focus on execution, efficiency, and scalability. Emphasize processes and performance metrics – KPIs, throughput, productivity. Balance detail with clarity – enough to explain how the system runs without bogging down. Results-oriented tone – show how initiatives translate into smoother operations.',
    category: 'language_style',
    persona: ['coo'],
    keywords: ['coo', 'operational', 'efficiency', 'execution', 'metrics']
  },
  
  // CFO
  {
    id: 'cfo_pain_points',
    title: 'CFO Pain Points',
    content: 'Strategic Challenges: balancing short-term financial performance with long-term growth strategy, driving digital transformation while maintaining financial discipline, navigating M&A, investments, and divestitures. Financial Management: maintaining accurate forecasting in volatile markets, managing cash flow and liquidity under uncertainty, reducing costs without stifling innovation or growth.',
    category: 'pain_points',
    persona: ['cfo'],
    keywords: ['cfo', 'financial', 'strategy', 'performance']
  },
  {
    id: 'cfo_tone_profile',
    title: 'CFO Tone Profile',
    content: 'Be precise and evidence-based – numbers, trends, and cost-benefit clarity. Highlight financial impact – ROI, margins, savings, and risk exposure should lead. Be structured – organized, logical delivery with supporting metrics. Eliminate fluff – concise, data-heavy, and straight to financial implications.',
    category: 'language_style',
    persona: ['cfo'],
    keywords: ['cfo', 'financial', 'roi', 'analytics', 'performance']
  },
  
  // CPO
  {
    id: 'cpo_pain_points',
    title: 'CPO Pain Points',
    content: 'Strategic Challenges: balancing long-term supplier partnerships with short-term cost savings, lack of alignment between procurement and other supply chain stakeholders. Operational Pain Points: manual, time-consuming tendering processes, fragmented workflows across global procurement teams, high administrative burden in managing multiple carriers and brokers.',
    category: 'pain_points',
    persona: ['cpo'],
    keywords: ['cpo', 'procurement', 'sourcing', 'supplier']
  },
  {
    id: 'cpo_tone_profile',
    title: 'CPO Tone Profile',
    content: 'Be strategic with operational depth – balance long-term goals with actionable next steps. Use comparative insights – benchmark performance, highlight best practices. Show resource allocation impact – budgets, technology adoption, vendor choices. Confident and professional – present clear recommendations backed by data.',
    category: 'language_style',
    persona: ['cpo'],
    keywords: ['cpo', 'procurement', 'sourcing', 'strategic', 'excellence']
  },
  
  // CSCO
  {
    id: 'csco_pain_points',
    title: 'CSCO Pain Points',
    content: 'Strategic Challenges: balancing supply chain resilience with procurement cost efficiency, ensuring freight procurement supports customer service expectations, aligning procurement with sustainability and decarbonization targets. Operational Pain Points: fragmented freight procurement processes across regions and modes, lack of real-time shipment visibility impacting planning accuracy.',
    category: 'pain_points',
    persona: ['csco'],
    keywords: ['csco', 'supply chain', 'resilience', 'customer service']
  },
  {
    id: 'csco_tone_profile',
    title: 'CSCO Tone Profile',
    content: 'Be comprehensive but focused – cover risks, dependencies, and performance drivers. Prioritize resilience and optimization – emphasize cost efficiency, reliability, and adaptability. Speak risk-aware – highlight disruptions, mitigations, and continuity planning. Analytical and structured – rely on data, forecasts, and supply chain models.',
    category: 'language_style',
    persona: ['csco'],
    keywords: ['csco', 'supply chain', 'resilience', 'optimization', 'strategy']
  },
  
  // Owner/Founder
  {
    id: 'owner_founder_pain_points',
    title: 'Owner/Founder Pain Points',
    content: 'Strategic & Vision Challenges: balancing long-term vision with short-term execution pressures, difficulty in prioritizing opportunities vs. distractions, adapting business strategy to rapidly changing market conditions. Financial & Resource Strain: securing consistent cash flow and funding, managing investor expectations while protecting company culture, budget allocation trade-offs between growth and sustainability.',
    category: 'pain_points',
    persona: ['owner_founder'],
    keywords: ['owner', 'founder', 'vision', 'growth', 'strategy']
  },
  {
    id: 'owner_founder_tone_profile',
    title: 'Owner/Founder Tone Profile',
    content: 'Be visionary and inspiring – tie messages to purpose, mission, and the "why" behind the business. Personal and passionate – show genuine belief in the product, service, or company\'s journey. Focus on long-term value – sustainability, legacy, and reputation matter alongside financials. Balance detail with narrative – data is useful, but storytelling and conviction often resonate more.',
    category: 'language_style',
    persona: ['owner_founder'],
    keywords: ['owner', 'founder', 'vision', 'growth', 'innovation', 'leadership']
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
  
  // First-ever Logistics Manager
  {
    id: 'first_logistics_manager_pain_points',
    title: 'First-ever Logistics Manager Pain Points',
    content: 'Building from Scratch: establishing processes and systems where none existed before, creating logistics infrastructure for a growing company, defining roles and responsibilities for the new logistics function, setting up carrier relationships and vendor management processes. Resource Constraints: limited budget for logistics technology and tools, need to prove ROI of logistics investments to leadership, balancing cost control with service quality as the company scales.',
    category: 'pain_points',
    persona: ['first_logistics_manager'],
    keywords: ['logistics', 'first-ever', 'startup', 'growing', 'building']
  },
  {
    id: 'first_logistics_manager_tone_profile',
    title: 'First-ever Logistics Manager Tone Profile',
    content: 'Be supportive and educational – acknowledge they\'re building something new. Focus on practical, actionable solutions – show how to establish processes and systems. Emphasize growth and scalability – help them build for the future. Use encouraging language – recognize the challenge and opportunity of creating something from scratch.',
    category: 'language_style',
    persona: ['first_logistics_manager'],
    keywords: ['logistics', 'first-ever', 'startup', 'growing', 'building', 'establishing']
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
