import type { DemoOrder, DemoTracking } from '../demo-data'
import type { PolicyCheckResult } from '../policy'
import type { Intent } from './intent'

export interface ReplyTemplate {
  subject: string
  body: string
  internalNote: string
  suggestedActions: string[]
}

export function generateWISMOReply(
  order: DemoOrder | null,
  tracking: DemoTracking | null,
  customerName: string
): ReplyTemplate {
  const firstName = customerName.split(' ')[0]

  if (!order) {
    return {
      subject: 'Re: Order Status Inquiry',
      body: `Hi ${firstName},

Thank you for reaching out! I wasn't able to locate an order with the information provided.

Could you please confirm your order number? It typically starts with "ORD-" and can be found in your order confirmation email.

Once I have your order number, I'll be happy to provide a detailed update on your shipment status.

Best regards,
Support Team`,
      internalNote: 'Order not found in system. Customer needs to provide valid order number.',
      suggestedActions: ['Request order number from customer', 'Check customer email for related orders'],
    }
  }

  if (!order.fulfillment) {
    return {
      subject: `Re: Order ${order.orderNumber} Status`,
      body: `Hi ${firstName},

Thank you for contacting us about your order ${order.orderNumber}!

Your order is currently being processed and hasn't shipped yet. Once it ships, you'll receive an email with tracking information.

**Order Details:**
- Order Date: ${new Date(order.createdAt).toLocaleDateString()}
- Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
- Items: ${order.items.map(i => i.name).join(', ')}

We'll get your order out as soon as possible. Is there anything else I can help you with?

Best regards,
Support Team`,
      internalNote: `Order ${order.orderNumber} is in ${order.status} status. No fulfillment/tracking yet.`,
      suggestedActions: ['Monitor order for shipping update', 'Escalate if processing > 3 business days'],
    }
  }

  if (tracking?.status === 'delivered') {
    return {
      subject: `Re: Order ${order.orderNumber} - Delivered`,
      body: `Hi ${firstName},

Thank you for reaching out about your order ${order.orderNumber}.

According to our records, your package was delivered on ${new Date(tracking.deliveredAt!).toLocaleDateString()}.

**Delivery Details:**
- Carrier: ${tracking.carrier}
- Tracking: ${tracking.trackingNumber}
- Delivered: ${new Date(tracking.deliveredAt!).toLocaleString()}
- Last Status: ${tracking.checkpoints[tracking.checkpoints.length - 1]?.message || 'Delivered'}

If you haven't received your package, please:
1. Check around your property and with neighbors
2. Contact your local carrier office
3. Reply to this email if you still can't locate it

We're here to help!

Best regards,
Support Team`,
      internalNote: `Package shows delivered on ${new Date(tracking.deliveredAt!).toLocaleDateString()}. If customer confirms non-receipt, may need to file carrier claim.`,
      suggestedActions: ['Verify delivery address', 'Check for delivery photo if available', 'Prepare carrier claim if needed'],
    }
  }

  return {
    subject: `Re: Order ${order.orderNumber} - Tracking Update`,
    body: `Hi ${firstName},

Thank you for reaching out about your order ${order.orderNumber}!

**Shipping Status:**
- Carrier: ${tracking?.carrier || order.fulfillment.carrier}
- Tracking Number: ${tracking?.trackingNumber || order.fulfillment.trackingNumber}
- Status: ${tracking?.status || 'In Transit'}
- Estimated Delivery: ${tracking?.estimatedDelivery ? new Date(tracking.estimatedDelivery).toLocaleDateString() : 'Check carrier website'}

**Recent Activity:**
${tracking?.checkpoints.slice(-3).map(cp => `- ${new Date(cp.date).toLocaleDateString()}: ${cp.message} (${cp.location})`).join('\n') || 'Tracking information updating...'}

You can track your package directly at the carrier's website using the tracking number above.

Is there anything else I can help you with?

Best regards,
Support Team`,
    internalNote: `Order ${order.orderNumber} shipped via ${tracking?.carrier || order.fulfillment.carrier}. Currently ${tracking?.status || 'in transit'}.`,
    suggestedActions: ['Share tracking link', 'Set follow-up if delivery is delayed'],
  }
}

export function generateReturnReply(
  order: DemoOrder | null,
  policyChecks: PolicyCheckResult[],
  customerName: string
): ReplyTemplate {
  const firstName = customerName.split(' ')[0]

  if (!order) {
    return {
      subject: 'Re: Return Request',
      body: `Hi ${firstName},

Thank you for reaching out! I'd be happy to help with your return request.

To proceed, I'll need your order number. It typically starts with "ORD-" and can be found in your order confirmation email.

Once I have your order details, I can check your return eligibility and provide next steps.

Best regards,
Support Team`,
      internalNote: 'Return request received but order not found. Need valid order number.',
      suggestedActions: ['Request order number', 'Verify customer email'],
    }
  }

  const failedChecks = policyChecks.filter(c => !c.passed)
  const allPassed = failedChecks.length === 0

  if (allPassed) {
    return {
      subject: `Re: Return Request - Order ${order.orderNumber}`,
      body: `Hi ${firstName},

Thank you for contacting us about returning your order ${order.orderNumber}.

Great news! Your order is eligible for a return.

**Return Instructions:**
1. Pack items securely in original packaging if possible
2. Include your order number (${order.orderNumber}) inside the package
3. Ship to our returns center (address will be emailed separately)
4. Once received and inspected, your refund will be processed within 5-7 business days

**Order Details:**
- Items: ${order.items.map(i => i.name).join(', ')}
- Order Total: $${order.total.toFixed(2)}

Would you like me to email you a prepaid return label?

Best regards,
Support Team`,
      internalNote: `Return approved for order ${order.orderNumber}. All policy checks passed.`,
      suggestedActions: ['Generate return label', 'Create return record', 'Schedule refund on receipt'],
    }
  }

  const finalSaleCheck = failedChecks.find(c => c.rule === 'final_sale')
  const windowCheck = failedChecks.find(c => c.rule === 'return_window')

  if (finalSaleCheck) {
    return {
      subject: `Re: Return Request - Order ${order.orderNumber}`,
      body: `Hi ${firstName},

Thank you for reaching out about your order ${order.orderNumber}.

Unfortunately, one or more items in your order are marked as "Final Sale" and are not eligible for return:
${order.items.filter(i => i.finalSale).map(i => `- ${i.name}`).join('\n')}

Our Final Sale policy is disclosed at checkout for discounted and clearance items.

If your item arrived damaged or defective, please reply with photos and we'll be happy to investigate further.

We apologize for any inconvenience.

Best regards,
Support Team`,
      internalNote: `Return denied - Final sale items. Customer purchased: ${order.items.filter(i => i.finalSale).map(i => i.name).join(', ')}`,
      suggestedActions: ['Offer store credit as goodwill (manager approval)', 'Check if item defective - different policy'],
    }
  }

  if (windowCheck) {
    return {
      subject: `Re: Return Request - Order ${order.orderNumber}`,
      body: `Hi ${firstName},

Thank you for reaching out about your order ${order.orderNumber}.

Unfortunately, your order was placed on ${new Date(order.createdAt).toLocaleDateString()}, which is outside our return window.

Our return policy allows returns within 30 days of purchase.

If there are extenuating circumstances, please let us know and we'll do our best to help.

Best regards,
Support Team`,
      internalNote: `Return denied - Outside 30-day window. Order date: ${new Date(order.createdAt).toLocaleDateString()}`,
      suggestedActions: ['Consider exception for loyal customer', 'Offer store credit', 'Check order history'],
    }
  }

  return {
    subject: `Re: Return Request - Order ${order.orderNumber}`,
    body: `Hi ${firstName},

Thank you for reaching out about your order ${order.orderNumber}.

I've reviewed your return request, and unfortunately we're unable to process it at this time.

${failedChecks.map(c => `- ${c.message}`).join('\n')}

If you have any questions about our return policy or believe this is an error, please don't hesitate to reach out.

Best regards,
Support Team`,
    internalNote: `Return denied. Failed checks: ${failedChecks.map(c => c.rule).join(', ')}`,
    suggestedActions: ['Review for exceptions', 'Escalate if customer disputes'],
  }
}

export function generateOtherReply(customerName: string): ReplyTemplate {
  const firstName = customerName.split(' ')[0]

  return {
    subject: 'Re: Your Inquiry',
    body: `Hi ${firstName},

Thank you for contacting us!

I'd be happy to help with your request. Could you please provide more details about what you need assistance with?

If you have an order-related question, please include your order number and I can look into it right away.

Best regards,
Support Team`,
    internalNote: 'Intent unclear - request requires human review or more information.',
    suggestedActions: ['Gather more information', 'Route to appropriate department'],
  }
}

export function selectTemplate(
  intent: Intent,
  order: DemoOrder | null,
  tracking: DemoTracking | null,
  policyChecks: PolicyCheckResult[],
  customerName: string
): ReplyTemplate {
  switch (intent) {
    case 'WISMO':
      return generateWISMOReply(order, tracking, customerName)
    case 'RETURNS':
      return generateReturnReply(order, policyChecks, customerName)
    default:
      return generateOtherReply(customerName)
  }
}
