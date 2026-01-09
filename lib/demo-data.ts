export interface DemoOrder {
  id: string
  orderNumber: string
  customerEmail: string
  customerName: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  items: Array<{
    name: string
    sku: string
    quantity: number
    price: number
    finalSale: boolean
  }>
  shippingAddress: {
    line1: string
    city: string
    state: string
    zip: string
    country: string
  }
  total: number
  fulfillment?: {
    id: string
    trackingNumber: string
    carrier: string
    shippedAt: string
  }
}

export interface DemoTracking {
  trackingNumber: string
  carrier: string
  status: 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception'
  estimatedDelivery: string
  checkpoints: Array<{
    date: string
    location: string
    message: string
    status: string
  }>
  deliveredAt?: string
}

export interface DemoTicket {
  id: string
  subject: string
  body: string
  customerEmail: string
  customerName: string
  orderNumber?: string
  createdAt: string
}

export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: 'ord_demo_001',
    orderNumber: 'ORD-2024-1001',
    customerEmail: 'sarah.johnson@email.com',
    customerName: 'Sarah Johnson',
    status: 'shipped',
    createdAt: '2024-12-28T10:30:00Z',
    items: [
      { name: 'Wireless Earbuds Pro', sku: 'WEP-001', quantity: 1, price: 129.99, finalSale: false },
      { name: 'Charging Case', sku: 'CC-002', quantity: 1, price: 29.99, finalSale: false },
    ],
    shippingAddress: {
      line1: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country: 'US',
    },
    total: 159.98,
    fulfillment: {
      id: 'ful_001',
      trackingNumber: '1Z999AA10123456784',
      carrier: 'UPS',
      shippedAt: '2024-12-29T14:00:00Z',
    },
  },
  {
    id: 'ord_demo_002',
    orderNumber: 'ORD-2024-1002',
    customerEmail: 'mike.chen@email.com',
    customerName: 'Mike Chen',
    status: 'delivered',
    createdAt: '2024-12-20T09:15:00Z',
    items: [
      { name: 'Smart Watch Series X', sku: 'SWX-100', quantity: 1, price: 299.99, finalSale: false },
    ],
    shippingAddress: {
      line1: '456 Oak Avenue',
      city: 'Seattle',
      state: 'WA',
      zip: '98101',
      country: 'US',
    },
    total: 299.99,
    fulfillment: {
      id: 'ful_002',
      trackingNumber: '9400111899223100001234',
      carrier: 'USPS',
      shippedAt: '2024-12-21T11:00:00Z',
    },
  },
  {
    id: 'ord_demo_003',
    orderNumber: 'ORD-2024-1003',
    customerEmail: 'emma.wilson@email.com',
    customerName: 'Emma Wilson',
    status: 'processing',
    createdAt: '2024-12-30T16:45:00Z',
    items: [
      { name: 'Premium Headphones', sku: 'PH-300', quantity: 1, price: 199.99, finalSale: true },
      { name: 'Audio Cable Gold', sku: 'ACG-050', quantity: 2, price: 19.99, finalSale: false },
    ],
    shippingAddress: {
      line1: '789 Pine Road',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      country: 'US',
    },
    total: 239.97,
  },
  {
    id: 'ord_demo_004',
    orderNumber: 'ORD-2024-0985',
    customerEmail: 'david.brown@email.com',
    customerName: 'David Brown',
    status: 'delivered',
    createdAt: '2024-11-15T12:00:00Z',
    items: [
      { name: 'Bluetooth Speaker Mini', sku: 'BSM-200', quantity: 2, price: 49.99, finalSale: false },
    ],
    shippingAddress: {
      line1: '321 Elm Street',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'US',
    },
    total: 99.98,
    fulfillment: {
      id: 'ful_004',
      trackingNumber: 'FX123456789012',
      carrier: 'FedEx',
      shippedAt: '2024-11-16T09:00:00Z',
    },
  },
]

export const DEMO_TRACKING: Record<string, DemoTracking> = {
  '1Z999AA10123456784': {
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS',
    status: 'in_transit',
    estimatedDelivery: '2025-01-02T18:00:00Z',
    checkpoints: [
      { date: '2024-12-29T14:00:00Z', location: 'Austin, TX', message: 'Package picked up', status: 'picked_up' },
      { date: '2024-12-30T06:30:00Z', location: 'Dallas, TX', message: 'In transit to next facility', status: 'in_transit' },
      { date: '2024-12-31T10:15:00Z', location: 'Memphis, TN', message: 'Arrived at facility', status: 'in_transit' },
    ],
  },
  '9400111899223100001234': {
    trackingNumber: '9400111899223100001234',
    carrier: 'USPS',
    status: 'delivered',
    estimatedDelivery: '2024-12-24T17:00:00Z',
    deliveredAt: '2024-12-24T14:32:00Z',
    checkpoints: [
      { date: '2024-12-21T11:00:00Z', location: 'Austin, TX', message: 'Package shipped', status: 'shipped' },
      { date: '2024-12-22T08:00:00Z', location: 'Seattle, WA', message: 'Arrived at local facility', status: 'in_transit' },
      { date: '2024-12-23T16:00:00Z', location: 'Seattle, WA', message: 'Out for delivery', status: 'out_for_delivery' },
      { date: '2024-12-24T14:32:00Z', location: 'Seattle, WA', message: 'Delivered', status: 'delivered' },
    ],
  },
  'FX123456789012': {
    trackingNumber: 'FX123456789012',
    carrier: 'FedEx',
    status: 'delivered',
    estimatedDelivery: '2024-11-19T17:00:00Z',
    deliveredAt: '2024-11-18T11:45:00Z',
    checkpoints: [
      { date: '2024-11-16T09:00:00Z', location: 'Austin, TX', message: 'Shipment picked up', status: 'picked_up' },
      { date: '2024-11-17T07:00:00Z', location: 'Chicago, IL', message: 'At local FedEx facility', status: 'in_transit' },
      { date: '2024-11-18T08:00:00Z', location: 'Chicago, IL', message: 'Out for delivery', status: 'out_for_delivery' },
      { date: '2024-11-18T11:45:00Z', location: 'Chicago, IL', message: 'Delivered - Left at front door', status: 'delivered' },
    ],
  },
}

export const SAMPLE_TICKETS: DemoTicket[] = [
  {
    id: 'sample_wismo_1',
    subject: 'Where is my order?',
    body: 'Hi, I ordered some wireless earbuds last week and haven\'t received them yet. My order number is ORD-2024-1001. Can you tell me where my package is?',
    customerEmail: 'sarah.johnson@email.com',
    customerName: 'Sarah Johnson',
    orderNumber: 'ORD-2024-1001',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample_return_1',
    subject: 'I want to return my order',
    body: 'Hello, I received my smart watch (order ORD-2024-1002) but it\'s not what I expected. I\'d like to return it for a refund. How do I proceed?',
    customerEmail: 'mike.chen@email.com',
    customerName: 'Mike Chen',
    orderNumber: 'ORD-2024-1002',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample_return_2',
    subject: 'Return request - Final sale item',
    body: 'I need to return the Premium Headphones from order ORD-2024-1003. They don\'t fit well and I want my money back.',
    customerEmail: 'emma.wilson@email.com',
    customerName: 'Emma Wilson',
    orderNumber: 'ORD-2024-1003',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample_wismo_2',
    subject: 'Package says delivered but I never got it',
    body: 'My order ORD-2024-0985 shows as delivered on November 18th but I never received it. I need help finding my package or getting a refund.',
    customerEmail: 'david.brown@email.com',
    customerName: 'David Brown',
    orderNumber: 'ORD-2024-0985',
    createdAt: new Date().toISOString(),
  },
]

export function findOrderByNumber(orderNumber: string): DemoOrder | undefined {
  return DEMO_ORDERS.find(o => o.orderNumber.toLowerCase() === orderNumber.toLowerCase())
}

export function findOrderByEmail(email: string): DemoOrder[] {
  return DEMO_ORDERS.filter(o => o.customerEmail.toLowerCase() === email.toLowerCase())
}

export function getTrackingInfo(trackingNumber: string): DemoTracking | undefined {
  return DEMO_TRACKING[trackingNumber]
}
