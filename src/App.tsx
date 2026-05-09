import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, signInWithGoogle, signOut as supabaseSignOut } from "./lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  Home,
  Trophy,
  Wallet,
  Shield,
  FileText,
  Video,
  Zap,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  X,
  Gem,
  Users,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Bell,
  Info,
  Sparkles,
  Rocket,
  Target,
  Star,
} from "lucide-react";

/* ── types ── */
type Screen = "landing" | "signin" | "app";
type Page = "home" | "earn" | "withdraw";
type NotifType = "success" | "error" | "warning" | "info";
interface Notif { id: number; msg: string; type: NotifType }

/* ── google icon SVG ── */
function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/* ── floating icon — used sparingly ── */
function FloatingIcon({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className={className}>
      {children}
    </motion.div>
  );
}

/* ── pulsing dot ── */
function PulseDot({ color = "bg-ag-purple" }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-40`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}

/* ── toast ── */
function Toast({ n, onClose }: { n: Notif; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const styles: Record<NotifType, { border: string; icon: React.ReactNode }> = {
    success: { border: "border-ag-emerald bg-ag-emerald/10", icon: <CheckCircle className="w-4 h-4 text-ag-emerald" /> },
    error: { border: "border-ag-danger bg-ag-danger/10", icon: <AlertTriangle className="w-4 h-4 text-ag-danger" /> },
    warning: { border: "border-ag-amber bg-ag-amber/10", icon: <AlertTriangle className="w-4 h-4 text-ag-amber" /> },
    info: { border: "border-ag-blue bg-ag-blue/10", icon: <Bell className="w-4 h-4 text-ag-blue" /> },
  };
  const s = styles[n.type];
  return (
    <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md ${s.border}`}>
      {s.icon}
      <span className="text-sm text-ag-text max-w-xs">{n.msg}</span>
      <button onClick={onClose} className="ml-1 opacity-50 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   LEGAL MODAL — HIGH-FIDELITY PRIVACY POLICY & TERMS OF SERVICE
   ══════════════════════════════════════════════════════════════════════════════ */
function LegalModal({ type, onClose }: { type: "privacy" | "terms"; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }} transition={{ type: "spring", damping: 22 }}
        className="bg-ag-card border border-ag-border rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-ag-border">
          <div className="flex items-center gap-2">
            {type === "privacy"
              ? <div className="p-1.5 rounded-lg bg-ag-cyan/10"><Shield className="w-4 h-4 text-ag-cyan" /></div>
              : <div className="p-1.5 rounded-lg bg-ag-indigo/10"><FileText className="w-4 h-4 text-ag-indigo" /></div>}
            <h2 className="text-lg font-bold text-white">{type === "privacy" ? "Privacy Policy" : "Terms of Service"}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X className="w-4 h-4 text-ag-text-dim" /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-70px)] text-sm text-ag-text-dim leading-relaxed space-y-5">
          
          {/* ═══════════════════════════════════════════════════════════════════
              PRIVACY POLICY
              ═══════════════════════════════════════════════════════════════════ */}
          {type === "privacy" && (<>
            <div className="flex items-center justify-between border-b border-ag-border pb-4 mb-4">
              <div>
                <h1 className="text-xl font-bold text-white">AlphaGems Privacy Policy</h1>
                <p className="text-xs text-ag-text-dim mt-1">Data Protection & Information Security Disclosure</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-ag-purple font-mono uppercase tracking-widest">Document Version 2.1.0</p>
                <p className="text-[10px] text-ag-text-dim font-mono">Last Updated: January 15, 2026</p>
              </div>
            </div>

            <div className="bg-ag-bg/50 border border-ag-border rounded-lg p-4 text-xs">
              <p className="text-ag-text-dim">
                <span className="text-white font-semibold">Effective Date:</span> January 15, 2026 · 
                <span className="text-white font-semibold ml-2">Jurisdiction:</span> International (GDPR/CCPA Compliant) · 
                <span className="text-white font-semibold ml-2">Data Controller:</span> AlphaGems Platform Operations
              </p>
            </div>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§1.</span> Data Encryption Protocols
              </h3>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">1.1 Encryption at Rest:</span> All persistent data stored within AlphaGems infrastructure is encrypted using the Advanced Encryption Standard (AES) with 256-bit keys operating in Galois/Counter Mode (AES-256-GCM). This authenticated encryption algorithm provides both confidentiality and integrity verification, ensuring data cannot be read or tampered with without proper cryptographic keys.
                </p>
                <p>
                  <span className="text-white font-semibold">1.2 Encryption in Transit:</span> All network communications between client applications and AlphaGems servers are secured using Transport Layer Security (TLS) version 1.3 or higher. TLS 1.3 eliminates legacy cryptographic algorithms, provides forward secrecy through ephemeral Diffie-Hellman key exchanges, and reduces handshake latency. Connections using deprecated protocols (TLS 1.0, 1.1, 1.2, SSL) are explicitly rejected.
                </p>
                <p>
                  <span className="text-white font-semibold">1.3 Session Token Security:</span> User session tokens are generated using Cryptographically Secure Pseudo-Random Number Generators (CSPRNG) with a minimum entropy of 256 bits. Session tokens are automatically rotated every 3,600 seconds (1 hour) and are invalidated immediately upon user logout or detection of anomalous activity patterns.
                </p>
                <p>
                  <span className="text-white font-semibold">1.4 Key Management:</span> Cryptographic keys are stored in Hardware Security Modules (HSM) with FIPS 140-2 Level 3 certification. Key rotation occurs on a scheduled basis with zero-downtime deployment procedures.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§2.</span> Third-Party API Compliance & SOC 2 Type II Standards
              </h3>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">2.1 Service Organization Controls:</span> AlphaGems maintains compliance with SOC 2 Type II standards as defined by the American Institute of Certified Public Accountants (AICPA). Our controls are audited annually across all five Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy.
                </p>
                <p>
                  <span className="text-white font-semibold">2.2 Third-Party Integrations:</span> All third-party service providers integrated with the AlphaGems platform are required to demonstrate equivalent or superior security certifications. Vendor security assessments are conducted prior to integration and reviewed quarterly. Current integrations include authentication providers (OAuth 2.0 / OpenID Connect compliant), content delivery networks, and analytics frameworks.
                </p>
                <p>
                  <span className="text-white font-semibold">2.3 Data Anonymization:</span> Any data shared with external APIs for analytics or operational purposes is anonymized through differential privacy techniques. We maintain an epsilon value (ε) of ≤0.01, ensuring statistical indistinguishability of individual user records within aggregated datasets.
                </p>
                <p>
                  <span className="text-white font-semibold">2.4 Subprocessor Disclosure:</span> A complete list of subprocessors handling user data is available upon written request. Users will be notified 30 days in advance of any new subprocessor additions.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§3.</span> Zero-Password Guarantee
              </h3>
              <div className="bg-ag-emerald/5 border border-ag-emerald/20 rounded-lg p-4 mb-3">
                <p className="text-ag-emerald font-semibold text-xs uppercase tracking-wider mb-2">Security Commitment</p>
                <p className="text-white">
                  AlphaGems operates under a strict Zero-Password architecture. We do not request, collect, store, transmit, or intercept user passwords, two-factor authentication (2FA) codes, backup codes, or email credentials under any circumstances.
                </p>
              </div>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">3.1 Authentication Method:</span> User authentication is delegated exclusively to OAuth 2.0-compliant identity providers (e.g., Google). AlphaGems receives only a cryptographically signed identity token containing a unique user identifier, display name, and profile image URL. No credentials are transmitted to our servers.
                </p>
                <p>
                  <span className="text-white font-semibold">3.2 Credential Isolation:</span> The authentication flow occurs entirely within the identity provider's secure domain. AlphaGems application code has no visibility into, access to, or interaction with credential entry forms, password managers, or biometric verification systems.
                </p>
                <p>
                  <span className="text-white font-semibold">3.3 Phishing Prevention:</span> Users are encouraged to verify they are authenticating through official identity provider domains (e.g., accounts.google.com). AlphaGems will never embed credential forms or request login information through in-app interfaces, emails, or direct messages.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§4.</span> Cookie & Tracking Disclosure
              </h3>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">4.1 First-Party Cookies:</span> AlphaGems utilizes strictly necessary first-party cookies for session management, authentication state persistence, and Cross-Site Request Forgery (CSRF) protection. These cookies are HttpOnly, Secure, and SameSite=Strict.
                </p>
                <p>
                  <span className="text-white font-semibold">4.2 No Third-Party Tracking:</span> We do not deploy third-party tracking pixels, cross-site cookies, browser fingerprinting scripts, or participate in Real-Time Bidding (RTB) advertising exchanges. No data is sold to data brokers or advertising networks.
                </p>
                <p>
                  <span className="text-white font-semibold">4.3 Local Storage:</span> Browser local storage is used exclusively for non-sensitive UI preferences (theme selection, sidebar state). This data is cleared upon session termination and is never transmitted to our servers.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§5.</span> Data Retention & Deletion (GDPR/CCPA Compliance)
              </h3>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">5.1 Retention Period:</span> Active user data is retained for the duration of account activity. Following account deactivation or inactivity exceeding 365 days, data enters a 90-day retention window during which it may be recovered upon user request. After this period, data is permanently purged.
                </p>
                <p>
                  <span className="text-white font-semibold">5.2 Right to Erasure:</span> Users may submit a verified deletion request pursuant to GDPR Article 17 ("Right to Erasure") or CCPA Section 1798.105. Upon verification, all associated records are purged from primary databases within 72 hours and from encrypted backup archives within 30 calendar days.
                </p>
                <p>
                  <span className="text-white font-semibold">5.3 Data Portability:</span> Users may request a machine-readable export of their data (GDPR Article 20) via the account settings interface. Exports are provided in JSON format within 5 business days.
                </p>
                <p>
                  <span className="text-white font-semibold">5.4 Secure Destruction:</span> Data destruction follows NIST SP 800-88 ("Guidelines for Media Sanitization") procedures. Cryptographic key material associated with deleted accounts is destroyed using cryptographic erasure techniques.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§6.</span> Incident Response & Breach Notification
              </h3>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">6.1 Detection & Response:</span> AlphaGems maintains a 24/7 Security Operations Center (SOC) with automated threat detection powered by behavioral anomaly analysis. Mean Time to Detect (MTTD) targets are under 15 minutes for critical security events.
                </p>
                <p>
                  <span className="text-white font-semibold">6.2 User Notification:</span> In the event of a confirmed data breach affecting user information, affected users will be notified within 72 hours via the registered authentication email and in-platform notification systems, consistent with GDPR Article 34 requirements.
                </p>
                <p>
                  <span className="text-white font-semibold">6.3 Regulatory Reporting:</span> Breaches meeting notification thresholds will be reported to relevant supervisory authorities within mandated timeframes (72 hours under GDPR Article 33).
                </p>
              </div>
            </section>

            <div className="bg-ag-bg/50 border border-ag-border rounded-lg p-4 mt-6">
              <p className="text-xs text-ag-text-dim">
                <span className="text-white font-semibold">Contact:</span> For privacy-related inquiries, data access requests, or to report security concerns, contact the AlphaGems Data Protection team through the designated support channels. Response times: 5 business days for standard inquiries, 72 hours for security reports.
              </p>
            </div>
          </>)}

          {/* ═══════════════════════════════════════════════════════════════════
              TERMS OF SERVICE
              ═══════════════════════════════════════════════════════════════════ */}
          {type === "terms" && (<>
            <div className="flex items-center justify-between border-b border-ag-border pb-4 mb-4">
              <div>
                <h1 className="text-xl font-bold text-white">AlphaGems Terms of Service</h1>
                <p className="text-xs text-ag-text-dim mt-1">Platform Usage Agreement & Legal Disclosures</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-ag-purple font-mono uppercase tracking-widest">Document Version 2.1.0</p>
                <p className="text-[10px] text-ag-text-dim font-mono">Effective Date: January 15, 2026</p>
              </div>
            </div>

            <div className="bg-ag-amber/5 border border-ag-amber/20 rounded-lg p-4 text-xs">
              <p className="text-ag-amber font-semibold uppercase tracking-wider mb-2">⚠ Important Notice</p>
              <p className="text-ag-text">
                By accessing or using the AlphaGems platform ("Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not access or use the Service.
              </p>
            </div>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§1.</span> Alpha Phase Participation (The Alpha Clause)
              </h3>
              <div className="bg-ag-danger/5 border border-ag-danger/20 rounded-lg p-4 mb-3">
                <p className="text-ag-danger font-semibold text-xs uppercase tracking-wider mb-2">Critical Disclosure — Early Access Build</p>
                <p className="text-white font-medium">
                  AlphaGems is currently operating as an Early Access Alpha Build. Participation in the platform during this phase is strictly for testing, evaluation, and feedback purposes only. No rewards, including but not limited to Robux, Gems, digital assets, or monetary equivalents, are guaranteed, promised, or assured until the platform exits the Alpha Phase and achieves 100% Liquidity Reserve targets as determined solely by AlphaGems.
                </p>
              </div>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">1.1 Development Status:</span> The Service is under active development. Features, interfaces, reward structures, conversion rates, and operational parameters are subject to change, modification, suspension, or discontinuation at any time without prior notice. Historical feature availability does not guarantee future availability.
                </p>
                <p>
                  <span className="text-white font-semibold">1.2 No Contractual Obligation:</span> Participation in the Alpha Phase does not create any contractual obligation on the part of AlphaGems to deliver, fulfill, or honor any rewards, benefits, or promises implied or expressed during the testing period. Users participate voluntarily and at their own discretion.
                </p>
                <p>
                  <span className="text-white font-semibold">1.3 Data & Progress:</span> User data, accumulated Gems, quest completion records, and account progress may be reset, modified, or cleared during Alpha Phase operations for testing, balancing, or technical purposes. Users should not consider any accumulated value as permanent or guaranteed.
                </p>
                <p>
                  <span className="text-white font-semibold">1.4 Exit Criteria:</span> The transition from Alpha Phase to General Availability will be announced through official AlphaGems communication channels. Specific criteria for this transition, including Liquidity Reserve targets, are determined internally and are not subject to external audit or disclosure.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§2.</span> Reward Funding & Distribution Disclaimer
              </h3>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">2.1 External Funding Dependency:</span> The availability and distribution of rewards on the AlphaGems platform are contingent upon the achievement of External Community Funding Goals and Global Engagement Milestones. These metrics are publicly displayed on the platform dashboard and reflect aggregate community participation.
                </p>
                <p>
                  <span className="text-white font-semibold">2.2 Liquidity Reserve Model:</span> AlphaGems operates a Liquidity Reserve funding model wherein reward distribution capacity is directly correlated to platform growth, engagement metrics, and community contribution levels. Withdrawals and redemptions are enabled only when reserve targets are met.
                </p>
                <p>
                  <span className="text-white font-semibold">2.3 No Guarantee of Fulfillment:</span> While AlphaGems endeavors to fulfill reward redemptions in good faith, users acknowledge that external factors including but not limited to funding levels, regulatory changes, third-party platform policies, and market conditions may impact reward availability. AlphaGems makes no guarantee regarding the timeline, method, or certainty of reward fulfillment.
                </p>
                <p>
                  <span className="text-white font-semibold">2.4 Conversion Rate:</span> The internal conversion rate is fixed at 10 Gems = 1 Robux (equivalent unit). This rate is used for display and gamification purposes and does not constitute a financial promise, exchange rate, or contractual obligation.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§3.</span> Non-Affiliation Clause (Roblox Disclaimer)
              </h3>
              <div className="bg-ag-purple/5 border border-ag-purple/30 rounded-lg p-4 mb-3">
                <p className="text-white font-bold text-sm mb-2">⚡ INDEPENDENT ENTITY DECLARATION</p>
                <p className="text-ag-text">
                  <span className="text-white font-semibold">AlphaGems is an independent entity.</span> We are not affiliated with, associated with, authorized by, endorsed by, sponsored by, or in any way officially connected with Roblox Corporation, or any of its subsidiaries, affiliates, or related entities. The official Roblox website is available at www.roblox.com.
                </p>
              </div>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">3.1 Trademark Acknowledgment:</span> "Roblox," "Robux," and related marks are trademarks of Roblox Corporation. Any reference to these terms within the AlphaGems platform is for descriptive purposes only and does not imply any relationship, partnership, or endorsement.
                </p>
                <p>
                  <span className="text-white font-semibold">3.2 Internal Gamification Mapping:</span> Users acknowledge that references to "Robux" within the AlphaGems platform refer to a virtual unit used exclusively for internal gamification mapping at a 10:1 Gem ratio. This terminology is used for user familiarity and does not represent actual Roblox Corporation currency, assets, or any direct claim thereto.
                </p>
                <p>
                  <span className="text-white font-semibold">3.3 Third-Party Platform Independence:</span> AlphaGems operates independently of any third-party gaming platform. Users' accounts, standing, assets, or status on third-party platforms are not affected by, connected to, or managed through AlphaGems.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§4.</span> Account Security & User Responsibility
              </h3>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">4.1 User Responsibility:</span> Users are solely responsible for maintaining the security and confidentiality of their authentication credentials with third-party identity providers (e.g., Google accounts). AlphaGems is not responsible for unauthorized access resulting from compromised third-party credentials.
                </p>
                <p>
                  <span className="text-white font-semibold">4.2 Third-Party Account Issues:</span> AlphaGems expressly disclaims any liability for issues arising from or related to users' third-party accounts, including but not limited to: account suspension, termination, or restriction by third-party platforms; unauthorized access to third-party accounts; loss of third-party account credentials; or actions taken by third-party platforms affecting users' ability to access AlphaGems.
                </p>
                <p>
                  <span className="text-white font-semibold">4.3 Security Best Practices:</span> Users are encouraged to enable two-factor authentication on their identity provider accounts, use unique and strong passwords, and regularly review account activity for unauthorized access.
                </p>
                <p>
                  <span className="text-white font-semibold">4.4 Account Sharing Prohibition:</span> AlphaGems accounts are non-transferable and may not be shared, sold, traded, or otherwise transferred to other individuals. Violations may result in account termination.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§5.</span> Community Integrity & Quest Verification
              </h3>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">5.1 Manual Audit Requirement:</span> All quest submissions, including but not limited to content verification requests, social engagement proofs, and referral claims, are subject to Manual Audit by the AlphaGems verification team. Automated or bot-generated submissions are prohibited and will result in immediate rejection and potential account sanctions.
                </p>
                <p>
                  <span className="text-white font-semibold">5.2 System Integrity Filter:</span> AlphaGems employs a proprietary System Integrity Filter (SIF) to detect fraudulent, manipulated, or policy-violating submissions. The System Integrity Filter maintains final and absolute authority over quest completion determination. Decisions rendered by the SIF are not subject to appeal, dispute, or external review.
                </p>
                <p>
                  <span className="text-white font-semibold">5.3 Verification Timeline:</span> Manual audits are conducted within 24-72 hours of submission under normal operating conditions. High-volume periods may extend verification timelines. Users will be notified of verification outcomes through the platform interface.
                </p>
                <p>
                  <span className="text-white font-semibold">5.4 Prohibited Activities:</span> Users may not engage in: account farming, automated task completion, identity spoofing, submission manipulation, reward exploitation, or any activity designed to circumvent verification mechanisms. Violations result in immediate account termination and forfeiture of accumulated Gems without recourse.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§6.</span> Limitation of Liability
              </h3>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">6.1 Disclaimer of Warranties:</span> THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
                </p>
                <p>
                  <span className="text-white font-semibold">6.2 Limitation:</span> TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ALPHAGEMS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, ANTICIPATED REWARDS, OR OTHER INTANGIBLE LOSSES, RESULTING FROM: (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (C) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR CONTENT OR ACCOUNT.
                </p>
                <p>
                  <span className="text-white font-semibold">6.3 Maximum Liability:</span> In no event shall AlphaGems' total aggregate liability exceed the equivalent value of Gems credited to the user's account in the ninety (90) days immediately preceding the claim, or ten United States dollars ($10.00 USD), whichever is greater.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§7.</span> Governing Law & Dispute Resolution
              </h3>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">7.1 Governing Law:</span> These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
                </p>
                <p>
                  <span className="text-white font-semibold">7.2 Arbitration:</span> Any dispute arising from or relating to these Terms or the Service shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules. Arbitration shall be conducted in English, and the arbitrator's decision shall be final and binding.
                </p>
                <p>
                  <span className="text-white font-semibold">7.3 Class Action Waiver:</span> Users agree that any arbitration or legal proceeding shall be conducted solely on an individual basis and not as a class action, collective action, or representative action. Users waive any right to participate in class proceedings to the fullest extent permitted by applicable law.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-ag-purple">§8.</span> Modifications & Severability
              </h3>
              <div className="space-y-3 pl-4 border-l-2 border-ag-purple/20">
                <p>
                  <span className="text-white font-semibold">8.1 Right to Modify:</span> AlphaGems reserves the right to modify these Terms at any time. Material changes will be communicated through the platform interface or registered contact methods with at least fourteen (14) days advance notice. Continued use of the Service following modifications constitutes acceptance of updated Terms.
                </p>
                <p>
                  <span className="text-white font-semibold">8.2 Severability:</span> If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving its original intent.
                </p>
              </div>
            </section>

            <div className="bg-ag-bg/50 border border-ag-border rounded-lg p-4 mt-6">
              <p className="text-xs text-ag-text-dim">
                <span className="text-white font-semibold">Acknowledgment:</span> By clicking "Sign In," "Join Now," or otherwise accessing the AlphaGems platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and the accompanying Privacy Policy. If you are accessing the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
              </p>
            </div>
          </>)}

        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── FAQ accordion ── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    { q: "Is AlphaGems free to use?", a: "Yes, completely free. You never need to pay anything. You earn Gems by completing simple tasks and can convert them to Robux at no cost." },
    { q: "How do I earn Gems?", a: "Complete quests on the Missions page. Currently, the main quest is creating a TikTok video featuring AlphaGems. More quests will be added as the platform grows." },
    { q: "How does the Robux conversion work?", a: "Every 10 Gems equals 1 Robux. So if you earn 200 Gems from a quest, that's worth 20 Robux." },
    { q: "When can I withdraw my Robux?", a: "Withdrawals open once the community hits the Global Verification Goal. This is a collective milestone — when enough users complete quests, the gateway unlocks for everyone." },
    { q: "Why is there a community goal?", a: "AlphaGems is funded by the platform's growth. When users post about us, it helps us reach more people, which funds the reward pool. The community goal ensures there are enough funds to pay out everyone fairly." },
    { q: "Is this affiliated with Roblox?", a: "No. AlphaGems is an independent platform and is not affiliated with, endorsed by, or sponsored by Roblox Corporation in any way." },
  ];
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="bg-ag-card border border-ag-border rounded-xl overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors">
            <span className="text-sm font-medium text-white pr-4">{item.q}</span>
            <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-ag-text-dim flex-shrink-0" />
            </motion.div>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="px-4 pb-4 text-sm text-ag-text-dim leading-relaxed border-t border-ag-border pt-3">
                  {item.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ── alpha banner ── */
function AlphaBanner() {
  return (
    <div className="fixed bottom-4 left-4 z-[90] max-w-xs">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, type: "spring", damping: 20 }}
        className="bg-ag-card border border-ag-purple/20 rounded-2xl p-4 shadow-xl shadow-black/30">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-ag-purple/15 flex-shrink-0 mt-0.5">
            <Rocket className="w-4 h-4 text-ag-purple" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-ag-purple uppercase tracking-wider">Early Alpha</span>
              <PulseDot color="bg-ag-purple" />
            </div>
            <p className="text-[11px] text-ag-text-dim leading-relaxed">
              AlphaGems is in early alpha. Features & rewards may change.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── bg orbs ── */
function BgOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-ag-purple/[0.03] rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-ag-pink/[0.025] rounded-full blur-[100px]" />
    </div>
  );
}

/* ── brand ── */
function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="p-1.5 rounded-lg bg-gradient-to-br from-ag-purple to-ag-pink">
        <Gem className="w-4 h-4 text-white" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-black italic bg-gradient-to-r from-ag-purple to-ag-pink bg-clip-text text-transparent tracking-wide">ALPHAGEMS</span>
        <span className="text-[9px] text-ag-text-dim font-medium hidden md:inline">Not affiliated with Roblox</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [page, setPage] = useState<Page>("home");
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [tiktokLink, setTiktokLink] = useState("");
  const [tiktokStatus, setTiktokStatus] = useState<"idle" | "pending">("idle");
  const [tiktokCompleted, setTiktokCompleted] = useState(false);
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(null);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [devGems, setDevGems] = useState<number | null>(null);
  const [devPanelOpen, setDevPanelOpen] = useState(false);

  const ADMIN_EMAILS = ["altamimyali9@gmail.com"];
  const isDevUser = user?.email ? ADMIN_EMAILS.includes(user.email) || user.id === "dev-guest-00000" : false;

  // ── Shift+A: toggle dev panel (only for admin email or dev guest) ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "A") {
        if (isDevUser) {
          setDevPanelOpen((p) => !p);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isDevUser]);

  // ── Dev bypass: press "D" three times quickly to enter as Guest with 5000 gems ──
  useEffect(() => {
    let keys: number[] = [];
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "d") { keys = []; return; }
      keys.push(Date.now());
      // Keep only presses within last 1.5 seconds
      keys = keys.filter((t) => Date.now() - t < 1500);
      if (keys.length >= 3) {
        keys = [];
        setUser({
          id: "dev-guest-00000",
          email: "guest@alphagems.dev",
          user_metadata: { full_name: "Guest (Dev)" },
          app_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as User);
        setDevGems(5000);
        setPage("home");
        setScreen("app");
        setAuthLoading(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Helper to move authenticated users into the real app immediately.
  const finalizeAuthenticatedState = useCallback((authUser: User) => {
    setUser(authUser);
    setPage("home");
    setScreen("app");
    setSigningIn(false);
  }, []);

  // ── Supabase auth listener ──
  // Detects OAuth tokens in the hash, finalizes the session, then keeps auth state in sync.
  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      try {
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : "";
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        // If Supabase/Google returned tokens in the URL hash, finalize the session manually.
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("OAuth session finalization error:", error);
          } else if (data.session?.user && mounted) {
            finalizeAuthenticatedState(data.session.user);
          }

          // Remove sensitive tokens from the URL bar immediately.
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Check for an existing session after hash handling.
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          finalizeAuthenticatedState(session.user);
        } else {
          setUser(null);
          setScreen("landing");
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    bootstrapAuth();

    // Keep auth state synced after the initial bootstrap.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        finalizeAuthenticatedState(session.user);

        if (window.location.hash.includes("access_token")) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        setUser(null);
        setScreen("landing");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [finalizeAuthenticatedState]);

  // Only TikTok quest available — 200 gems
  const TIKTOK_REWARD = 200;
  
  const gemBalance = useMemo(() => {
    if (devGems !== null) return devGems;
    return tiktokCompleted ? TIKTOK_REWARD : 0;
  }, [tiktokCompleted, devGems]);

  const robux = Math.floor(gemBalance / 10);
  const globalProgress = tiktokCompleted ? 1 : 0;
  const globalGoal = 1000;

  let _nid = 0;
  const notify = useCallback((msg: string, type: NotifType) => {
    const id = Date.now() + ++_nid;
    setNotifs((p) => [...p, { id, msg, type }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dismissNotif = useCallback((id: number) => setNotifs((p) => p.filter((n) => n.id !== id)), []);

  const handleVerify = () => {
    if (!tiktokLink.trim()) { notify("Enter a valid TikTok URL.", "warning"); return; }
    if (!tiktokLink.includes("tiktok")) { notify("Invalid URL — must be a TikTok link.", "error"); return; }
    setTiktokStatus("pending");
    notify("Video submitted! Manual verification takes 24–48 hours.", "info");
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
      // User will be redirected to Google — the onAuthStateChange listener
      // handles the session when they return
    } catch (err) {
      setSigningIn(false);
      notify("Sign-in failed. Please try again.", "error");
      console.error("Sign-in error:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      // Reset app state first so user sees the transition immediately
      setTiktokCompleted(false);
      setTiktokStatus("idle");
      setTiktokLink("");
      setPage("home");
      // Sign out from Supabase — the onAuthStateChange listener
      // will handle setUser(null) and setScreen("landing")
      await supabaseSignOut();
    } catch (err) {
      notify("Sign-out failed.", "error");
      console.error("Sign-out error:", err);
    }
  };

  // Show nothing while checking for existing session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-ag-bg bg-grid bg-noise flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-ag-purple/30 border-t-ag-purple rounded-full" />
      </div>
    );
  }

  /* ═══════════════════════════════════
     SIGN-IN PAGE
     ═══════════════════════════════════ */
  if (screen === "signin") {
    return (
      <div className="min-h-screen bg-ag-bg bg-grid bg-noise text-ag-text flex items-center justify-center relative px-4">
        <BgOrbs />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", damping: 22 }}
          className="w-full max-w-md relative z-10">
          <div className="bg-ag-card border border-ag-border rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/30">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-ag-purple to-ag-pink mb-4">
                <Gem className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Welcome to AlphaGems</h1>
              <p className="text-sm text-ag-text-dim">Sign in to start earning Gems</p>
            </div>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white rounded-xl text-gray-800 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-wait">
              {signingIn ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>

            <div className="mt-6 text-center">
              <p className="text-[11px] text-ag-text-dim leading-relaxed">
                By continuing, you agree to our{" "}
                <button onClick={() => setLegalModal("terms")} className="text-ag-purple hover:underline">Terms of Service</button>
                {" "}and{" "}
                <button onClick={() => setLegalModal("privacy")} className="text-ag-purple hover:underline">Privacy Policy</button>
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-ag-border text-center">
              <button onClick={() => setScreen("landing")} className="text-xs text-ag-text-dim hover:text-white transition-colors">
                ← Back to home
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-ag-text-dim mt-4">Not affiliated with Roblox Corporation</p>
        </motion.div>

        <AlphaBanner />
        <AnimatePresence>{legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}</AnimatePresence>
      </div>
    );
  }

  /* ═══════════════════════════════════
     LANDING PAGE
     ═══════════════════════════════════ */
  if (screen === "landing") {
    return (
      <div className="min-h-screen bg-ag-bg bg-grid bg-noise text-ag-text flex flex-col relative">
        <BgOrbs />
        <header className="border-b border-ag-border bg-ag-bg/70 backdrop-blur-xl sticky top-0 z-50 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Brand />
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setScreen("signin")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ag-purple to-ag-purple-dim text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-ag-purple/25 transition-shadow">
              Sign In
            </motion.button>
          </div>
        </header>

        <main className="flex-1 flex flex-col relative z-10">
          {/* hero */}
          <section className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, type: "spring", damping: 20 }}>
                <div className="relative inline-block mb-8">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-6 -left-10">
                    <Star className="w-6 h-6 text-ag-amber/30" />
                  </motion.div>
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute -top-4 -right-12">
                    <Sparkles className="w-5 h-5 text-ag-purple/30" />
                  </motion.div>
                  <div className="inline-flex items-center gap-2 px-5 py-2 bg-ag-purple/10 border border-ag-purple/20 rounded-full text-xs text-ag-purple font-semibold uppercase tracking-wider">
                    <PulseDot color="bg-ag-purple" />
                    <span>Early Alpha</span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-6">
                  Earn{" "}
                  <span className="bg-gradient-to-r from-ag-purple via-ag-pink to-ag-purple bg-clip-text text-transparent">Robux</span>
                  {" "}by<br />completing quests
                </h1>
                <p className="text-ag-text-dim text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                  Stack Gems through simple social tasks. <span className="text-white font-semibold">10 Gems = 1 Robux</span> — withdraw once the community goal is hit.
                </p>
                <div className="flex flex-col items-center gap-4">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setScreen("signin")}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-ag-purple to-ag-pink text-white font-bold rounded-2xl text-base hover:shadow-xl hover:shadow-ag-purple/30 transition-all">
                    Join Now <ArrowRight className="w-5 h-5" />
                  </motion.button>
                  <span className="text-[11px] text-ag-text-dim">Free to join · Sign in with Google</span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* how it works */}
          <section className="border-t border-ag-border py-14 sm:py-20 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10 sm:mb-14">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">How It Works</h2>
                <p className="text-sm text-ag-text-dim max-w-lg mx-auto">Three simple steps. No tricks.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { step: "01", title: "Sign In with Google", desc: "One click to create your account. No forms, no passwords to remember.", icon: <GoogleIcon className="w-6 h-6" />, bg: "bg-white/10", border: "border-white/10" },
                  { step: "02", title: "Complete Quests", desc: "Post about AlphaGems on TikTok. More quests coming soon!", icon: <Trophy className="w-6 h-6 text-ag-amber" />, bg: "bg-ag-amber/10", border: "border-ag-amber/20" },
                  { step: "03", title: "Withdraw Robux", desc: "10 Gems = 1 Robux. Cash out when the community goal is met.", icon: <Wallet className="w-6 h-6 text-ag-emerald" />, bg: "bg-ag-emerald/10", border: "border-ag-emerald/20" },
                ].map((s, i) => (
                  <motion.div key={s.step} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.15, type: "spring", damping: 20 }}
                    className={`bg-ag-card border ${s.border} rounded-2xl p-7 text-center glow-card`}>
                    <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mx-auto mb-5`}>{s.icon}</div>
                    <div className="text-[10px] text-ag-purple font-bold uppercase tracking-widest mb-2">Step {s.step}</div>
                    <h3 className="text-white font-bold mb-2 text-lg">{s.title}</h3>
                    <p className="text-ag-text-dim text-sm leading-relaxed">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* why */}
          <section className="border-t border-ag-border py-16 px-6 bg-ag-card/20">
            <div className="max-w-3xl mx-auto text-center">
              <Sparkles className="w-6 h-6 text-ag-purple mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-3">Why do we give away Robux?</h2>
              <p className="text-sm text-ag-text-dim leading-relaxed max-w-2xl mx-auto">
                AlphaGems is funded by community growth. When you post, share, and engage, you grow the platform — that growth funds bigger rewards. The more people join, the larger the reward pool. Win-win.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="border-t border-ag-border py-14 sm:py-20 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Frequently Asked Questions</h2>
                <p className="text-sm text-ag-text-dim">Got questions? We've got answers.</p>
              </div>
              <FAQ />
            </div>
          </section>

          {/* stats — reset to 0 / coming soon */}
          <section className="border-t border-ag-border py-14 px-6">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: "Active Users", value: "Soon..", color: "text-ag-purple" },
                { label: "Gems Distributed", value: "Soon..", color: "text-ag-cyan" },
                { label: "Quests Available", value: "1", color: "text-ag-amber" },
                { label: "Robux Paid Out", value: "Soon..", color: "text-ag-emerald" },
              ].map((s) => (
                <div key={s.label}>
                  <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-ag-text-dim mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t border-ag-border py-5 px-4 sm:px-6 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ag-text-dim">
            <div className="flex items-center gap-3">
              <span>© 2026 AlphaGems</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">Not affiliated with Roblox Corporation</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setLegalModal("privacy")} className="hover:text-ag-purple transition-colors">Privacy Policy</button>
              <button onClick={() => setLegalModal("terms")} className="hover:text-ag-purple transition-colors">Terms of Service</button>
            </div>
          </div>
        </footer>

        <AlphaBanner />
        <AnimatePresence>{legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}</AnimatePresence>
      </div>
    );
  }

  /* ═══════════════════════════════════
     LOGGED-IN APP
     ═══════════════════════════════════ */
  return (
    <div className="min-h-screen bg-ag-bg bg-grid bg-noise text-ag-text flex flex-col relative">
      <BgOrbs />

      {/* navbar */}
      <header className="sticky top-0 z-50 border-b border-ag-border bg-ag-bg/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Brand />
            <nav className="flex items-center gap-0.5 sm:gap-1">
              {([
                { id: "home" as Page, label: "Home", icon: <Home className="w-4 h-4" /> },
                { id: "earn" as Page, label: "Quests", icon: <Trophy className="w-4 h-4" /> },
                { id: "withdraw" as Page, label: "Withdraw", icon: <Wallet className="w-4 h-4" /> },
              ]).map((item) => (
                <button key={item.id} onClick={() => setPage(item.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    page === item.id ? "bg-ag-purple/15 text-ag-purple" : "text-ag-text-dim hover:text-white hover:bg-white/5"
                  }`}>
                  {item.icon} <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 bg-ag-card border border-ag-border rounded-xl">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Gem className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-ag-purple" />
                <span className="text-xs sm:text-sm font-bold text-ag-purple">{gemBalance.toLocaleString()}</span>
              </div>
              <div className="w-px h-4 bg-ag-border hidden sm:block" />
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-[10px] text-ag-text-dim">≈</span>
                <span className="text-sm font-bold text-white">{robux} R$</span>
              </div>
            </div>
            <button onClick={handleSignOut}
              className="text-xs text-ag-text-dim hover:text-white transition-colors">Sign Out</button>
          </div>
        </div>
      </header>

      {/* content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <AnimatePresence mode="wait">

          {/* HOME */}
          {page === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", damping: 22 }} className="space-y-6">
              <div className="rounded-2xl border border-ag-border bg-gradient-to-br from-ag-card via-ag-card to-ag-purple/[0.05] p-5 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-ag-purple/[0.06] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-ag-purple/20 to-ag-pink/10 border border-ag-purple/15">
                    <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-ag-purple" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-white mb-1">Welcome, <span className="bg-gradient-to-r from-ag-purple to-ag-pink bg-clip-text text-transparent">{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Collector"}</span></h1>
                    <p className="text-ag-text-dim text-sm sm:text-base">Complete quests to earn Gems. Every 10 Gems = 1 Robux.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: "Gem Balance", value: gemBalance.toLocaleString(), sub: `≈ ${robux} Robux`, icon: <Gem className="w-5 h-5" />, color: "text-ag-purple", bg: "bg-ag-purple/10", subColor: "text-ag-purple" },
                  { label: "Quests Done", value: tiktokCompleted ? "1" : "0", sub: "of 1 available", icon: <Trophy className="w-5 h-5" />, color: "text-ag-amber", bg: "bg-ag-amber/10", subColor: "text-ag-text-dim" },
                  { label: "Community Goal", value: globalProgress.toString(), sub: `/ ${globalGoal.toLocaleString()} verified`, icon: <Users className="w-5 h-5" />, color: "text-ag-cyan", bg: "bg-ag-cyan/10", subColor: "text-ag-text-dim" },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-ag-card border border-ag-border rounded-2xl p-4 sm:p-5 glow-card">
                    <div className="text-ag-text-dim text-xs mb-2 sm:mb-3 flex items-center justify-between">
                      {stat.label}
                      <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>{stat.icon}</div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                    <div className={`text-sm mt-1 ${stat.subColor}`}>{stat.sub}</div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-ag-card border border-ag-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-ag-amber" />
                    Global Community Goal
                  </h3>
                  <span className="text-xs text-ag-purple font-bold">{globalGoal > 0 ? ((globalProgress / globalGoal) * 100).toFixed(2) : 0}%</span>
                </div>
                <div className="h-3 bg-ag-bg rounded-full overflow-hidden border border-ag-border">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(globalProgress / globalGoal) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-ag-purple to-ag-pink" />
                </div>
                <p className="text-xs text-ag-text-dim mt-3">
                  Withdrawals unlock at <span className="text-white font-semibold">{globalGoal.toLocaleString()}</span> verified posts. Complete quests to contribute.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setPage("earn")}
                  className="flex items-center justify-between bg-ag-card border border-ag-border rounded-2xl p-4 sm:p-5 hover:border-ag-purple/30 transition-all group text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-ag-amber/10 text-ag-amber"><Trophy className="w-5 h-5" /></div>
                    <div><div className="text-sm font-semibold text-white">Start Earning</div><div className="text-xs text-ag-text-dim">1 quest available</div></div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ag-text-dim group-hover:text-ag-purple transition-colors" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setPage("withdraw")}
                  className="flex items-center justify-between bg-ag-card border border-ag-border rounded-2xl p-4 sm:p-5 hover:border-ag-purple/30 transition-all group text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-ag-emerald/10 text-ag-emerald"><Wallet className="w-5 h-5" /></div>
                    <div><div className="text-sm font-semibold text-white">Withdraw Robux</div><div className="text-xs text-ag-text-dim">{robux} R$ available</div></div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ag-text-dim group-hover:text-ag-purple transition-colors" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* EARN */}
          {page === "earn" && (
            <motion.div key="earn" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", damping: 22 }} className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Quests</h1>
                <p className="text-sm text-ag-text-dim">Complete tasks to earn Gems — 10 Gems = 1 Robux.</p>
              </div>

              {/* tiktok mission — only available quest */}
              <div className="rounded-2xl border-2 border-ag-purple/30 bg-gradient-to-br from-ag-card via-ag-card to-ag-purple/[0.06] relative overflow-hidden"
                style={{ boxShadow: "0 0 30px rgba(168,85,247,0.08)" }}>
                <div className="absolute top-0 right-0 w-60 h-60 bg-ag-purple/[0.05] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
                <div className="relative p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <FloatingIcon>
                        <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-ag-purple/20 to-ag-pink/10 border border-ag-purple/25 flex-shrink-0">
                          <Video className="w-5 h-5 sm:w-6 sm:h-6 text-ag-purple" />
                        </div>
                      </FloatingIcon>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h2 className="text-base sm:text-lg font-bold text-white">TikTok Mission</h2>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-ag-purple/10 text-ag-purple border border-ag-purple/20 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Only Quest
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-ag-text-dim">Post a TikTok featuring AlphaGems and submit the link for manual verification.</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0 pl-11 sm:pl-0">
                      <div className="text-xl sm:text-2xl font-black bg-gradient-to-r from-ag-purple to-ag-pink bg-clip-text text-transparent">200</div>
                      <div className="text-[10px] text-ag-text-dim uppercase tracking-wider">Gems (20 R$)</div>
                    </div>
                  </div>

                  <button onClick={() => setLearnMoreOpen(!learnMoreOpen)}
                    className="flex items-center gap-1.5 text-xs text-ag-purple hover:text-ag-pink transition-colors mb-4">
                    <Info className="w-3.5 h-3.5" />
                    <span>Why does this matter?</span>
                    <motion.div animate={{ rotate: learnMoreOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {learnMoreOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="bg-ag-bg/60 border border-ag-border rounded-xl p-4 mb-4 text-xs text-ag-text-dim leading-relaxed space-y-2">
                          <p><span className="text-white font-semibold">Here's the deal:</span> Robux rewards are funded by platform growth. Your TikTok helps us reach more people — more people means a bigger reward pool for everyone.</p>
                          <p>Every verified video contributes to the <span className="text-ag-purple font-semibold">Global Community Goal</span>. Once we hit {globalGoal.toLocaleString()} verified posts, withdrawals unlock for all users.</p>
                          <p>All submissions go through <span className="text-white font-semibold">manual verification</span> by our team. We check that the video is real, mentions AlphaGems, and follows our guidelines. This typically takes 24–48 hours.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {tiktokStatus === "idle" && !tiktokCompleted && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <input type="url" value={tiktokLink} onChange={(e) => setTiktokLink(e.target.value)}
                          placeholder="https://www.tiktok.com/@user/video/..."
                          className="w-full bg-ag-bg border border-ag-border rounded-xl px-4 py-3 text-sm text-white placeholder-ag-text-dim focus:outline-none focus:border-ag-purple/50 focus:ring-1 focus:ring-ag-purple/20 transition-all" />
                        <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-text-dim" />
                      </div>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleVerify}
                        className="px-7 py-3 bg-gradient-to-r from-ag-purple to-ag-pink text-white font-bold rounded-xl text-sm hover:shadow-lg hover:shadow-ag-purple/25 transition-shadow">
                        Submit
                      </motion.button>
                    </div>
                  )}

                  {tiktokStatus === "pending" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-3 p-4 bg-ag-amber/10 border border-ag-amber/20 rounded-xl">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                        <Clock className="w-5 h-5 text-ag-amber" />
                      </motion.div>
                      <div>
                        <span className="text-ag-amber font-bold text-sm">Pending Manual Review</span>
                        <p className="text-xs text-ag-text-dim">Our team is verifying your submission. Estimated: 24–48 hours.</p>
                      </div>
                    </motion.div>
                  )}

                  {tiktokCompleted && (
                    <div className="flex items-center gap-3 p-4 bg-ag-emerald/10 border border-ag-emerald/20 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-ag-emerald" />
                      <div>
                        <span className="text-ag-emerald font-bold text-sm">Verified & Completed</span>
                        <p className="text-xs text-ag-text-dim">200 Gems have been credited to your account.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* more quests coming soon */}
              <div className="rounded-2xl border border-dashed border-ag-border bg-ag-card/50 p-8 text-center">
                <div className="inline-flex p-3 rounded-2xl bg-ag-purple/5 mb-4">
                  <Target className="w-8 h-8 text-ag-purple/40" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">More Quests Coming Soon</h3>
                <p className="text-sm text-ag-text-dim max-w-md mx-auto leading-relaxed">
                  We're working on adding more ways to earn Gems — follow us on social media, referral programs, daily check-ins, and more. Stay tuned!
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <PulseDot color="bg-ag-purple" />
                  <span className="text-xs text-ag-purple font-medium">In Development</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* WITHDRAW */}
          {page === "withdraw" && (
            <motion.div key="withdraw" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", damping: 22 }} className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Withdraw</h1>
                <p className="text-sm text-ag-text-dim">You have <span className="text-ag-purple font-semibold">{gemBalance.toLocaleString()} Gems</span> ≈ <span className="text-white font-semibold">{robux} R$</span></p>
              </div>

              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  {[
                    { amount: 100, gems: 1000, label: "Starter", color: "from-ag-blue to-ag-cyan" },
                    { amount: 500, gems: 5000, label: "Premium", color: "from-ag-purple to-ag-pink" },
                    { amount: 2000, gems: 20000, label: "Elite", color: "from-ag-amber to-ag-rose" },
                  ].map((opt, i) => (
                    <motion.div key={opt.amount} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-ag-card border border-ag-border rounded-2xl p-7 text-center relative overflow-hidden">
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${opt.color}`} />
                      <div className="text-[10px] font-bold uppercase tracking-widest text-ag-purple mb-4">{opt.label}</div>
                      <div className="text-4xl font-black text-white mb-1">{opt.amount.toLocaleString()}</div>
                      <div className="text-sm text-ag-text-dim mb-1">Robux</div>
                      <div className="text-xs text-ag-text-dim mb-5 flex items-center justify-center gap-1">
                        <Gem className="w-3 h-3 text-ag-purple" /> {opt.gems.toLocaleString()} Gems
                      </div>
                      <button onClick={() => notify("⛔ GATEWAY OFFLINE — Community goal not reached.", "error")}
                        className="w-full py-2.5 bg-white/5 text-ag-text-dim border border-ag-border rounded-xl font-bold text-sm cursor-not-allowed">
                        <Lock className="w-4 h-4 inline mr-1.5 -mt-0.5" /> Redeem
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* lock overlay */}
                <div className="absolute inset-0 rounded-2xl bg-ag-overlay backdrop-blur-sm flex flex-col items-center justify-center z-10 border border-ag-purple/15">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 20 }} className="text-center px-6">
                    <FloatingIcon>
                      <div className="rounded-full bg-ag-purple/10 border-2 border-ag-purple/25 flex items-center justify-center mx-auto mb-5 p-4">
                        <Lock className="w-8 h-8 text-ag-purple" />
                      </div>
                    </FloatingIcon>
                    <h2 className="text-xl font-black text-white mb-2 uppercase tracking-wider">System Integrity Lock</h2>
                    <p className="text-sm text-ag-text-dim max-w-md mx-auto mb-5">Withdrawals unlock when the Global Community Goal is reached.</p>

                    <div className="bg-ag-card border border-ag-border rounded-xl p-4 max-w-xs mx-auto mb-5">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-ag-text-dim">Progress</span>
                        <span className="text-ag-purple font-bold">{((globalProgress / globalGoal) * 100).toFixed(2)}%</span>
                      </div>
                      <div className="h-3 bg-ag-bg rounded-full overflow-hidden border border-ag-border">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(globalProgress / globalGoal) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-ag-purple to-ag-pink" />
                      </div>
                      <div className="flex justify-between text-xs text-ag-text-dim mt-2">
                        <span><span className="text-white font-semibold">{globalProgress}</span> verified</span>
                        <span><span className="text-white font-semibold">{globalGoal.toLocaleString()}</span> needed</span>
                      </div>
                    </div>

                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setPage("earn")}
                      className="px-6 py-2.5 text-sm font-bold text-ag-purple border border-ag-purple/30 rounded-xl hover:bg-ag-purple/10 transition-all">
                      Contribute to Goal →
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* footer */}
      <footer className="border-t border-ag-border py-4 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ag-text-dim">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <span>© 2026 AlphaGems</span><span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Not affiliated with Roblox</span>
            <button onClick={() => setLegalModal("privacy")} className="hover:text-ag-purple transition-colors">Privacy</button>
            <button onClick={() => setLegalModal("terms")} className="hover:text-ag-purple transition-colors">Terms</button>
          </div>
          <div className="flex items-center gap-1.5">
            <PulseDot color="bg-ag-emerald" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </footer>

      {/* toasts */}
      <div className="fixed top-20 right-6 z-[200] space-y-2">
        <AnimatePresence>{notifs.map((n) => <Toast key={n.id} n={n} onClose={() => dismissNotif(n.id)} />)}</AnimatePresence>
      </div>

      <AlphaBanner />
      <AnimatePresence>{legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}</AnimatePresence>

      {/* ── Dev Panel (Shift+A) — admin/dev only ── */}
      <AnimatePresence>
        {devPanelOpen && isDevUser && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 z-[300] bg-ag-card border-l border-ag-purple/20 shadow-2xl shadow-black/50 flex flex-col"
          >
            {/* header */}
            <div className="flex items-center justify-between p-4 border-b border-ag-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-ag-emerald animate-pulse" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Dev Panel</span>
              </div>
              <button onClick={() => setDevPanelOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-4 h-4 text-ag-text-dim" />
              </button>
            </div>

            {/* user info */}
            <div className="p-4 border-b border-ag-border">
              <p className="text-[10px] text-ag-text-dim uppercase tracking-widest mb-2">Signed in as</p>
              <p className="text-sm text-white font-medium truncate">{user?.user_metadata?.full_name || "Unknown"}</p>
              <p className="text-xs text-ag-text-dim truncate">{user?.email}</p>
              <p className="text-[10px] text-ag-text-dim font-mono mt-1">ID: {user?.id?.slice(0, 16)}...</p>
            </div>

            {/* content area — empty for now */}
            <div className="flex-1 p-4 overflow-y-auto">
              <p className="text-xs text-ag-text-dim text-center mt-8">Dev tools will appear here.</p>
            </div>

            {/* footer */}
            <div className="p-4 border-t border-ag-border">
              <p className="text-[10px] text-ag-text-dim text-center">Shift + A to toggle</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
