export interface Policy {
  version: number
  rules: {
    returnWindow: number // days
    finalSaleNoReturn: boolean
    deliveredNotReceivedThreshold: number // days to wait before filing claim
    addressChangeAllowedStatuses: string[]
    refundMethod: 'original_payment' | 'store_credit'
    requirePhotosForDamaged: boolean
  }
}

export const DEFAULT_POLICY: Policy = {
  version: 1,
  rules: {
    returnWindow: 30,
    finalSaleNoReturn: true,
    deliveredNotReceivedThreshold: 7,
    addressChangeAllowedStatuses: ['pending', 'processing'],
    refundMethod: 'original_payment',
    requirePhotosForDamaged: true,
  },
}

export interface PolicyCheckResult {
  rule: string
  passed: boolean
  message: string
  citation: {
    type: 'policy' | 'order' | 'tracking'
    source: string
    value: string
  }
}

export function checkReturnEligibility(
  orderDate: string,
  policy: Policy
): PolicyCheckResult {
  const orderDateObj = new Date(orderDate)
  const now = new Date()
  const daysSinceOrder = Math.floor((now.getTime() - orderDateObj.getTime()) / (1000 * 60 * 60 * 24))
  const withinWindow = daysSinceOrder <= policy.rules.returnWindow

  return {
    rule: 'return_window',
    passed: withinWindow,
    message: withinWindow
      ? `Order is within ${policy.rules.returnWindow}-day return window (${daysSinceOrder} days since order)`
      : `Order is outside ${policy.rules.returnWindow}-day return window (${daysSinceOrder} days since order)`,
    citation: {
      type: 'policy',
      source: 'Return Window Policy',
      value: `${policy.rules.returnWindow} days`,
    },
  }
}

export function checkFinalSale(
  items: Array<{ finalSale: boolean; name: string }>,
  policy: Policy
): PolicyCheckResult {
  const finalSaleItems = items.filter(i => i.finalSale)
  const hasFinalSale = finalSaleItems.length > 0

  if (!policy.rules.finalSaleNoReturn) {
    return {
      rule: 'final_sale',
      passed: true,
      message: 'Final sale returns are allowed by policy',
      citation: {
        type: 'policy',
        source: 'Final Sale Policy',
        value: 'Returns allowed',
      },
    }
  }

  return {
    rule: 'final_sale',
    passed: !hasFinalSale,
    message: hasFinalSale
      ? `Items marked as final sale cannot be returned: ${finalSaleItems.map(i => i.name).join(', ')}`
      : 'No final sale items in order',
    citation: {
      type: hasFinalSale ? 'order' : 'policy',
      source: hasFinalSale ? 'Order Items' : 'Final Sale Policy',
      value: hasFinalSale ? finalSaleItems.map(i => i.name).join(', ') : 'No final sale items',
    },
  }
}

export function checkDeliveredNotReceived(
  deliveredAt: string | undefined,
  policy: Policy
): PolicyCheckResult {
  if (!deliveredAt) {
    return {
      rule: 'delivered_not_received',
      passed: false,
      message: 'Package not yet marked as delivered',
      citation: {
        type: 'tracking',
        source: 'Delivery Status',
        value: 'Not delivered',
      },
    }
  }

  const deliveryDate = new Date(deliveredAt)
  const now = new Date()
  const daysSinceDelivery = Math.floor((now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24))
  const canFileClaim = daysSinceDelivery >= policy.rules.deliveredNotReceivedThreshold

  return {
    rule: 'delivered_not_received',
    passed: canFileClaim,
    message: canFileClaim
      ? `${daysSinceDelivery} days since delivery - eligible for claim investigation`
      : `Only ${daysSinceDelivery} days since delivery - must wait ${policy.rules.deliveredNotReceivedThreshold} days before filing claim`,
    citation: {
      type: 'tracking',
      source: 'Delivery Date',
      value: new Date(deliveredAt).toLocaleDateString(),
    },
  }
}

export function checkAddressChange(
  orderStatus: string,
  policy: Policy
): PolicyCheckResult {
  const canChange = policy.rules.addressChangeAllowedStatuses.includes(orderStatus)

  return {
    rule: 'address_change',
    passed: canChange,
    message: canChange
      ? `Address change allowed for orders in "${orderStatus}" status`
      : `Cannot change address - order is "${orderStatus}". Address changes only allowed for: ${policy.rules.addressChangeAllowedStatuses.join(', ')}`,
    citation: {
      type: 'policy',
      source: 'Address Change Policy',
      value: `Allowed statuses: ${policy.rules.addressChangeAllowedStatuses.join(', ')}`,
    },
  }
}
