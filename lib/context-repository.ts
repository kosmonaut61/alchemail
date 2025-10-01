// Simplified context repository with only the 11 personas

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
  // Customer Case Studies
  {
    id: 'dollar_tree_case_study',
    title: 'Dollar Tree Case Study',
    content: 'Dollar Tree saved $6M annually by optimizing their freight procurement process. They reduced transportation costs by 15% and improved carrier performance through better rate visibility and negotiation.',
    category: 'customer',
    industry: ['retail', 'food_retail'],
    keywords: ['dollar tree', 'retail', 'savings', 'cost reduction'],
    pain_points: ['cost'],
    url: 'https://www.emergemarket.com/resource/dollar-tree-study'
  },
  {
    id: 'golden_state_foods_case_study',
    title: 'Golden State Foods Case Study',
    content: 'Golden State Foods cut freight costs by 18% and increased RFP quantity to 10 per year. They expanded their carrier pool and improved procurement efficiency through better market visibility.',
    category: 'customer',
    industry: ['food_beverage', 'food_production'],
    keywords: ['golden state foods', 'food', 'carrier expansion', 'rfp'],
    pain_points: ['cost', 'efficiency'],
    url: 'https://www.emergemarket.com/resource/golden-state-foods-case-study'
  },
  {
    id: 'ezrack_case_study',
    title: 'EZRack Case Study',
    content: 'EZRack realized double-digit percentage savings in less than a year and saved countless man hours in manual work. They automated their freight procurement process and improved operational efficiency.',
    category: 'customer',
    industry: ['logistics', 'warehousing'],
    keywords: ['ezrack', 'logistics', 'savings', 'automation'],
    pain_points: ['effort', 'efficiency'],
    url: 'https://www.emergemarket.com/resource/ezrack-case-study'
  },
  {
    id: 'pepsi_case_study',
    title: 'Pepsi Co. Case Study',
    content: 'Pepsi Co. reduced the time to run RFPs by 20% through streamlined procurement processes. They improved efficiency in their freight procurement operations.',
    category: 'customer',
    industry: ['food_beverage', 'beverage'],
    keywords: ['pepsi', 'beverage', 'rfp', 'time savings'],
    pain_points: ['effort', 'efficiency'],
    url: 'https://www.emergemarket.com/resource/pepsi-bottling-case-study'
  },
  {
    id: 'premier_carrier_case_study',
    title: 'Premier Carrier Program Case Study',
    content: 'Premier Carrier Program provides enhanced service levels and priority access to capacity through strategic partnerships. This program ensures reliable coverage with elite carriers for consistent performance.',
    category: 'customer',
    industry: ['logistics', 'transportation'],
    keywords: ['premier carrier', 'program', 'service levels', 'capacity', 'partnerships'],
    pain_points: ['efficiency'],
    url: 'https://www.emergemarket.com/resource/premier-carrier-case-study'
  },
  {
    id: 'dbin_case_study',
    title: 'DBIN Case Study',
    content: 'Dynamic Book It Now (DBIN) enables instant booking with real-time pricing and immediate confirmation. This feature provides on-demand capacity access with competitive rates.',
    category: 'customer',
    industry: ['logistics', 'transportation'],
    keywords: ['dbin', 'dynamic book it now', 'instant booking', 'real-time pricing', 'immediate confirmation'],
    pain_points: ['efficiency', 'effort'],
    url: 'https://www.emergemarket.com/resource/dynamic-book-it-now-case-study'
  },
  {
    id: 'emerge_platform_overview',
    title: 'Emerge Platform Overview Video',
    content: '30-second overview video showing how Emerge helps teams streamline freight procurement. Quick introduction to platform capabilities and value proposition.',
    category: 'resource',
    industry: ['logistics', 'transportation', 'retail', 'food_beverage', 'manufacturing', 'automotive'],
    keywords: ['platform', 'overview', 'video', 'demo', 'freight', 'procurement', 'carrier management', '30 second', 'quick', 'introduction', 'capabilities'],
    pain_points: ['efficiency', 'effort', 'cost'],
    url: 'https://emergemarket.wistia.com/medias/mnrknev8dc'
  },

  // Statistics
  {
    id: 'dollar_tree_stats',
    title: 'Dollar Tree Statistics',
    content: 'Dollar Tree achieved $6M annual savings through freight procurement optimization. Saved $3.2 million in freight spend within 6 months, and $6M in 2024 using ProcureOS. Average lane was ~2% below market average.',
    category: 'statistic',
    industry: ['retail', 'food_retail'],
    keywords: ['dollar tree', 'cost reduction', 'savings', '15%', '6M'],
    pain_points: ['cost']
  },
  {
    id: 'golden_state_foods_stats',
    title: 'Golden State Foods Statistics',
    content: 'Golden State Foods cut freight costs by 18% and increased RFP quantity from 1 to 10 per year.',
    category: 'statistic',
    industry: ['food_beverage', 'food_production'],
    keywords: ['golden state foods', '18%', 'cost reduction', 'rfp', '10 per year'],
    pain_points: ['cost', 'efficiency']
  },
  {
    id: 'ezrack_stats',
    title: 'EZRack Statistics',
    content: 'EZRack realized double-digit percentage savings in less than a year.',
    category: 'statistic',
    industry: ['logistics', 'warehousing'],
    keywords: ['ezrack', 'double-digit', 'savings', 'percentage'],
    pain_points: ['cost', 'efficiency']
  },
  {
    id: 'pepsi_stats',
    title: 'Pepsi Statistics',
    content: 'Pepsi Co. reduced the time to run RFPs by ~20% through streamlined procurement processes.',
    category: 'statistic',
    industry: ['food_beverage', 'beverage'],
    keywords: ['pepsi', '20%', 'rfp', 'time reduction', 'streamlined'],
    pain_points: ['efficiency', 'time']
  },
  {
    id: 'dbin_stats',
    title: 'Dynamic Book It Now Statistics',
    content: '80% of tender transactions through Dynamic Book It Now are virtually instantaneous with direct integrations. Average savings when customers use DBIN are 8.5% with one customer saving 22% below market on one of their lanes.',
    category: 'statistic',
    industry: ['logistics', 'transportation'],
    keywords: ['dbin', 'dynamic book it now', '80%', 'instantaneous', '8.5%', 'savings', '22%', 'market'],
    pain_points: ['efficiency', 'time', 'cost']
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
    id: 'network_capacity_value_prop',
    title: 'Network Capacity Value Prop',
    content: 'Extensive carrier network and instant capacity access → no more capacity shortfalls. Ensures reliable coverage with thousands of vetted carriers and elite partners for any load.',
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
    id: 'quality_reliability_value_prop',
    title: 'Quality & Reliability Value Prop',
    content: 'High-quality carrier partnerships → improved reliability. Rigorous vetting and scorecards ensure carriers meet safety and performance standards, reducing risks and delays.',
    category: 'value_prop',
    pain_points: ['reliability'],
    keywords: ['reliability', 'quality', 'performance', 'safety', 'on-time']
  },
  {
    id: 'seamless_integrations_value_prop',
    title: 'Seamless Integrations Value Prop',
    content: 'Seamless integrations with TMS and partners → unified workflow. Connect existing systems via API to eliminate double entry, enhance data flow, and automate procurement steps in one platform.',
    category: 'value_prop',
    pain_points: ['integration'],
    keywords: ['integration', 'TMS', 'automation', 'data flow', 'unified']
  },
  {
    id: 'flexibility_scalability_value_prop',
    title: 'Flexibility & Scalability Value Prop',
    content: 'Flexible procurement strategies → adapt to change quickly. Use mini-bids and AI scenario modeling to adjust to market conditions, handle surges, and rapidly implement optimal freight solutions.',
    category: 'value_prop',
    pain_points: ['flexibility'],
    keywords: ['flexibility', 'adaptability', 'resilience', 'scenario', 'dynamic']
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

  // Solutions
  {
    id: 'contract_procurement',
    title: 'Contract Procurement',
    content: 'Run efficient annual RFPs and mini-bids with advanced tools. Emerge\'s platform provides carrier insights and robust benchmarking optimized for the contract bid process, streamlining negotiations to secure the best long-term rates.',
    category: 'solution',
    pain_points: ['cost', 'time', 'capacity', 'fragmentation'],
    keywords: ['annual bids', 'mini bids', 'RFP automation', 'contract rates', 'benchmarking']
  },
  {
    id: 'spot_procurement',
    title: 'Spot Procurement',
    content: 'Find on-demand freight coverage fast with confidence in your rates. The platform enables seamless RFQ execution, instant "Book It Now" carrier booking, plus real-time tracking and visibility for superior operational control in spot moves.',
    category: 'solution',
    pain_points: ['time', 'visibility', 'cost'],
    keywords: ['spot quotes', 'instant booking', 'tracking', 'visibility', 'on-demand']
  },
  {
    id: 'emerge_marketplace',
    title: 'Emerge Marketplace',
    content: 'Grow your carrier network instantly via a digital marketplace of 45,000+ pre-vetted, asset-based carriers. Shippers tap into reliable capacity with competitive bidding, integrating these carriers into RFPs and spot tenders to drive down costs.',
    category: 'solution',
    pain_points: ['capacity', 'reliability', 'cost', 'fragmentation'],
    keywords: ['carrier marketplace', 'vetted carriers', 'capacity', 'competitive rates']
  },

  // Language Styles
  {
    id: 'enterprise_language',
    title: 'Enterprise Language Style',
    content: 'Use "I know enterprise pricing isn\'t one-size-fits-all..." instead of "Your enterprise needs...". Focus on scalability, ROI, and enterprise-level challenges. Best for large organizations and C-suite executives.',
    category: 'language_style',
    persona: ['ceo', 'coo', 'cfo', 'csco'],
    keywords: ['enterprise', 'scalability', 'roi', 'enterprise-level']
  },
  {
    id: 'smb_language',
    title: 'SMB Language Style',
    content: 'Use "I know every dollar counts when you\'re growing..." instead of "Small businesses need...". Focus on growth, efficiency, and cost-consciousness. Best for growing companies and owner/founders.',
    category: 'language_style',
    persona: ['operations_management'],
    keywords: ['small business', 'growing', 'every dollar counts', 'growth']
  },
  {
    id: 'cost_focused_language',
    title: 'Cost-Focused Language Style',
    content: 'Use "I\'d love to show you what your numbers could look like" and "I think you\'d be surprised at how much you could save." Focus on savings and cost reduction. Best for finance roles and cost-conscious personas.',
    category: 'language_style',
    persona: ['cfo', 'finance_management', 'finance_entry_level'],
    pain_points: ['cost'],
    keywords: ['cost', 'savings', 'numbers', 'save', 'budget']
  },
  {
    id: 'efficiency_focused_language',
    title: 'Efficiency-Focused Language Style',
    content: 'Use "I know how tough it can be to manage all those spreadsheets and emails" and "What if you could automate that entire process?" Focus on time savings and automation. Best for operations roles and efficiency-focused personas.',
    category: 'language_style',
    persona: ['coo', 'csco', 'operations_management', 'operations_entry_level'],
    pain_points: ['effort', 'efficiency'],
    keywords: ['efficiency', 'automation', 'time', 'spreadsheets', 'emails']
  },
  
  // Persona-specific context items
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
  {
    id: 'president_pain_points',
    title: 'President Pain Points',
    content: 'Strategic Challenges: balancing shareholder demands for profitability with resilient, sustainable freight procurement, limited visibility into how freight costs impact overall corporate strategy, difficulty aligning freight procurement with growth goals. Operational Pain Points: fragmented procurement practices across business units reducing efficiency, over-reliance on outdated procurement models that limit agility, inefficient communication between freight procurement and other strategic functions.',
    category: 'pain_points',
    persona: ['president'],
    keywords: ['president', 'strategic', 'executive', 'corporate']
  },
  {
    id: 'president_tone_profile',
    title: 'President Tone Profile',
    content: 'Be direct and decisive – cut to the chase with the big picture. Focus on outcomes and strategy – emphasize long-term vision, market position, and competitive edge. Use high-level language – avoid operational details unless directly tied to business growth or risk. Concise but compelling – short, impactful phrasing that reinforces urgency and direction.',
    category: 'language_style',
    persona: ['president'],
    keywords: ['president', 'strategic', 'executive', 'vision', 'competitive']
  },
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
    content: 'Be strategic with operational depth – balance long-term goals with actionable next steps. Use comparative insights – benchmark performance, highlight best practices. Show resource allocation impact – budgets, technology adoption, vendor choices. Confident and professional – present clear recommendations backed by data.',
    category: 'language_style',
    persona: ['coo'],
    keywords: ['coo', 'operational', 'efficiency', 'execution', 'metrics']
  },
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
  {
    id: 'operations_management_pain_points',
    title: 'Operations Management Pain Points',
    content: 'Strategic Challenges: balancing cost optimization with service reliability and customer expectations, limited visibility into end-to-end freight costs making it hard to forecast and budget accurately, difficulty in maintaining flexibility while also committing to long-term carrier contracts. Operational Pain Points: fragmented processes across regions, modes, and business units that hinder standardization, manual time-consuming tendering and carrier selection processes, high administrative overhead due to managing multiple carriers, freight forwarders, and brokers, lack of real-time visibility into shipment status, exceptions, and disruptions. Execution & Day-to-Day Firefighting: constantly dealing with last-minute changes, delays, and disruptions, difficulty reallocating resources when carriers reject requests or fail to perform, overwhelmed by daily problem-solving instead of focusing on proactive improvements, struggles managing exceptions in real time (delays, quality issues, compliance problems). Process & System Challenges: heavy reliance on manual tools (spreadsheets, email) for freight planning and analysis, lack of standardized processes across different regions or business units, difficulty tracking and measuring performance across multiple carriers and modes, limited visibility into carrier performance and reliability metrics.',
    category: 'pain_points',
    persona: ['operations_management'],
    keywords: ['operations', 'management', 'efficiency', 'team', 'process', 'departmental', 'leadership', 'productivity']
  },
  {
    id: 'operations_management_tone_profile',
    title: 'Operations Management Tone Profile',
    content: 'Be strategic with operational depth – balance long-term goals with actionable next steps. Use comparative insights – benchmark performance, highlight best practices. Show resource allocation impact – budgets, technology adoption, vendor choices. Confident and professional – present clear recommendations backed by data. Be actionable and tactical – focus on "what needs to happen next." Provide clarity and guidance – simplify priorities for their teams. Problem-solving tone – address bottlenecks, performance issues, and team management. Collaborative but firm – engage them in decisions while setting clear expectations.',
    category: 'language_style',
    persona: ['operations_management'],
    keywords: ['operations', 'management', 'efficiency', 'team', 'process', 'departmental', 'leadership', 'productivity', 'practical', 'execution', 'coordination', 'solutions']
  },
  {
    id: 'operations_entry_level_pain_points',
    title: 'Operations Entry Level Pain Points',
    content: 'Learning & Skill Development: steep learning curve for understanding complex operational processes and systems, lack of comprehensive training on operational best practices and industry standards, difficulty understanding how individual tasks fit into broader operational objectives, limited mentorship opportunities from senior operational professionals. Process & System Challenges: navigating complex operational systems and tools without proper guidance, difficulty understanding operational workflows and decision-making processes, lack of clear documentation for operational procedures and protocols, struggling with data entry and system navigation in operational platforms.',
    category: 'pain_points',
    persona: ['operations_entry_level'],
    keywords: ['operations', 'entry level']
  },
  {
    id: 'operations_entry_level_tone_profile',
    title: 'Operations Entry Level Tone Profile',
    content: 'Be patient and explanatory – over-communicate to ensure understanding. Keep it simple and structured – clear tasks, step-by-step guidance. Encouraging and mentoring – foster curiosity and confidence. Positive and approachable – tone should reduce intimidation and promote engagement.',
    category: 'language_style',
    persona: ['operations_entry_level'],
    keywords: ['operations', 'entry level']
  },
  {
    id: 'operations_intern_pain_points',
    title: 'Operations Intern Pain Points',
    content: 'Learning & Skill Development: steep learning curve for understanding operational processes and industry basics, lack of comprehensive training on operational fundamentals and best practices, difficulty understanding how operational tasks contribute to business objectives, limited exposure to real-world operational challenges and solutions. Process & System Challenges: navigating operational systems and tools for the first time, difficulty understanding operational workflows and decision-making processes, lack of clear documentation for operational procedures and protocols, struggling with basic operational tasks and system navigation.',
    category: 'pain_points',
    persona: ['operations_intern'],
    keywords: ['operations', 'intern']
  },
  {
    id: 'operations_intern_tone_profile',
    title: 'Operations Intern Tone Profile',
    content: 'Be patient and explanatory – over-communicate to ensure understanding. Keep it simple and structured – clear tasks, step-by-step guidance. Encouraging and mentoring – foster curiosity and confidence. Positive and approachable – tone should reduce intimidation and promote engagement.',
    category: 'language_style',
    persona: ['operations_intern'],
    keywords: ['operations', 'intern']
  },
  {
    id: 'finance_management_pain_points',
    title: 'Finance Management Pain Points',
    content: 'Strategic & Financial Pressure: balancing short-term cost-cutting with long-term investment and growth strategies, increasing pressure from boards and investors for predictable financial performance, difficulty in forecasting accurately amid economic volatility, currency fluctuations, and market uncertainty, pressure to provide actionable insights beyond reporting (acting as a strategic partner vs. back-office). Operational Inefficiencies: reliance on outdated ERP/financial systems that require manual data reconciliation, complex, time-consuming month-end and quarter-end close processes, inconsistent processes across regions/business units, slowing down consolidation. Data & Reporting Challenges: lack of real-time visibility into company supply chain health across operations, struggles with data quality, accuracy, and consistency when pulling from multiple systems, limited automation in reporting, leading to heavy reliance on spreadsheets, difficulty delivering timely insights to executives due to manual reporting cycles, regulatory reporting requirements that demand higher precision and audit-ability. Technology Limitations: difficulty justifying ROI on finance digital transformation projects, limited integration between ERP, BI, and planning systems, struggles with implementing advanced analytics, AI, or automation due to data silos. Talent & Organizational Issues: gaps in advanced analytics, automation, and digital finance capabilities among staff, misalignment between finance priorities and operational/business unit leaders. Cost Control & Budget Management: freight spend is highly variable and difficult to forecast due to rate volatility, hidden surcharges (fuel, accessorials, detention, demurrage) make budgeting unpredictable, inability to accurately allocate transportation costs to specific products, regions, or business units, difficulty validating that negotiated carrier rates are actually being applied in invoices, pressure to reduce logistics costs while balancing service-level requirements.',
    category: 'pain_points',
    persona: ['finance_management'],
    keywords: ['finance', 'management', 'departmental', 'controls', 'team', 'leadership', 'performance', 'planning']
  },
  {
    id: 'finance_management_tone_profile',
    title: 'Finance Management Tone Profile',
    content: 'Be strategic with operational depth – balance long-term goals with actionable next steps. Use comparative insights – benchmark performance, highlight best practices. Show resource allocation impact – budgets, technology adoption, vendor choices. Confident and professional – present clear recommendations backed by data. Be actionable and tactical – focus on "what needs to happen next." Provide clarity and guidance – simplify priorities for their teams. Problem-solving tone – address bottlenecks, performance issues, and team management. Collaborative but firm – engage them in decisions while setting clear expectations.',
    category: 'language_style',
    persona: ['finance_management'],
    keywords: ['finance', 'management', 'departmental', 'controls', 'team', 'leadership', 'performance', 'planning', 'analysis', 'practical', 'execution', 'coordination', 'solutions']
  },
  {
    id: 'finance_entry_level_pain_points',
    title: 'Finance Entry Level Pain Points',
    content: 'Learning & Skill Development: steep learning curve for understanding complex financial processes and systems, lack of comprehensive training on financial best practices and industry standards, difficulty understanding how individual tasks fit into broader financial objectives, limited mentorship opportunities from senior financial professionals. Process & System Challenges: navigating complex financial systems and tools without proper guidance, difficulty understanding financial workflows and decision-making processes, lack of clear documentation for financial procedures and protocols, struggling with data entry and system navigation in financial platforms.',
    category: 'pain_points',
    persona: ['finance_entry_level'],
    keywords: ['finance', 'entry level']
  },
  {
    id: 'finance_entry_level_tone_profile',
    title: 'Finance Entry Level Tone Profile',
    content: 'Be patient and explanatory – over-communicate to ensure understanding. Keep it simple and structured – clear tasks, step-by-step guidance. Encouraging and mentoring – foster curiosity and confidence. Positive and approachable – tone should reduce intimidation and promote engagement.',
    category: 'language_style',
    persona: ['finance_entry_level'],
    keywords: ['finance', 'entry level']
  },
  {
    id: 'finance_intern_pain_points',
    title: 'Finance Intern Pain Points',
    content: 'Learning & Skill Development: steep learning curve for understanding financial processes and industry basics, lack of comprehensive training on financial fundamentals and best practices, difficulty understanding how financial tasks contribute to business objectives, limited exposure to real-world financial challenges and solutions. Process & System Challenges: navigating financial systems and tools for the first time, difficulty understanding financial workflows and decision-making processes, lack of clear documentation for financial procedures and protocols, struggling with basic financial tasks and system navigation.',
    category: 'pain_points',
    persona: ['finance_intern'],
    keywords: ['finance', 'intern']
  },
  {
    id: 'finance_intern_tone_profile',
    title: 'Finance Intern Tone Profile',
    content: 'Be patient and explanatory – over-communicate to ensure understanding. Keep it simple and structured – clear tasks, step-by-step guidance. Encouraging and mentoring – foster curiosity and confidence. Positive and approachable – tone should reduce intimidation and promote engagement.',
    category: 'language_style',
    persona: ['finance_intern'],
    keywords: ['finance', 'intern']
  }
]

// Helper functions
export function getContextItemsByPersona(persona: string): ContextItem[] {
  return CONTEXT_REPOSITORY.filter(item =>
    item.persona && item.persona.includes(persona)
  )
}

export function getContextItemsByCategory(category: string): ContextItem[] {
  return CONTEXT_REPOSITORY.filter(item => item.category === category)
}

export function getContextItemsByPainPoint(painPoint: string): ContextItem[] {
  return CONTEXT_REPOSITORY.filter(item =>
    item.pain_points && item.pain_points.includes(painPoint)
  )
}
