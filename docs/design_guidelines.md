# Design Guidelines: The Traveling Church

## Design Approach

**Strategy**: Reference-Based with spiritual/ministry focus, drawing inspiration from Airbnb's warmth and community-building aesthetics combined with Elevation Church and Hillsong's digital presence. The design emphasizes connection, authenticity, and accessibility.

**Core Principles**:
- Welcoming warmth through earthy, natural tones
- Visual storytelling through powerful imagery
- Clear pathways to community engagement
- Mobile-first responsive design

---

## Color Palette

**Primary Colors (Dark Mode)**:
- Background Base: 25 8% 12% (deep warm charcoal)
- Surface: 25 8% 18% (elevated warm gray)
- Primary Brand: 28 45% 55% (warm terracotta/clay)

**Primary Colors (Light Mode)**:
- Background Base: 40 25% 97% (warm off-white)
- Surface: 0 0% 100% (pure white cards)
- Primary Brand: 28 45% 48% (rich terracotta)

**Supporting Colors**:
- Accent Warm: 38 70% 60% (golden amber)
- Text Primary (Dark): 40 15% 92%
- Text Primary (Light): 25 15% 20%
- Text Secondary: 40 10% 65%

**Semantic Colors**:
- Success/WhatsApp: 142 76% 36% (WhatsApp green)
- Borders (Dark): 25 8% 25%
- Borders (Light): 40 15% 88%

---

## Typography

**Font Families** (via Google Fonts CDN):
- Headings: Playfair Display (400, 600, 700)
- Body: Poppins (400, 500, 600)

**Type Scale**:
- Hero Heading: text-5xl md:text-6xl lg:text-7xl font-bold
- Section Heading: text-3xl md:text-4xl lg:text-5xl font-semibold
- Card Heading: text-xl md:text-2xl font-semibold
- Body Large: text-lg md:text-xl
- Body Standard: text-base
- Caption: text-sm

**Font Styling**:
- Headings use Playfair Display with generous line-height (1.2)
- Body text uses Poppins with comfortable line-height (1.7)
- Letter-spacing: tight for headings, normal for body

---

## Layout System

**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 md:p-8
- Section padding: py-16 md:py-24 lg:py-32
- Card gaps: gap-6 md:gap-8
- Element spacing: space-y-4 md:space-y-6

**Container Strategy**:
- Max-width container: max-w-7xl mx-auto px-6 md:px-8
- Content sections: max-w-6xl
- Text content: max-w-3xl
- Grid layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

---

## Page Structure

**1. Hero Section** (80vh minimum):
- Full-width background image with warm overlay (25 40% 15% / 40% opacity)
- Centered content with max-w-4xl
- Large hero headline with Playfair Display
- Subheading with descriptive mission statement
- Dual CTA buttons (Primary: "Join Our Journey" + Secondary outline: "Learn More")
- Buttons on image use backdrop-blur-md with bg-white/10 (dark) or bg-black/20 (light)

**2. Mission Statement Section**:
- Two-column layout (md:grid-cols-2)
- Left: Compelling image of ministry work
- Right: Mission text with quote-style typography, warm border accent on left

**3. Ministry Focus Cards** (3-column grid):
- Icon placeholder comments with warm terracotta backgrounds
- Card titles with Playfair Display
- Short descriptions
- Subtle hover lift effect (hover:transform hover:scale-105)

**4. WhatsApp Community Section** (Featured):
- Centered content with max-w-4xl
- Large WhatsApp icon (Success green)
- Attention-grabbing headline: "Join Our Global Community"
- Descriptive text about community benefits
- Prominent CTA button with WhatsApp green background
- Member count indicator with small avatars
- Decorative warm gradient background overlay

**5. Impact/Statistics Section**:
- 4-column grid (grid-cols-2 lg:grid-cols-4)
- Large numbers with Playfair Display
- Descriptive labels
- Warm accent dividers

**6. Testimonials Section**:
- 2-column grid (md:grid-cols-2)
- Photo + quote cards with warm borders
- Names and locations
- Soft shadow elevation

**7. Events/Locations Section**:
- Horizontal scrollable cards on mobile
- 3-column grid on desktop
- Location images, dates, "Learn More" links

**8. Footer** (Rich):
- 4-column grid (Contact, Quick Links, Ministries, Newsletter)
- Newsletter signup with warm CTA
- Social media icons (Instagram, Facebook, YouTube, WhatsApp)
- Trust elements: "A registered non-profit ministry"
- Copyright and legal links

---

## Component Library

**Buttons**:
- Primary: bg-[primary] text-white px-8 py-4 rounded-full font-medium
- Secondary: border-2 border-[primary] text-[primary] px-8 py-4 rounded-full
- WhatsApp: bg-[success] text-white px-8 py-4 rounded-full with WhatsApp icon
- On images: backdrop-blur-md bg-white/10 border border-white/20

**Cards**:
- Background: Surface color with subtle shadow
- Border-radius: rounded-2xl
- Padding: p-6 md:p-8
- Hover: shadow-xl transition

**Forms**:
- Input fields: bg-surface border border-[borders] rounded-lg px-4 py-3
- Focus state: ring-2 ring-[primary]/50
- Labels: text-sm font-medium text-secondary

**Navigation**:
- Fixed header with backdrop-blur
- Logo left, menu items center/right
- Mobile: Hamburger menu with slide-in drawer
- Active state: warm underline accent

---

## Images Section

**Hero Image**: Large, inspiring image of ministry team with diverse community members in natural outdoor setting. Warm golden hour lighting. Position: Background cover with overlay.

**Mission Section Image**: Authentic photo of ministry team serving/connecting with local community. Warm, candid moment. Position: Left side of two-column layout.

**Ministry Cards**: Three distinct images - worship gathering, community service, teaching moment. Position: Card backgrounds or top of cards.

**Testimonial Photos**: Circular headshots of diverse community members with warm, genuine expressions. Position: Top-left of testimonial cards.

**Events Section**: Location-specific imagery showing ministry venues or gatherings. Position: Card backgrounds.

**Footer Decorative**: Subtle warm gradient or pattern overlay. Position: Footer background.

---

## Mobile Optimization

- Hero: Full viewport height maintained with scaled typography
- WhatsApp CTA: Sticky bottom bar on mobile (fixed bottom with safe-area-inset)
- Cards: Stack to single column with generous spacing
- Navigation: Full-screen mobile menu with large touch targets
- Images: Responsive with object-fit cover
- Buttons: Full-width on mobile (w-full sm:w-auto)