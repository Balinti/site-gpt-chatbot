export type Intent = 'WISMO' | 'RETURNS' | 'OTHER'

interface IntentResult {
  intent: Intent
  confidence: number
  signals: string[]
}

const WISMO_PATTERNS = [
  /where.*(?:is|my).*(?:order|package|shipment)/i,
  /track(?:ing)?.*(?:number|status|info)/i,
  /(?:when|what).*(?:will|does).*(?:arrive|deliver|ship)/i,
  /(?:order|package).*(?:status|update)/i,
  /(?:haven't|have not|hasn't|has not).*(?:received|arrived|delivered)/i,
  /(?:delivered|shows delivered).*(?:but|never|didn't|did not)/i,
  /(?:missing|lost).*(?:package|order)/i,
  /(?:expected|estimated).*(?:delivery|arrival)/i,
]

const RETURN_PATTERNS = [
  /(?:want|need|like).*(?:to)?.*return/i,
  /(?:return|refund|exchange)/i,
  /(?:send|ship).*back/i,
  /(?:don't|do not).*(?:want|like|need)/i,
  /(?:wrong|damaged|broken|defective)/i,
  /(?:money|refund).*back/i,
  /(?:cancel|cancellation)/i,
  /(?:not|isn't|is not).*(?:what|as).*(?:expected|described|ordered)/i,
]

export function detectIntent(subject: string, body: string): IntentResult {
  const text = `${subject} ${body}`.toLowerCase()

  const wismoScore = WISMO_PATTERNS.reduce((score, pattern) => {
    return score + (pattern.test(text) ? 1 : 0)
  }, 0)

  const returnScore = RETURN_PATTERNS.reduce((score, pattern) => {
    return score + (pattern.test(text) ? 1 : 0)
  }, 0)

  const signals: string[] = []

  WISMO_PATTERNS.forEach(pattern => {
    if (pattern.test(text)) {
      const match = text.match(pattern)
      if (match) signals.push(`WISMO signal: "${match[0]}"`)
    }
  })

  RETURN_PATTERNS.forEach(pattern => {
    if (pattern.test(text)) {
      const match = text.match(pattern)
      if (match) signals.push(`RETURN signal: "${match[0]}"`)
    }
  })

  if (wismoScore === 0 && returnScore === 0) {
    return {
      intent: 'OTHER',
      confidence: 0.5,
      signals: ['No clear intent signals detected'],
    }
  }

  if (wismoScore > returnScore) {
    return {
      intent: 'WISMO',
      confidence: Math.min(0.5 + wismoScore * 0.15, 0.95),
      signals,
    }
  }

  if (returnScore > wismoScore) {
    return {
      intent: 'RETURNS',
      confidence: Math.min(0.5 + returnScore * 0.15, 0.95),
      signals,
    }
  }

  // Equal scores - check for specific keywords
  if (text.includes('refund') || text.includes('return')) {
    return {
      intent: 'RETURNS',
      confidence: 0.6,
      signals,
    }
  }

  return {
    intent: 'WISMO',
    confidence: 0.6,
    signals,
  }
}
