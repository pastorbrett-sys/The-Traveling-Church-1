# Vagabond Live - Financial Model

> Comprehensive cost breakdown, revenue projections, and business viability analysis

*Last Updated: January 2026*

---

## Table of Contents
1. [Variable Costs (Per-Use)](#variable-costs)
2. [Fixed Costs (Monthly)](#fixed-costs)
3. [Revenue Model](#revenue-model)
4. [Scenario Projections](#scenario-projections)
5. [Break-Even Analysis](#break-even-analysis)
6. [Cash Flow Projections](#cash-flow-projections)
7. [Key Metrics & Unit Economics](#unit-economics)

---

## Variable Costs (Per-Use) {#variable-costs}

### Video Infrastructure (Daily.co)

| Item | Rate | Unit | Notes |
|------|------|------|-------|
| Video/Audio | $0.004 | per participant-minute | Core cost |
| Recording (composition) | $0.01349 | per recorded minute | Composing video streams |

**Free Tier**: 10,000 participant-minutes/month

**Example Calculation - 1 Hour Session, 10 Participants (video only):**
- Video: 10 × 60 × $0.004 = **$2.40**

**With Recording:**
- Video: $2.40
- Recording: 60 × $0.01349 = $0.81
- **Total: $3.21**

---

### Real-Time Transcription/Captions (Deepgram Nova-3)

| Item | Rate | Unit | Notes |
|------|------|------|-------|
| Speech-to-Text | $0.0043 | per minute | Single channel |
| Multi-speaker | $0.0086 | per minute | If diarizing speakers |

**Free Tier**: $200 credit (~46,500 minutes)

**Example - 1 Hour Session with Captions:**
- Single channel: 60 × $0.0043 = $0.26
- Multi-speaker: 60 × $0.0086 = $0.52

---

### AI Features (OpenAI GPT-4o)

| Feature | Input Tokens | Output Tokens | Cost per Use |
|---------|--------------|---------------|--------------|
| Session Summary | 3,000 | 1,000 | $0.0175 |
| Discussion Questions | 500 | 500 | $0.0063 |
| "Ask the AI" Query | 300 | 200 | $0.0028 |
| Passage Context | 200 | 300 | $0.0035 |

**Pricing**: $2.50/1M input tokens, $10.00/1M output tokens

**Example - 1 Hour Session (avg usage):**
- 1 Summary: $0.0175
- 3 Discussion Questions: $0.019
- 5 "Ask the AI" queries: $0.014
- **Total AI: $0.05**

---

### Recording Storage (Cloudflare R2)

| Item | Rate | Notes |
|------|------|-------|
| Storage | $0.015/GB/month | 10 GB free |
| Egress | FREE | Major advantage |
| Class A ops | $4.50/million | PUT, COPY |
| Class B ops | $0.36/million | GET |

**Recording Size Estimates:**
| Quality | Size per Hour | Monthly Storage Cost |
|---------|---------------|---------------------|
| 480p | ~200 MB | $0.003 |
| 720p | ~500 MB | $0.0075 |
| 1080p | ~1.5 GB | $0.0225 |

---

### Payment Processing (Stripe)

| Type | Fee | Notes |
|------|-----|-------|
| Subscriptions | 2.9% + $0.30 | Per transaction |
| Donations (Connect) | 2.9% + $0.30 + 0.25% | If taking platform fee |
| Payouts to Hosts | $0.25 | Per payout (can batch) |

---

### Variable Cost Summary Table

**All features enabled (worst case):**

| Cost Component | Per 1-Hr Session (10 ppl) | Per 1-Hr Session (25 ppl) | Per 1-Hr Session (50 ppl) |
|----------------|---------------------------|---------------------------|---------------------------|
| Video (Daily.co) | $2.40 | $6.00 | $12.00 |
| Recording | $0.81 | $0.81 | $0.81 |
| Captions (Deepgram) | $0.26 | $0.26 | $0.26 |
| AI Features | $0.05 | $0.08 | $0.12 |
| Storage (R2, 720p, monthly) | $0.0075 | $0.0075 | $0.0075 |
| **TOTAL (all features)** | **$3.53** | **$7.15** | **$13.20** |

**Minimal (video only, no recording/captions/AI):**

| Participants | Video Cost Only |
|--------------|-----------------|
| 10 ppl × 60 min | $2.40 |
| 25 ppl × 60 min | $6.00 |
| 50 ppl × 60 min | $12.00 |

**Key Insight**: Recording ($0.81) and captions ($0.26) are fixed per session regardless of participants. Video scales linearly with participants.

---

## Fixed Costs (Monthly) {#fixed-costs}

### Infrastructure & Services

| Item | Monthly Cost | Notes |
|------|--------------|-------|
| Replit Deployment | $25-100 | Depending on scale |
| Neon Database | $0-25 | Shared with Vagabond Bible |
| Domain/SSL | ~$2 | Amortized annually |
| Email (Resend) | $0-20 | 3K emails free |
| Error Monitoring | $0-30 | Sentry free tier available |
| Analytics | $0-15 | Plausible/Fathom |
| **Subtotal** | **$27-192** | |

### Operational Costs

| Item | Monthly Cost | Notes |
|------|--------------|-------|
| Customer Support Tools | $0-50 | Intercom/Crisp |
| Legal/Compliance | ~$50 | Amortized annually |
| Accounting | ~$100 | Amortized annually |
| Marketing | Variable | Not included in base |
| **Subtotal** | **$150-200** | |

### Total Fixed Costs

| Stage | Monthly Fixed Costs |
|-------|---------------------|
| **MVP/Early** | ~$100/month |
| **Growing** | ~$300/month |
| **Scale** | ~$500-1,000/month |

---

## Revenue Model {#revenue-model}

### Final Subscription Tiers

| Tier | Monthly | Annual (17% off) | Sessions | Max Ppl | Recording | Captions |
|------|---------|------------------|----------|---------|-----------|----------|
| **Free** | $0 | - | 2/mo | 5 | ❌ | ❌ |
| **Personal** | $9.99 | $99/yr | 8/mo | 8 | ❌ | ❌ |
| **Ministry** | $29.99 | $299/yr | 12/mo | 12 | ✅ ($0.50 add-on) | ❌ |
| **Church** | $99.99 | $999/yr | 20/mo | 20 | ✅ included | ❌ |
| **Enterprise** | $199+ | Custom | Unlimited | 100+ | ✅ | ✅ |

### Tier Details

**Free** - Trial/evaluation
- 2 sessions/month, 30 min max, 5 participants max
- No recording, AI, or captions

**Personal ($9.99/mo)** - Individual leaders, small groups
- 8 sessions/month, 8 participants max
- Video only (no recording by default)
- *Variable cost: ~$4.70/mo → 53% gross margin*

**Ministry ($29.99/mo)** - Home churches, Bible study groups  
- 12 sessions/month, 12 participants max
- Recording available as $0.50/session add-on
- AI summaries included
- *Variable cost: ~$13.61/mo → 55% gross margin*

**Church ($99.99/mo)** - Growing churches
- 20 sessions/month, 20 participants max
- Recording included
- AI features included
- Priority support
- *Variable cost: ~$49.10/mo → 51% gross margin*

**Enterprise (Usage-based)** - Mega-churches, denominations
- $199/month base (includes 30K participant-minutes)
- Overage: $4.50 per 1,000 participant-minutes
- All features including real-time captions
- Custom branding, dedicated support
- *15% margin on overage*

### Additional Revenue Streams

| Stream | Rate | Projected % of Revenue |
|--------|------|------------------------|
| Donation Processing Fee | 2% of donations | 10-15% |
| Recording Add-on (Personal/Ministry) | $0.50/session | 5-8% |
| Storage Overage | $0.10/GB over limit | 2-5% |
| Pay-per-session (future) | $1.99/session | 5-10% |

---

## Scenario Projections {#scenario-projections}

### Year 1 Projections (Using Final Recommended Pricing)

**Pricing Used:**
- Personal: $9.99/mo
- Ministry: $29.99/mo  
- Church: $99.99/mo
- Enterprise: Usage-based

#### Scenario A: Conservative (Slow Growth)

| Month | Free | Personal ($9.99) | Ministry ($29.99) | Church ($99.99) | MRR |
|-------|------|------------------|-------------------|-----------------|-----|
| 1 | 50 | 3 | 2 | 0 | $90 |
| 3 | 150 | 15 | 8 | 2 | $590 |
| 6 | 400 | 40 | 20 | 5 | $1,500 |
| 12 | 1,000 | 100 | 60 | 15 | $4,300 |

**Year 1 Summary (Conservative):**
- Total Revenue: ~$25,000
- Variable Costs (~47% of revenue): ~$12,000
- Fixed Costs: ~$4,000
- **Net Profit: ~$9,000**

#### Scenario B: Moderate Growth

| Month | Free | Personal ($9.99) | Ministry ($29.99) | Church ($99.99) | MRR |
|-------|------|------------------|-------------------|-----------------|-----|
| 1 | 100 | 8 | 4 | 1 | $300 |
| 3 | 500 | 50 | 30 | 5 | $1,900 |
| 6 | 1,500 | 150 | 80 | 15 | $5,400 |
| 12 | 5,000 | 400 | 200 | 50 | $15,000 |

*MRR check Month 1: 8×$9.99 + 4×$29.99 + 1×$99.99 = $80 + $120 + $100 = $300*

**Year 1 Summary (Moderate):**
- Total Revenue: ~$85,000
- Variable Costs (~47% of revenue): ~$40,000
- Fixed Costs: ~$6,000
- **Net Profit: ~$39,000**

#### Scenario C: Aggressive Growth (Viral/Partnership)

| Month | Free | Personal ($9.99) | Ministry ($29.99) | Church ($99.99) | Enterprise | MRR |
|-------|------|------------------|-------------------|-----------------|------------|-----|
| 1 | 500 | 30 | 15 | 5 | 0 | $1,250 |
| 3 | 3,000 | 200 | 100 | 25 | 2 | $6,400 |
| 6 | 10,000 | 600 | 350 | 80 | 5 | $25,500 |
| 12 | 30,000 | 2,000 | 1,000 | 250 | 15 | $80,000 |

**Year 1 Summary (Aggressive):**
- Total Revenue: ~$450,000
- Variable Costs (~47% of revenue): ~$210,000
- Fixed Costs: ~$15,000
- **Net Profit: ~$225,000**

---

## Unit Economics (Final Pricing) {#unit-economics-final}

### Usage Assumptions (70% of limit utilization)

| Tier | Sessions Used | Avg Participants | Avg Duration | Participant-Min |
|------|---------------|------------------|--------------|-----------------|
| Free | 1.4/mo | 4 | 25 min | 140 |
| Personal | 5.6/mo | 6 | 35 min | 1,176 |
| Ministry | 8.4/mo | 10 | 40 min | 3,360 |
| Church | 14/mo | 16 | 45 min | 10,080 |

### Variable Cost Calculation (Final Tiers)

**Free ($0/mo):**
- Video: 140 min × $0.004 = $0.56
- *Offset by Daily.co free tier (10K/mo shared across free users)*
- **Net cost to platform: ~$0**

**Personal ($9.99/mo):**
- Video: 1,176 min × $0.004 = $4.70
- Recording: None included
- AI: None included
- **Total Variable: $4.70**
- **Gross Profit: $5.29 (53%)**

**Ministry ($29.99/mo):**
- Video: 3,360 min × $0.004 = $13.44
- AI Summaries: 8.4 × $0.02 = $0.17
- Recording add-on (if purchased): 8.4 × $0.50 = $4.20 revenue - $3.38 cost = $0.82 profit
- **Total Variable: $13.61**
- **Gross Profit: $16.38 (55%)**

**Church ($99.99/mo):**
- Video: 10,080 min × $0.004 = $40.32
- Recording: 14 × 45 × $0.01349 = $8.50
- AI Summaries: 14 × $0.02 = $0.28
- **Total Variable: $49.10**
- **Gross Profit: $50.89 (51%)**

**Enterprise ($199/mo base + overage):**
- Base includes 30K participant-minutes worth $120
- Base gross profit: $199 - $120 = $79 (40% margin on base)
- Overage at $4.50/1K min vs $4.00 cost = 12.5% margin
- Captions: Extra $2.58/1K min, charged at $3.00/1K min
- **Blended margin: ~35-40%**

### Unit Economics Summary

| Tier | Revenue | Variable Cost | Gross Profit | Margin % |
|------|---------|---------------|--------------|----------|
| Free | $0 | ~$0 | $0 | N/A |
| Personal | $9.99 | $4.70 | **+$5.29** | 53% |
| Ministry | $29.99 | $13.61 | **+$16.38** | 55% |
| Church | $99.99 | $49.10 | **+$50.89** | 51% |
| Enterprise | $199+ | Variable | **+$79+** | 35-40% |

### Key Insight: Small Groups = Profitability

The pricing model works because we **cap participant counts**:
- Personal: 8 max (vs 25+ for competitors)
- Ministry: 12 max
- Church: 20 max

This keeps video costs predictable. Large group features require Enterprise tier with usage-based pricing.

---

## Break-Even Analysis {#break-even-analysis}

### Gross Profit per Customer

Based on the unit economics calculated above:

| Tier | Revenue | Variable Cost | Gross Profit |
|------|---------|---------------|--------------|
| Personal | $9.99/mo | $4.70 | **$5.29/mo** |
| Ministry | $29.99/mo | $13.61 | **$16.38/mo** |
| Church | $99.99/mo | $49.10 | **$50.89/mo** |

### Fixed Costs to Cover

| Fixed Costs | Required Gross Profit | Example Subscriber Mix |
|-------------|----------------------|------------------------|
| $200/mo (MVP) | $200 | 15 Personal + 5 Ministry |
| $500/mo (Growing) | $500 | 30 Personal + 15 Ministry + 2 Church |
| $1,000/mo (Scale) | $1,000 | 50 Personal + 35 Ministry + 5 Church |

### Time to Break-Even (Moderate Growth)

| Milestone | Paid Subscribers | Monthly Profit | Timeline |
|-----------|------------------|----------------|----------|
| Cover $200 fixed | ~25 | ~$0 | Month 2 |
| Cover $500 fixed | ~60 | ~$0 | Month 4-5 |
| $500/mo profit | ~100 | ~$500 | Month 6-7 |
| $2,000/mo profit | ~250 | ~$2,000 | Month 10-12 |

---

## Cash Flow Projections {#cash-flow-projections}

### Year 1 Monthly Cash Flow (Final Pricing - Moderate Scenario)

*Assumes ~53% blended gross margin based on tier mix (weighted avg of 53%/55%/51%)*

| Month | Paid Subs | MRR | Gross Profit (53%) | Fixed Costs | Net Cash Flow | Cumulative |
|-------|-----------|-----|--------------------| ------------|---------------|------------|
| 1 | 13 | $350 | $186 | $200 | -$14 | -$14 |
| 2 | 28 | $750 | $398 | $200 | +$198 | +$184 |
| 3 | 45 | $1,200 | $636 | $250 | +$386 | +$570 |
| 4 | 68 | $1,800 | $954 | $250 | +$704 | +$1,274 |
| 5 | 95 | $2,500 | $1,325 | $300 | +$1,025 | +$2,299 |
| 6 | 130 | $3,400 | $1,802 | $300 | +$1,502 | +$3,801 |
| 7 | 175 | $4,600 | $2,438 | $350 | +$2,088 | +$5,889 |
| 8 | 225 | $5,900 | $3,127 | $350 | +$2,777 | +$8,666 |
| 9 | 285 | $7,500 | $3,975 | $400 | +$3,575 | +$12,241 |
| 10 | 350 | $9,200 | $4,876 | $400 | +$4,476 | +$16,717 |
| 11 | 430 | $11,300 | $5,989 | $450 | +$5,539 | +$22,256 |
| 12 | 520 | $13,800 | $7,314 | $450 | +$6,864 | +$29,120 |

**Year 1 Summary (Final Pricing):**
- Total Revenue: ~$62,000
- Variable Costs (47%): ~$29,000
- Fixed Costs: ~$4,000
- **Net Profit: ~$29,000**
- Break-even: Month 2

---

## Key Metrics & Unit Economics {#unit-economics}

### Target Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| **CAC (Customer Acquisition Cost)** | <$20 | Organic/referral focused |
| **LTV (Lifetime Value)** | >$100 | 8-10 month avg retention |
| **LTV:CAC Ratio** | >5:1 | Healthy SaaS benchmark |
| **Gross Margin** | >40% | After variable costs |
| **Monthly Churn** | <8% | Industry avg 5-10% |
| **Net Revenue Retention** | >100% | Upgrades offset churn |

### LTV Calculation (Final Pricing)

| Tier | Monthly Revenue | Avg Lifespan | LTV |
|------|-----------------|--------------|-----|
| Personal | $9.99 | 6 months | $60 |
| Ministry | $29.99 | 10 months | $300 |
| Church | $99.99 | 14 months | $1,400 |
| Enterprise | $199+ | 24 months | $5,000+ |

### Blended LTV (Weighted by expected mix)

| Tier | % of Paid | LTV | Weighted LTV |
|------|-----------|-----|--------------|
| Personal | 45% | $60 | $27 |
| Ministry | 35% | $300 | $105 |
| Church | 15% | $1,400 | $210 |
| Enterprise | 5% | $5,000 | $250 |
| **Blended** | 100% | | **$592** |

### Maximum CAC @ 5:1 LTV:CAC
- **Target CAC**: $592 ÷ 5 = **$118 max**
- **Conservative CAC**: $592 ÷ 8 = **$74 target**

This gives healthy CAC budget for paid acquisition if needed, but organic/referral should be prioritized.

---

## Recommendations

### Pricing Summary (Final)
- **Personal**: $9.99/mo - 8 sessions, 8 max participants, video only
- **Ministry**: $29.99/mo - 12 sessions, 12 max participants, +AI summaries
- **Church**: $99.99/mo - 20 sessions, 20 max participants, +recording
- **Enterprise**: $199+ usage-based - unlimited, captions, 100+ participants

### Cost Optimization
1. **Cap participant counts** - keeps video costs predictable
2. **Recording as add-on** for Ministry tier ($0.50/session) - reduces base cost
3. **Captions only for Enterprise** - expensive per-minute, justified at scale
4. **Limit recording storage** to 30-90 days - reduces ongoing storage costs
5. **Negotiate volume discounts** with Daily.co at 100K+ minutes/month

### Growth Strategy
1. **Free tier** as acquisition channel with strict limits (2 sessions, 5 ppl)
2. **Annual discounts** (17% off) to improve cash flow and reduce churn
3. **Referral program** - free month per referred paid subscriber
4. **Partnership with denominations** for Enterprise deals
5. **Cross-sell to Vagabond Bible Pro** users - warm leads

### Key Success Metrics
1. **50+ paid subscribers** by Month 3 (validates product-market fit)
2. **100 paid subscribers** by Month 6 (sustainable growth)
3. **<10% monthly churn** (healthy retention)
4. **>50% gross margin** on all tiers (profitable unit economics)

---

## Appendix: Pricing Comparison

### Competitor Pricing

| Competitor | Free Tier | Paid Starting | Enterprise |
|------------|-----------|---------------|------------|
| Zoom | 40 min, 100 ppl | $15.99/mo | Custom |
| Google Meet | 60 min, 100 ppl | $6/mo (Workspace) | Custom |
| Microsoft Teams | 60 min, 100 ppl | $4/mo (M365) | Custom |
| StreamYard | 20 hrs/mo | $20/mo | $39/mo |
| Riverside.fm | 2 hrs/mo | $15/mo | $24/mo |

**Key Insight**: Vagabond Live's unique Bible/AI features justify premium over commodity video platforms. Target $15-50/mo range for core tiers.

---

*Financial model prepared January 2026. Update quarterly with actual usage data.*
