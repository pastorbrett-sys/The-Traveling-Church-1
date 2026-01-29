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

### White-Label Enterprise (Megachurches)

Custom-branded platform sold to megachurches (2,000+ members).

| Contract Size | Annual Price | What's Included | Target Count |
|---------------|--------------|-----------------|--------------|
| Mid-size (2K-5K members) | $8,000/yr | White-label, 10 hosts, basic support | Y1: 0, Y2: 1 |
| Large (5K-15K members) | $18,000/yr | Full branding, 25 hosts, priority support | Y1: 1, Y2: 2 |
| Mega (15K+ members) | $36,000/yr | Unlimited hosts, integrations, dedicated CSM | Y1: 0, Y2: 1 |

**White-Label Revenue Projection:**
- Year 1: 1 large church = **$18,000**
- Year 2: 1 mid + 2 large + 1 mega = **$80,000**

*Cost to serve: ~30% (infrastructure, support) → 70% gross margin*

---

### Donation Processing (Rev Share)

Stripe Connect integration allows donations during/after Bible studies. Churches get convenience, we take a platform fee.

| Donation Volume | Our Fee | Church Keeps | Notes |
|-----------------|---------|--------------|-------|
| $0-$10K/mo | 3% | 97% - Stripe fees | Competitive with Tithe.ly |
| $10K-$50K/mo | 2.5% | 97.5% - Stripe fees | Volume discount |
| $50K+/mo | 2% | 98% - Stripe fees | Enterprise negotiated |

**Donation Revenue Projection:**

Assumptions:
- 20% of paid subscribers enable donations
- Average $50/session donated per active study (highly engaged groups)
- 4 sessions/month average

| Year | Active Donation Groups | Donations Processed | Platform Fee (2.5%) |
|------|------------------------|--------------------|--------------------|
| Y1 | 50 groups | $120,000 | **$3,000** |
| Y2 | 200 groups | $480,000 | **$12,000** |
| Y3 | 500 groups | $1,200,000 | **$30,000** |

*Near 100% margin - Stripe handles all processing*

---

### Data & Analytics Revenue

Anonymized, aggregate insights sold to Christian organizations. **Privacy-first**: no individual data, only trends.

| Product | Buyer | Price | Frequency |
|---------|-------|-------|-----------|
| **Trending Topics Report** | Publishers, seminaries | $500-2,000/report | Quarterly |
| **Engagement Benchmarks** | Denominations | $5,000-15,000/yr | Annual subscription |
| **Research Partnerships** | Seminaries, Barna Group | $10,000-25,000 | Per study |

**Data Revenue Projection:**

| Year | Products Sold | Revenue |
|------|---------------|---------|
| Y1 | 2 quarterly reports | **$2,000** |
| Y2 | 4 reports + 1 benchmark sub | **$12,000** |
| Y3 | 8 reports + 3 subs + 1 research | **$45,000** |

*90%+ margin - data already collected, minimal incremental cost*

---

### Combined Revenue & Profit Summary

| Revenue Stream | Y1 Rev | Y1 Profit | Y2 Rev | Y2 Profit | Y3 Rev | Y3 Profit | Margin |
|----------------|--------|-----------|--------|-----------|--------|-----------|--------|
| **Subscriptions** | $62,000 | $33,000 | $180,000 | $95,000 | $400,000 | $212,000 | 53% |
| **White-Label** | $18,000 | $12,600 | $80,000 | $56,000 | $150,000 | $105,000 | 70% |
| **Donation Fees** | $3,000 | $2,850 | $12,000 | $11,400 | $30,000 | $28,500 | 95% |
| **Data Sales** | $2,000 | $1,800 | $12,000 | $10,800 | $45,000 | $40,500 | 90% |
| **GROSS PROFIT** | $85,000 | **$50,250** | $284,000 | **$173,200** | $625,000 | **$386,000** | ~60% |

### Net Profit After Operating Costs

| Year | Gross Profit | Fixed Costs | Marketing/Sales | **Net Profit** | Net Margin |
|------|--------------|-------------|-----------------|----------------|------------|
| **Y1** | $50,250 | $6,000 | $10,000 | **$34,250** | 40% |
| **Y2** | $173,200 | $15,000 | $30,000 | **$128,200** | 45% |
| **Y3** | $386,000 | $25,000 | $60,000 | **$301,000** | 48% |

### Additional Revenue Streams (Minor)

| Stream | Rate | Projected % of Revenue |
|--------|------|------------------------|
| Recording Add-on (Personal/Ministry) | $0.50/session | 3-5% |
| Storage Overage | $0.10/GB over limit | 1-2% |
| Pay-per-session (future) | $1.99/session | 5-10% |

---

## Scenario Projections {#scenario-projections}

### Diversified Revenue Model (Recommended)

This model combines all four revenue streams for realistic projections.

#### Year 1 - Launch & Validate

| Revenue Stream | Q1 | Q2 | Q3 | Q4 | Y1 Total |
|----------------|----|----|----|----|----------|
| **Subscriptions** | $2,000 | $8,000 | $20,000 | $32,000 | $62,000 |
| **White-Label** (1 large church Q3) | $0 | $0 | $9,000 | $9,000 | $18,000 |
| **Donation Fees** | $200 | $500 | $1,000 | $1,300 | $3,000 |
| **Data Sales** | $0 | $500 | $500 | $1,000 | $2,000 |
| **TOTAL** | $2,200 | $9,000 | $30,500 | $43,300 | **$85,000** |

**Y1 Costs & Profit:**
| Category | Amount | Notes |
|----------|--------|-------|
| Variable Costs | $33,000 | 53% of subscriptions, 30% of white-label |
| Fixed Costs | $6,000 | Infrastructure, support tools |
| **Gross Profit** | $46,000 | 54% margin |
| Marketing/Sales | $10,000 | Church conferences, ads |
| **Net Profit** | **$36,000** | 42% net margin |

#### Year 2 - Scale & Enterprise Focus

| Revenue Stream | Q1 | Q2 | Q3 | Q4 | Y2 Total |
|----------------|----|----|----|----|----------|
| **Subscriptions** | $38,000 | $42,000 | $48,000 | $52,000 | $180,000 |
| **White-Label** (4 churches) | $15,000 | $20,000 | $22,000 | $23,000 | $80,000 |
| **Donation Fees** | $2,000 | $3,000 | $3,500 | $3,500 | $12,000 |
| **Data Sales** | $2,000 | $3,000 | $3,500 | $3,500 | $12,000 |
| **TOTAL** | $57,000 | $68,000 | $77,000 | $82,000 | **$284,000** |

**Y2 Costs & Profit:**
| Category | Amount | Notes |
|----------|--------|-------|
| Variable Costs | $119,000 | Scales with usage |
| Fixed Costs | $15,000 | Team growth |
| **Gross Profit** | $150,000 | 53% margin |
| Marketing/Sales | $30,000 | Dedicated sales for enterprise |
| **Net Profit** | **$120,000** | 42% net margin |

#### Year 3 - Market Leadership

| Revenue Stream | Y3 Total | Notes |
|----------------|----------|-------|
| **Subscriptions** | $400,000 | ~2,000 paid subscribers |
| **White-Label** | $150,000 | 8-10 megachurches |
| **Donation Fees** | $30,000 | $1.2M processed |
| **Data Sales** | $45,000 | Research partnerships |
| **TOTAL** | **$625,000** | |

**Y3 Net Profit: ~$250,000** (40% net margin)

---

### Subscription-Only Projections (For Reference)

#### Scenario A: Conservative (Slow Growth)

| Month | Free | Personal ($9.99) | Ministry ($29.99) | Church ($99.99) | MRR |
|-------|------|------------------|-------------------|-----------------|-----|
| 1 | 50 | 3 | 2 | 0 | $90 |
| 3 | 150 | 15 | 8 | 2 | $590 |
| 6 | 400 | 40 | 20 | 5 | $1,500 |
| 12 | 1,000 | 100 | 60 | 15 | $4,300 |

**Year 1 Summary (Conservative, Subs Only):**
- Subscription Revenue: ~$25,000
- Variable Costs (~47%): ~$12,000
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

**Year 1 Summary (Moderate, Subs Only):**
- Subscription Revenue: ~$62,000
- Variable Costs (~47%): ~$29,000
- Fixed Costs: ~$6,000
- **Net Profit: ~$27,000**

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

### Business Model Summary

**4-Stream Revenue & Profit:**

| Stream | Y1 Rev | Y1 Profit | Y2 Rev | Y2 Profit | Y3 Rev | Y3 Profit |
|--------|--------|-----------|--------|-----------|--------|-----------|
| Subscriptions | $62K | $33K | $180K | $95K | $400K | $212K |
| White-Label | $18K | $13K | $80K | $56K | $150K | $105K |
| Donations | $3K | $3K | $12K | $11K | $30K | $29K |
| Data | $2K | $2K | $12K | $11K | $45K | $41K |
| **TOTAL** | **$85K** | **$51K** | **$284K** | **$173K** | **$625K** | **$387K** |

**Net Profit (after fixed + marketing):**
- **Y1: $34K** (40% net margin)
- **Y2: $128K** (45% net margin)
- **Y3: $301K** (48% net margin)

### Go-To-Market Strategy

**Phase 1: MVP with Small Groups (Months 1-6)**
1. Test with existing Vagabond Bible Pro users
2. Focus on Personal & Ministry tiers
3. Gather testimonials, usage data, case studies
4. Iterate on Bible integration and AI features

**Phase 2: Enterprise Sales (Months 6-12)**
1. Land first megachurch white-label deal (Q3 target)
2. Build case study from successful small groups
3. Attend church tech conferences (e.g., SALT, Insiders)
4. Partner with church tech consultants

**Phase 3: Scale All Streams (Year 2+)**
1. Expand white-label to 4+ megachurches
2. Launch donation processing for all paid tiers
3. Sell first data/analytics reports
4. Build denomination partnerships

### Pricing Summary

| Tier | Price | Target Customer |
|------|-------|-----------------|
| **Free** | $0 | Leads, evaluation |
| **Personal** | $9.99/mo | Individual leaders |
| **Ministry** | $29.99/mo | Home churches |
| **Church** | $99.99/mo | Growing churches |
| **White-Label** | $8K-36K/yr | Megachurches (2K+ members) |

### Key Success Metrics

**Year 1 Targets:**
- 200+ paid subscribers by Month 6
- 500+ paid subscribers by Month 12
- 1 white-label enterprise deal by Q3
- <10% monthly churn
- >50% blended gross margin

**Year 2 Targets:**
- 1,000+ paid subscribers
- 4 white-label deals totaling $80K ARR
- $1M+ in donation volume processed
- First data partnership ($10K+)

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
