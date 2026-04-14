# Saffron Cottage — Trade Program Dev Reference
**Project:** Shopify Trade Program Setup  
**Store:** Saffron Cottage Collection  
**Contact email:** saffroncottagecollection@gmail.com  
**Last updated:** April 2026

---

## Overview

A trade program for design professionals, giving approved members automatic 30% discount, priority printing, free samples, and dedicated support. Built entirely on native Shopify tools — no paid apps required.

**Customer-facing tag:** `trade`  
**Shopify plan required:** Basic or higher  
**Apps used:** Shopify Flow (free), Shopify Messaging/Email (free)

---

## Architecture

```
Customer tagged "trade"
        │
        ├──► Flow Workflow 1: Staff Notification
        │         └── Internal email to owner (saffroncottagecollection@gmail.com)
        │
        ├──► Customer joins segment: "Trade Program Members"
        │         └── Flow Workflow 2: Shopify Email automation fires
        │                   └── Trade welcome email sent to customer
        │
        └──► Automatic 30% discount applies at checkout
                  └── No code needed — segment-based, fires on login
```

---

## 1. Customer Tag

**Tag name:** `trade` *(lowercase, exact)*

Applied manually by store admin:
- Customers → open customer profile → Tags field → type `trade` → Save

This single tag triggers the entire program automatically.

---

## 2. Customer Segment

**Name:** Trade Program Members  
**Location:** Customers → Segments  

**Query:**
```sql
FROM customers
SHOW customer_name, note, email_subscription_status, location, orders, amount_spent
WHERE customer_tags CONTAINS 'trade'
ORDER BY updated_at
```

Auto-populates when `trade` tag is added to any customer profile.  
Used as the trigger for the welcome email automation and the discount.

---

## 3. Shopify Flow — Staff Notification Workflow

**Name:** Trade Program — Staff Notification  
**Status:** On  
**Location:** Apps → Flow

### Trigger
- **Customer tags added** (Shopify trigger)

### Condition
- IF: Tags item `equal to` → `trade`

### Action
- **Send internal email** (Flow action)
- **To:** `saffroncottagecollection@gmail.com`
- **Subject:** `New Trade Member —` [variable: customer.firstName] [variable: customer.lastName]
- **Message:**
```
Trade account approved for:
[customer.firstName] [customer.lastName]
[customer.email]

Their welcome email has been sent automatically.
No further action needed — they're all set!
```

> ⚠️ Variables must be inserted using the "Add variable" button — do NOT type them manually or they will render as literal text.

> ⚠️ After any edits, click "Apply changes" AND verify the workflow is toggled On.

---

## 4. Shopify Email — Customer Welcome Automation

**Location:** Marketing → Automations  
**Trigger:** Customer joined segment → Trade Program Members

### Email Details
- **Template:** VIP (customized)
- **Subject:** `You're in — Welcome to the Trade Program`
- **Sender:** `saffroncottagecollection@gmail.com`

### Email Body Content
```
SAFFRON COTTAGE
TRADE ACCESS

Your trade account is approved and ready.
You now have access to exclusive trade pricing
and benefits on every order.

YOUR TRADE BENEFITS

✦ 30% Trade Discount
✦ 2-Day Printing
✦ Unlimited Free Custom Samples
✦ Trade Directory Listing
✦ Dedicated Support
✦ Commercial Materials

Log in to your account — your pricing
applies automatically at checkout.

[SHOP TRADE PRICING] — button linked to store URL
```

> ⚠️ This automation only sends to customers **subscribed to email marketing**.  
> Customers not subscribed will not receive the welcome email.  
> Consider adding a note in the approval process to ensure marketing opt-in.

---

## 5. Automatic Discount

**Type:** Automatic discount — Amount off order  
**Value:** 30%  
**Eligibility:** Segment — Trade Program Members  
**Discount code:** None required  

Applies automatically at checkout when a trade-tagged customer is logged in.  
No action needed from customer or staff.

---

## 6. Email Setup

**Current sender:** `saffroncottagecollection@gmail.com`  

> ⚠️ Gmail addresses may display as `via shopifyemail.com` in recipient inboxes due to  
> Gmail/Yahoo authentication requirements introduced February 2024.

### Recommended Upgrade Path
Set up **Zoho Mail** (free up to 5 users) with a custom domain:

1. Purchase/confirm domain (e.g. `saffroncottagecollection.com`)
2. Create account at zoho.com/mail
3. In Shopify: Settings → Domains → Email hosting → Connect Zoho
4. Add DNS/MX records as instructed
5. Update sender email: Settings → Notifications → Sender email

Shopify directly supports Zoho Mail and Google Workspace integrations.  
DNS propagation can take up to 48 hours.

---

## 7. End-to-End Flow (Live Process)

| Step | Who | Action |
|------|-----|--------|
| 1 | Customer | Requests trade access (email, form, or in person) |
| 2 | Owner | Reviews and approves |
| 3 | Owner | Adds `trade` tag to customer profile in Shopify admin |
| 4 | Flow | Sends staff notification email to owner instantly |
| 5 | Shopify Email | Sends trade welcome email to customer automatically |
| 6 | Customer | Logs in → 30% discount applies automatically at checkout |

---

## 8. Remaining To-Dos

- [x] **Trade landing page** — public-facing page explaining program benefits and how to apply → https://saffroncottage.shop/pages/trade
- [x] **Trade application form** — uses existing Contact page; CTA buttons pass `?subject=Trade Program Membership` to prefill the message body
- [ ] **Zoho Mail setup** — replace Gmail with branded domain email
- [ ] **Sender email update** — Settings → Notifications → update once Zoho is live
- [ ] **Marketing opt-in** — ensure trade applicants subscribe to email marketing so welcome email fires
- [ ] **Test full flow** — remove/re-add `trade` tag on a subscribed test account to verify all 3 automations fire correctly

---

## 9. Key Shopify Locations Quick Reference

| Task | Location |
|------|----------|
| Add trade tag to customer | Customers → [customer profile] → Tags |
| View trade members | Customers → Segments → Trade Program Members |
| Edit Flow workflows | Apps → Flow |
| Edit welcome email | Marketing → Automations |
| Edit discount | Discounts → [Trade discount] |
| Update sender email | Settings → Notifications → Sender email |
| Set up email hosting | Settings → Domains → [domain] → Email hosting |

---

## 10. Useful URLs

| Resource | URL |
|----------|-----|
| Shopify Help Center | help.shopify.com |
| Shopify Developer Docs | shopify.dev/docs |
| Shopify Flow Reference | help.shopify.com/en/manual/shopify-flow |
| Shopify Email Docs | help.shopify.com/en/manual/shopify-email |
| Zoho Mail | zoho.com/mail |

---

*Built with Shopify Flow + Shopify Messaging. No third-party paid apps required.*
