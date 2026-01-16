/**
 * Abuse Detection System
 *
 * Detects and prevents:
 * - Automated/bot traffic
 * - Repeated identical requests
 * - Unusual patterns
 * - Cost manipulation attempts
 */

interface RequestSignature {
  hash: string
  count: number
  firstSeen: number
  lastSeen: number
  ipAddresses: Set<string>
}

interface AbuseMetrics {
  totalRequests: number
  uniqueRequests: number
  duplicateRequests: number
  suspiciousPatterns: number
  blockedRequests: number
  averageRequestInterval: number
}

interface AbuseDetectionResult {
  isAbusive: boolean
  reasons: string[]
  riskScore: number
  recommendations: string[]
}

class AbuseDetector {
  private requestSignatures: Map<string, RequestSignature> = new Map()
  private ipRequestTimes: Map<string, number[]> = new Map()
  private blockedIPs: Set<string> = new Set()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startCleanup()
  }

  /**
   * Analyze a request for abusive patterns
   */
  async analyzeRequest(
    identifier: string,
    requestData: any
  ): Promise<AbuseDetectionResult> {
    const reasons: string[] = []
    const recommendations: string[] = []
    let riskScore = 0

    // 1. Check if IP is already blocked
    if (this.blockedIPs.has(identifier)) {
      return {
        isAbusive: true,
        reasons: ['IP address is blocked due to previous abuse'],
        riskScore: 100,
        recommendations: ['Contact administrator to appeal block'],
      }
    }

    // 2. Check request frequency
    const frequencyAnalysis = this.analyzeRequestFrequency(identifier)
    if (frequencyAnalysis.isAbusive) {
      reasons.push(...frequencyAnalysis.reasons)
      riskScore += frequencyAnalysis.riskScore
      recommendations.push(...frequencyAnalysis.recommendations)
    }

    // 3. Check for duplicate requests
    const duplicateAnalysis = this.checkDuplicateRequests(identifier, requestData)
    if (duplicateAnalysis.isAbusive) {
      reasons.push(...duplicateAnalysis.reasons)
      riskScore += duplicateAnalysis.riskScore
      recommendations.push(...duplicateAnalysis.recommendations)
    }

    // 4. Check for bot-like behavior
    const botAnalysis = this.detectBotBehavior(identifier)
    if (botAnalysis.isAbusive) {
      reasons.push(...botAnalysis.reasons)
      riskScore += botAnalysis.riskScore
      recommendations.push(...botAnalysis.recommendations)
    }

    // 5. Check request content patterns
    const contentAnalysis = this.analyzeRequestContent(requestData)
    if (contentAnalysis.isAbusive) {
      reasons.push(...contentAnalysis.reasons)
      riskScore += contentAnalysis.riskScore
      recommendations.push(...contentAnalysis.recommendations)
    }

    // Record this request
    this.recordRequest(identifier, requestData)

    // Auto-block if risk score is very high
    if (riskScore >= 80) {
      this.blockedIPs.add(identifier)
      reasons.push('IP automatically blocked due to high abuse score')
    }

    return {
      isAbusive: riskScore >= 50,
      reasons,
      riskScore: Math.min(riskScore, 100),
      recommendations,
    }
  }

  /**
   * Analyze request frequency for this identifier
   */
  private analyzeRequestFrequency(identifier: string): AbuseDetectionResult {
    const reasons: string[] = []
    const recommendations: string[] = []
    let riskScore = 0

    const times = this.ipRequestTimes.get(identifier) || []
    const now = Date.now()

    // Add current request time
    times.push(now)
    this.ipRequestTimes.set(identifier, times)

    // Check last minute
    const lastMinute = times.filter(t => now - t < 60000)
    if (lastMinute.length > 10) {
      reasons.push('Excessive requests in last minute')
      riskScore += 30
      recommendations.push('Slow down request rate')
    }

    // Check last hour
    const lastHour = times.filter(t => now - t < 3600000)
    if (lastHour.length > 50) {
      reasons.push('Excessive requests in last hour')
      riskScore += 25
      recommendations.push('Implement proper rate limiting on client side')
    }

    // Check for burst patterns (many requests in short time)
    if (lastMinute.length >= 5) {
      const intervals: number[] = []
      for (let i = 1; i < lastMinute.length; i++) {
        const current = lastMinute[i]
        const previous = lastMinute[i - 1]
        if (current !== undefined && previous !== undefined) {
          intervals.push(current - previous)
        }
      }
      const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : Infinity

      // If average interval is less than 1 second, likely automated
      if (avgInterval < 1000) {
        reasons.push('Automated request pattern detected')
        riskScore += 35
        recommendations.push('Requests appear to be automated')
      }
    }

    return {
      isAbusive: riskScore >= 50,
      reasons,
      riskScore,
      recommendations,
    }
  }

  /**
   * Check for duplicate/repeated requests
   */
  private checkDuplicateRequests(
    identifier: string,
    requestData: any
  ): AbuseDetectionResult {
    const reasons: string[] = []
    const recommendations: string[] = []
    let riskScore = 0

    const hash = this.hashRequest(requestData)
    const signature = this.requestSignatures.get(hash)

    if (signature) {
      signature.count++
      signature.lastSeen = Date.now()
      signature.ipAddresses.add(identifier)

      const timeSinceFirst = Date.now() - signature.firstSeen

      // Same request repeated many times
      if (signature.count > 5 && timeSinceFirst < 3600000) {
        reasons.push('Identical request repeated multiple times')
        riskScore += 20
        recommendations.push('Avoid submitting duplicate requests')
      }

      // Very frequent duplicates
      if (signature.count > 3 && timeSinceFirst < 60000) {
        reasons.push('Duplicate request spam detected')
        riskScore += 40
        recommendations.push('Ensure proper client-side deduplication')
      }

      // Same request from multiple IPs (coordinated attack)
      if (signature.ipAddresses.size > 3 && signature.count > 10) {
        reasons.push('Coordinated duplicate requests from multiple sources')
        riskScore += 50
        recommendations.push('Suspicious distributed pattern')
      }
    }

    return {
      isAbusive: riskScore >= 50,
      reasons,
      riskScore,
      recommendations,
    }
  }

  /**
   * Detect bot-like behavior patterns
   */
  private detectBotBehavior(identifier: string): AbuseDetectionResult {
    const reasons: string[] = []
    const recommendations: string[] = []
    let riskScore = 0

    const times = this.ipRequestTimes.get(identifier) || []
    if (times.length < 3) {
      return { isAbusive: false, reasons, riskScore, recommendations }
    }

    // Check for perfectly regular intervals (bot signature)
    const intervals: number[] = []
    for (let i = 1; i < Math.min(times.length, 10); i++) {
      const current = times[i]
      const previous = times[i - 1]
      if (current !== undefined && previous !== undefined) {
        intervals.push(current - previous)
      }
    }

    if (intervals.length >= 3) {
      // Calculate variance in intervals
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const variance =
        intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) /
        intervals.length
      const stdDev = Math.sqrt(variance)

      // Very low variance = likely bot (humans are more variable)
      if (stdDev < 100 && avgInterval < 5000) {
        reasons.push('Perfectly regular request pattern suggests automation')
        riskScore += 30
        recommendations.push('Request timing appears non-human')
      }
    }

    // Check for requests too fast for human interaction
    const recentIntervals = intervals.slice(-5)
    const tooFast = recentIntervals.filter(i => i < 500).length
    if (tooFast >= 3) {
      reasons.push('Request speed exceeds human capability')
      riskScore += 25
      recommendations.push('Requests are too fast to be manual')
    }

    return {
      isAbusive: riskScore >= 50,
      reasons,
      riskScore,
      recommendations,
    }
  }

  /**
   * Analyze request content for suspicious patterns
   */
  private analyzeRequestContent(requestData: any): AbuseDetectionResult {
    const reasons: string[] = []
    const recommendations: string[] = []
    let riskScore = 0

    // Check description field
    if (requestData.description) {
      const desc = requestData.description

      // Very short descriptions (possible spam)
      if (desc.length < 5) {
        reasons.push('Description too short to be legitimate')
        riskScore += 15
      }

      // Repeated characters (keyboard mashing)
      if (/(.)\1{10,}/.test(desc)) {
        reasons.push('Description contains repeated characters')
        riskScore += 20
        recommendations.push('Provide meaningful description')
      }

      // Random gibberish detection (low vowel ratio)
      const vowels = (desc.match(/[aeiouáéíóú]/gi) || []).length
      const consonants = (desc.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length
      if (consonants > 0 && vowels / consonants < 0.2) {
        reasons.push('Description appears to be gibberish')
        riskScore += 25
      }

      // Check for testing/spam indicators
      const spamIndicators = ['test', 'teste', 'spam', 'xxx', 'asdf', 'qwerty']
      const lowerDesc = desc.toLowerCase()
      for (const indicator of spamIndicators) {
        if (lowerDesc.includes(indicator)) {
          reasons.push(`Description contains spam indicator: ${indicator}`)
          riskScore += 10
        }
      }
    }

    // Check for invalid coordinates
    if (requestData.location) {
      const { lat, lng } = requestData.location

      // Coordinates outside Portugal
      if (lat < 36.0 || lat > 42.5 || lng < -10.0 || lng > -6.0) {
        reasons.push('Location coordinates outside Portugal')
        riskScore += 15
      }

      // Check for common fake coordinates
      if ((lat === 0 && lng === 0) || (lat === 90 && lng === 0)) {
        reasons.push('Fake/placeholder coordinates detected')
        riskScore += 20
      }
    }

    return {
      isAbusive: riskScore >= 50,
      reasons,
      riskScore,
      recommendations,
    }
  }

  /**
   * Record a request for future analysis
   */
  private recordRequest(identifier: string, requestData: any): void {
    const hash = this.hashRequest(requestData)
    const signature = this.requestSignatures.get(hash)

    if (signature) {
      signature.count++
      signature.lastSeen = Date.now()
      signature.ipAddresses.add(identifier)
    } else {
      this.requestSignatures.set(hash, {
        hash,
        count: 1,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        ipAddresses: new Set([identifier]),
      })
    }
  }

  /**
   * Create a hash of request data for duplicate detection
   */
  private hashRequest(requestData: any): string {
    // Create a simple hash based on key fields
    const key = JSON.stringify({
      category: requestData.category?.id,
      description: requestData.description?.toLowerCase().trim(),
      lat: requestData.location?.lat?.toFixed(4),
      lng: requestData.location?.lng?.toFixed(4),
      urgency: requestData.urgency,
    })

    // Simple hash function
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  /**
   * Get current abuse metrics
   */
  getMetrics(): AbuseMetrics {
    const now = Date.now()
    let totalRequests = 0
    let duplicateRequests = 0

    for (const signature of this.requestSignatures.values()) {
      totalRequests += signature.count
      if (signature.count > 1) {
        duplicateRequests += signature.count - 1
      }
    }

    // Calculate average request interval across all IPs
    let totalIntervals = 0
    let intervalCount = 0
    for (const times of this.ipRequestTimes.values()) {
      if (times.length > 1) {
        for (let i = 1; i < times.length; i++) {
          const current = times[i]
          const previous = times[i - 1]
          if (current !== undefined && previous !== undefined) {
            totalIntervals += current - previous
            intervalCount++
          }
        }
      }
    }

    return {
      totalRequests,
      uniqueRequests: this.requestSignatures.size,
      duplicateRequests,
      suspiciousPatterns: this.blockedIPs.size,
      blockedRequests: this.blockedIPs.size,
      averageRequestInterval: intervalCount > 0 ? totalIntervals / intervalCount : 0,
    }
  }

  /**
   * Manually block an identifier
   */
  blockIdentifier(identifier: string): void {
    this.blockedIPs.add(identifier)
  }

  /**
   * Unblock an identifier
   */
  unblockIdentifier(identifier: string): void {
    this.blockedIPs.delete(identifier)
  }

  /**
   * Check if identifier is blocked
   */
  isBlocked(identifier: string): boolean {
    return this.blockedIPs.has(identifier)
  }

  /**
   * Clean up old data periodically
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      const oneHourAgo = now - 3600000

      // Clean up old request signatures
      for (const [hash, signature] of this.requestSignatures.entries()) {
        if (signature.lastSeen < oneHourAgo) {
          this.requestSignatures.delete(hash)
        }
      }

      // Clean up old request times
      for (const [ip, times] of this.ipRequestTimes.entries()) {
        const recentTimes = times.filter(t => t > oneHourAgo)
        if (recentTimes.length === 0) {
          this.ipRequestTimes.delete(ip)
        } else {
          this.ipRequestTimes.set(ip, recentTimes)
        }
      }
    }, 300000) // Run every 5 minutes
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Singleton instance
let abuseDetectorInstance: AbuseDetector | null = null

export function getAbuseDetector(): AbuseDetector {
  if (!abuseDetectorInstance) {
    abuseDetectorInstance = new AbuseDetector()
  }
  return abuseDetectorInstance
}

export type { AbuseDetectionResult, AbuseMetrics }
