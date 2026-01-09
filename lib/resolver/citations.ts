export interface Citation {
  id: string
  claim: string
  source: {
    type: 'policy' | 'order' | 'tracking' | 'system'
    name: string
    value: string
    reference?: string
  }
}

export function generateCitationId(): string {
  return `cite_${Math.random().toString(36).substring(2, 8)}`
}

export function createPolicyCitation(
  claim: string,
  policyName: string,
  value: string
): Citation {
  return {
    id: generateCitationId(),
    claim,
    source: {
      type: 'policy',
      name: policyName,
      value,
    },
  }
}

export function createOrderCitation(
  claim: string,
  orderNumber: string,
  field: string,
  value: string
): Citation {
  return {
    id: generateCitationId(),
    claim,
    source: {
      type: 'order',
      name: `Order ${orderNumber}`,
      value,
      reference: field,
    },
  }
}

export function createTrackingCitation(
  claim: string,
  trackingNumber: string,
  field: string,
  value: string
): Citation {
  return {
    id: generateCitationId(),
    claim,
    source: {
      type: 'tracking',
      name: `Tracking ${trackingNumber}`,
      value,
      reference: field,
    },
  }
}

export function formatCitationForDisplay(citation: Citation): string {
  const typeEmoji = {
    policy: 'policy',
    order: 'order',
    tracking: 'shipment',
    system: 'system',
  }
  return `[${typeEmoji[citation.source.type]}] ${citation.source.name}: ${citation.source.value}`
}
