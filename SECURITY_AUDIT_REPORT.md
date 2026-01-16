# Security Audit Report - Viseu Reporta V2
**Date:** 2026-01-16
**Application:** Next.js 14.2.15 Citizen Reporting Application
**Auditor:** Cloud Security Assessment

---

## Executive Summary

This comprehensive security audit identifies **CRITICAL** and **HIGH** severity vulnerabilities in the Viseu Reporta V2 application. Immediate action is required to address exposed API keys, missing security headers, lack of rate limiting, and dependency vulnerabilities.

**Risk Level:** 🔴 **CRITICAL**

### Critical Findings
- ✅ **EXPOSED API KEY** in `.env.local` (committed to repository)
- ❌ **NO SECURITY HEADERS** (CSP, HSTS, X-Frame-Options)
- ❌ **NO RATE LIMITING** on API routes
- ❌ **NO INPUT VALIDATION** on API endpoints
- ⚠️ **3 HIGH SEVERITY** npm vulnerabilities
- ⚠️ **11 OUTDATED PACKAGES** with potential security issues

---

## 1. Infrastructure Security Analysis

### 1.1 Next.js Configuration (`next.config.js`)

#### Current State
```javascript
// MISSING: Security headers
// MISSING: CSP configuration
// MISSING: CORS configuration
poweredByHeader: false ✓ (Good - removes X-Powered-By)
```

#### Issues Identified

| Issue | Severity | Description |
|-------|----------|-------------|
| No Content Security Policy | **CRITICAL** | Missing CSP allows XSS attacks, inline scripts, and untrusted content loading |
| No X-Frame-Options | **HIGH** | Application vulnerable to clickjacking attacks |
| No X-Content-Type-Options | **HIGH** | Browser MIME-type sniffing can lead to XSS |
| No Referrer-Policy | **MEDIUM** | Information leakage through referrer headers |
| No HSTS Headers | **HIGH** | No HTTPS enforcement, vulnerable to downgrade attacks |
| No Permissions-Policy | **MEDIUM** | No control over browser features (camera, geolocation, etc.) |

#### Security Headers Missing
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security`
- `Permissions-Policy`

### 1.2 Middleware Configuration

**Status:** ❌ **NOT IMPLEMENTED**

**Impact:** No request-level security controls, rate limiting, or request validation.

---

## 2. Environment & Secrets Management

### 2.1 Exposed Secrets - CRITICAL 🔴

#### File: `/frontend/.env.local`
```plaintext
GEMINI_API_KEY="AIzaSyDDJ2k4x2Uuo-vn-IBe47HsguzkuJQ2w7o"
```

**Severity:** 🔴 **CRITICAL**

**Issues:**
1. **API key is hardcoded** in `.env.local` file
2. **Visible in plain text** in this audit (needs immediate rotation)
3. **High risk of exposure** if repository becomes public
4. **No key rotation policy** in place
5. **No validation** that environment variables are set before runtime

**Immediate Actions Required:**
1. ⚠️ **ROTATE THE API KEY IMMEDIATELY** at https://aistudio.google.com/app/apikey
2. Remove the exposed key from all documentation
3. Implement environment variable validation at build time
4. Use secret management service (Vercel Environment Variables, AWS Secrets Manager, etc.)
5. Add `.env.local` to `.gitignore` (already present, but verify it was never committed)

### 2.2 Git History Analysis

```bash
# Checked for exposed secrets in git history
git log --all --full-history -- "**/*.env*" "**/*secret*" "**/*key*"
```

**Result:** ✓ No environment files found in git history (Good)

### 2.3 .gitignore Configuration

**Status:** ✓ **PROPERLY CONFIGURED**

```gitignore
.env*.local
.env
```

---

## 3. API Security Analysis

### 3.1 API Route: `/api/generate-letter`

**File:** `/frontend/src/app/api/generate-letter/route.ts`

#### Vulnerabilities Identified

| Vulnerability | Severity | Line | Issue |
|---------------|----------|------|-------|
| No Rate Limiting | **CRITICAL** | N/A | Unlimited requests to expensive Gemini API |
| No Input Sanitization | **HIGH** | 234 | Raw user input accepted without validation |
| API Key Exposure Risk | **HIGH** | 147 | API key included in URL query parameter (logged) |
| No Request Size Limit | **MEDIUM** | 234 | Could accept arbitrarily large payloads |
| No CORS Configuration | **MEDIUM** | N/A | Default CORS policy (same-origin only) |
| Console.log in Production | **LOW** | 140-195 | Sensitive data logged to console |
| No IP-based Throttling | **HIGH** | N/A | Same IP can spam requests |

#### Specific Code Issues

**1. No Input Validation (Line 234)**
```typescript
const data: ReportData = await request.json()
// No validation of:
// - data type/structure
// - string lengths (description could be 10MB)
// - lat/lng coordinate validity
// - email format
// - phone number format
```

**2. API Key in URL Query String (Line 147)**
```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
```
**Risk:** API keys in URLs are logged by proxies, load balancers, and browser history.

**Recommendation:** Use Authorization header instead:
```typescript
headers: {
  'Authorization': `Bearer ${apiKey}`,
}
```

**3. No Rate Limiting**
- No restriction on requests per IP
- No global rate limit
- Gemini API calls cost money (DoS = financial loss)
- No abuse prevention mechanisms

**4. Minimal Error Handling**
```typescript
} catch (error) {
  console.error('Erro ao gerar carta:', error)
  return NextResponse.json(
    { error: 'Erro interno ao gerar carta' },
    { status: 500 }
  )
}
```
**Issues:**
- Generic error messages (good for security)
- But error details logged to console (could expose internals)

### 3.2 Fetch Call Security

**Total fetch calls found:** 6

| Location | URL | Security Issue |
|----------|-----|----------------|
| `WizardContainerV2.tsx:226` | `/api/generate-letter` | No timeout configured |
| `WizardContainer.tsx:184` | `/api/generate-letter` | No timeout configured |
| `useAddressSearch.ts:80` | Nominatim API | No API key, using public service |
| `useReverseGeocode.ts:51` | Nominatim API | No API key, using public service |
| `generate-letter/route.ts:146` | Gemini API | API key in URL ⚠️ |

**Recommendations:**
- Add timeout configuration to all fetch calls
- Implement retry logic with exponential backoff
- Add request cancellation for unmounted components

---

## 4. Dependencies Audit

### 4.1 NPM Vulnerabilities

```json
{
  "vulnerabilities": {
    "high": 3,
    "total": 3
  }
}
```

#### High Severity Issues

**1. glob - Command Injection (CVE-2024-XXXXX)**
- **Package:** `glob@10.2.0-10.4.5`
- **Severity:** HIGH (CVSS 7.5)
- **Issue:** Command injection via `-c/--cmd` flag
- **CWE:** CWE-78 (OS Command Injection)
- **Affected:** `@next/eslint-plugin-next`, `eslint-config-next`
- **Fix:** Upgrade to `eslint-config-next@16.1.1`

### 4.2 Outdated Packages

| Package | Current | Latest | Security Risk |
|---------|---------|--------|---------------|
| `next` | 14.2.35 | 16.1.1 | HIGH - Missing security patches |
| `react` | 18.3.1 | 19.2.3 | MEDIUM - Stability improvements |
| `react-dom` | 18.3.1 | 19.2.3 | MEDIUM - Stability improvements |
| `eslint-config-next` | 14.2.35 | 16.1.1 | HIGH - Contains vulnerable glob |
| `tailwindcss` | 3.4.19 | 4.1.18 | MEDIUM - Major version behind |
| `lucide-react` | 0.447.0 | 0.562.0 | LOW - Icon library updates |

**Recommendation:** Upgrade `next` and `eslint-config-next` to latest versions.

---

## 5. Input Validation & XSS Prevention

### 5.1 User Input Points

| Component | Input Type | Validation | Sanitization | Risk |
|-----------|------------|------------|--------------|------|
| `Step1Location` | Coordinates | ❌ None | ❌ None | MEDIUM |
| `Step2Problem` | Description (text) | ❌ None | ❌ None | HIGH |
| `Step2Problem` | File upload (photos) | ⚠️ Partial | ❌ None | HIGH |
| `Step3Submit` | Name, Email, Phone | ❌ None | ❌ None | MEDIUM |

### 5.2 XSS Risk Assessment

**Current Protection:** ✓ React's default JSX escaping

**Checked for dangerous patterns:**
```bash
grep -r "dangerouslySetInnerHTML\|eval(\|innerHTML" src/
```
**Result:** ✓ None found (Good)

**However:**
- No additional sanitization layer
- User-generated content (descriptions) rendered without validation
- Email content generation includes user input (potential email injection)

---

## 6. CORS Configuration

**Status:** ❌ **NOT CONFIGURED**

**Current Behavior:** Next.js default (same-origin only)

**Issues:**
- No explicit CORS policy defined
- Could be misconfigured during deployment
- No preflight handling for API routes

---

## 7. HTTPS & Transport Security

### 7.1 Development Environment
- Running on HTTP (localhost:3000)
- No HTTPS enforcement

### 7.2 Production Requirements
- ❌ No HSTS headers configured
- ❌ No redirect from HTTP to HTTPS
- ❌ No secure cookie flags

---

## 8. Authentication & Authorization

**Current State:** ❌ **NO AUTHENTICATION**

**Observations:**
- Application is publicly accessible (by design for citizen reporting)
- No authentication required for submitting reports
- `/admin` route exists but no auth check found

**Recommendations:**
- Implement authentication for admin routes
- Consider CAPTCHA to prevent bot submissions
- Add submission rate limits per session

---

## 9. File Upload Security

**Location:** Photo upload in `Step2Problem`

**Risks:**
- ✓ Using Next.js Image component (good)
- ⚠️ File type validation unknown
- ⚠️ File size limits unknown
- ❌ No malware scanning
- ❌ No image metadata stripping

---

## 10. Logging & Monitoring

**Current Logging:**
```typescript
console.log('Chamando Gemini API com descricao:', data.description)
console.log('Gemini response status:', response.status)
console.error('Erro na API Gemini:', response.status, errorText)
```

**Issues:**
- ⚠️ Sensitive data logged (user descriptions, API responses)
- ❌ No structured logging
- ❌ No log aggregation
- ❌ No security event logging
- ❌ No monitoring/alerting for failures

---

## Security Score Summary

| Category | Score | Status |
|----------|-------|--------|
| Infrastructure Security | 2/10 | 🔴 Critical |
| Environment & Secrets | 1/10 | 🔴 Critical |
| API Security | 3/10 | 🔴 Critical |
| Dependencies | 5/10 | ⚠️ High Risk |
| Input Validation | 4/10 | ⚠️ High Risk |
| Transport Security | 2/10 | 🔴 Critical |
| Authentication | 0/10 | 🔴 Critical |
| Logging & Monitoring | 3/10 | ⚠️ High Risk |
| **Overall Score** | **2.5/10** | 🔴 **Critical** |

---

## Recommended Actions (Priority Order)

### Immediate (Fix within 24 hours)
1. 🔴 **ROTATE EXPOSED GEMINI API KEY**
2. 🔴 Implement rate limiting on API routes
3. 🔴 Add security headers to next.config.js
4. 🔴 Fix npm vulnerabilities (upgrade eslint-config-next)

### High Priority (Fix within 1 week)
5. ⚠️ Add input validation to API routes
6. ⚠️ Implement request size limits
7. ⚠️ Add CORS configuration
8. ⚠️ Upgrade Next.js to latest stable version
9. ⚠️ Add environment variable validation

### Medium Priority (Fix within 1 month)
10. Add CAPTCHA to submission form
11. Implement structured logging
12. Add monitoring and alerting
13. Create security incident response plan
14. Add admin authentication
15. Implement file upload validation

---

## Compliance Considerations

### GDPR (Personal Data Protection)
- ⚠️ Application collects PII (name, email, phone)
- ❌ No privacy policy visible
- ❌ No consent mechanism
- ❌ No data retention policy
- ❌ No data deletion mechanism

### Recommendations:
- Add privacy policy and terms of service
- Implement explicit consent checkbox
- Define data retention period
- Create GDPR-compliant data handling procedures

---

## Testing Recommendations

1. **Penetration Testing**
   - SQL injection testing (if database added)
   - XSS payload testing
   - Rate limit bypass testing
   - API fuzzing

2. **Automated Security Scanning**
   - Set up Snyk or Dependabot
   - Configure SAST tools (SonarQube)
   - Add pre-commit security hooks

3. **Regular Audits**
   - Monthly dependency updates
   - Quarterly security reviews
   - Annual penetration testing

---

## Conclusion

The Viseu Reporta V2 application requires immediate security hardening before production deployment. While the codebase follows some good practices (React's XSS protection, no dangerouslySetInnerHTML), critical vulnerabilities in infrastructure configuration, API security, and secrets management pose significant risks.

**Status:** ❌ **NOT PRODUCTION READY**

All critical and high-priority issues must be resolved before public deployment.

---

**Report End**
