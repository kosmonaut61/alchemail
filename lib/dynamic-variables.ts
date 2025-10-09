/**
 * Dynamic Variables for Email and Message Templates
 * These variables can be used in email content and will be replaced with actual values
 */

export interface DynamicVariable {
  category: string
  name: string
  description: string
  example: string
}

export const DYNAMIC_VARIABLES: DynamicVariable[] = [
  // Contact Fields
  {
    category: 'Contact Fields',
    name: '{{contact.first_name}}',
    description: 'Contact\'s first name',
    example: 'John'
  },
  {
    category: 'Contact Fields',
    name: '{{contact.last_name}}',
    description: 'Contact\'s last name',
    example: 'Smith'
  },
  {
    category: 'Contact Fields',
    name: '{{contact.email}}',
    description: 'Contact\'s email address',
    example: 'john.smith@company.com'
  },
  {
    category: 'Contact Fields',
    name: '{{contact.domain}}',
    description: 'Contact\'s company domain',
    example: 'company.com'
  },
  {
    category: 'Contact Fields',
    name: '{{contact.location_city}}',
    description: 'Contact\'s city',
    example: 'San Francisco'
  },
  {
    category: 'Contact Fields',
    name: '{{contact.location_state}}',
    description: 'Contact\'s state/province',
    example: 'CA'
  },
  {
    category: 'Contact Fields',
    name: '{{contact.location_country}}',
    description: 'Contact\'s country',
    example: 'United States'
  },
  {
    category: 'Contact Fields',
    name: '{{contact.phone}}',
    description: 'Contact\'s phone number',
    example: '+1-555-123-4567'
  },
  {
    category: 'Contact Fields',
    name: '{{contact.title}}',
    description: 'Contact\'s job title',
    example: 'VP of Operations'
  },
  {
    category: 'Contact Fields',
    name: '{{contact.opt_out_message}}',
    description: 'Contact\'s opt-out message',
    example: 'Click here to unsubscribe'
  },

  // Account Fields
  {
    category: 'Account Fields',
    name: '{{account.processed_company_name_for_email}}',
    description: 'Account/company name',
    example: 'Acme Corp'
  },
  {
    category: 'Account Fields',
    name: '{{account.company_unprocessed_name}}',
    description: 'Raw company name (unprocessed)',
    example: 'Acme Corporation Inc.'
  },
  {
    category: 'Account Fields',
    name: '{{account.company_location_city}}',
    description: 'Company\'s city',
    example: 'New York'
  },
  {
    category: 'Account Fields',
    name: '{{account.company_location_state}}',
    description: 'Company\'s state/province',
    example: 'NY'
  },
  {
    category: 'Account Fields',
    name: '{{account.company_location_country}}',
    description: 'Company\'s country',
    example: 'United States'
  },
  {
    category: 'Account Fields',
    name: '{{account.latest_funding_type}}',
    description: 'Latest funding round type',
    example: 'Series B'
  },
  {
    category: 'Account Fields',
    name: '{{account.company_size}}',
    description: 'Company size (employees)',
    example: '100-500'
  },
  {
    category: 'Account Fields',
    name: '{{account.vertical}}',
    description: 'Company vertical/industry',
    example: 'Technology'
  },
  {
    category: 'Account Fields',
    name: '{{account.industry}}',
    description: 'Company industry',
    example: 'Software'
  },

  // Sender Fields
  {
    category: 'Sender Fields',
    name: '{{sender.first_name}}',
    description: 'Sender\'s first name',
    example: 'Sarah'
  },
  {
    category: 'Sender Fields',
    name: '{{sender.last_name}}',
    description: 'Sender\'s last name',
    example: 'Johnson'
  },
  {
    category: 'Sender Fields',
    name: '{{sender.email}}',
    description: 'Sender\'s email address',
    example: 'sarah.johnson@emerge.com'
  },
  {
    category: 'Sender Fields',
    name: '{{sender_meeting_alias}}',
    description: 'Sender\'s meeting booking alias',
    example: 'sarah-johnson-emerge'
  },

  // Intent Fields
  {
    category: 'Intent Fields',
    name: '{{primary_intent_signal}}',
    description: 'Primary intent/signal for outreach',
    example: 'Recent funding announcement'
  },
  {
    category: 'Intent Fields',
    name: '{{secondary_intent_signal}}',
    description: 'Secondary intent/signal for outreach',
    example: 'New product launch'
  },

  // Time Fields
  {
    category: 'Time Fields',
    name: '{{now.day}}',
    description: 'Current day of month',
    example: '15'
  },
  {
    category: 'Time Fields',
    name: '{{now.month}}',
    description: 'Current month name',
    example: 'March'
  },
  {
    category: 'Time Fields',
    name: '{{now.time_of_day}}',
    description: 'Current time of day',
    example: 'morning'
  },
  {
    category: 'Time Fields',
    name: '{{now.weekday}}',
    description: 'Current day of week',
    example: 'Monday'
  },
  {
    category: 'Time Fields',
    name: '{{now.year}}',
    description: 'Current year',
    example: '2024'
  },

  // Advanced Features
  {
    category: 'Advanced',
    name: '{{#if contact.first_name}}{{contact.first_name}}{{#else}}there{{#endif}}',
    description: 'Conditional fallback for contact name',
    example: 'John or there'
  },
  {
    category: 'Advanced',
    name: '{{contact.title->lowercase}}',
    description: 'Convert to lowercase',
    example: 'vp of operations'
  },
  {
    category: 'Advanced',
    name: '{{now.day->plus_X}}',
    description: 'Add days to current date',
    example: '{{now.day->plus_7}} for 7 days from now'
  }
]

// Helper function to get variables by category
export function getVariablesByCategory(category: string): DynamicVariable[] {
  return DYNAMIC_VARIABLES.filter(variable => variable.category === category)
}

// Helper function to get all variable names as strings
export function getAllVariableNames(): string[] {
  return DYNAMIC_VARIABLES.map(variable => variable.name)
}

// Helper function to format variables for prompt inclusion
export function formatVariablesForPrompt(): string {
  const categories = [...new Set(DYNAMIC_VARIABLES.map(v => v.category))]
  
  let formatted = 'AVAILABLE DYNAMIC VARIABLES:\n\n'
  
  categories.forEach(category => {
    formatted += `${category}:\n`
    const categoryVars = DYNAMIC_VARIABLES.filter(v => v.category === category)
    categoryVars.forEach(variable => {
      formatted += `- ${variable.name}: ${variable.description}\n`
    })
    formatted += '\n'
  })
  
  return formatted
}
