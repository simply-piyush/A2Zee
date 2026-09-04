# Figma Design System & Node Mapping Specifications
## Project: A2Zee (SahakarSeva Cooperative Gig Platform)
**Figma File Key:** `pCxLJ7xeWPg0NnRltW8aH9`  
**Dev Mode Link:** [https://www.figma.com/design/pCxLJ7xeWPg0NnRltW8aH9/A2Zee?node-id=0-1&m=dev&t=vpkclAeawdnhHG12-1](https://www.figma.com/design/pCxLJ7xeWPg0NnRltW8aH9/A2Zee?node-id=0-1&m=dev&t=vpkclAeawdnhHG12-1)  
**Last Synchronized:** 2026-09-03 via Figma REST API & MCP Server

---

## 1. Verified Screen & Frame Inventory

| Screen Name | Node ID | Frame Dimensions | Key Elements & Layout Specifications |
| :--- | :--- | :--- | :--- |
| **Login** | `2:2` | 402 × 874 | Phone authentication, OTP input, cooperative member / customer sign-in. |
| **User Homepage** | `3:68` | 402 × 874 | Location selector (*"Madhyamgram..."*), Search bar (*"Search for Jobs"*), Service Category chips (*househelp, carpenter, cleaning, plumbing*), Popular Services carousel, Bottom Navigation (*Home, Cart, Search, Reorder, Profile*). |
| **Search Jobs** | `5:129` | 402 × 874 | Service catalog browsing, filter by trade, pre-specified tasks with base tariffs. |
| **Create Job (Instant)** | `46:248` | 402 × 874 | Toggle: **Instant** vs. **Timely**, Custom Job Description entry (*supports user-defined custom problems*), *"Search for Expert"* button. |
| **Create Job (Timely)** | `49:327` | 402 × 874 | Scheduled date & time slot picker, recurring booking options. |
| **Track Expert / Arriving** | `89:49` | 402 × 874 | Live Map view, ETA (*"Arriving BY 9:15 am"*), Assigned Worker Card (*Name, Cooperative Society affiliation*), Job scope reminder. |
| **User Bill & Payment** | `89:105` | 402 × 874 | **Header:** *"Bill Payment"*, **Summary:** Service Fee (₹250), **Extra Time Fee (₹15)**, GST (₹10), Total (₹275), **Gratitude Corner (Tip/Welfare pool):** ₹5, ₹10, ₹20, ₹50, Action: **"Proceed to Payment"**. |

---

## 2. Design System Tokens & Typography (Extracted)

### Typography
- **Headings & Accents:** `Rubik Mono One` (16px, Uppercase tracking)
- **Body & Numerical Values:** `Inter` (Regular, Medium, SemiBold, 16px / 14px)

### Bill Breakdown Structure (Node `89:105`)
Matches the cooperative 85-10-5 model and mid-work extra charges architecture:
- `Service fee`: Scheduled base tariff or agreed diagnosis quote
- `Extra Time Fee`: Customer-approved mid-work time overrun charge
- `Gst`: Government concession tax
- `Gratitude corner`: Voluntary contribution routed to worker welfare & tips
- `Proceed to Payment`: Mock payment trigger updating booking status to `PAID`

---

## 3. Configuration & Authentication
Configured in:
- [`.env`](file:///Users/piyush/Documents/CODE/sih2026/.env)
- [`.agents/mcp_config.json`](file:///Users/piyush/Documents/CODE/sih2026/.agents/mcp_config.json)
- [`mcp_config.json`](file:///Users/piyush/Documents/CODE/sih2026/mcp_config.json)
