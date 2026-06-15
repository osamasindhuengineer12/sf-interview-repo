# Issues & Fixes

## Task 1 — App Access & Bid Validation

**Issue:** Farm Auction app/tab not visible; permission set incomplete and not assigned.  
**Fix:** Added app visibility, set tab to `Visible`, auto-assign permset in setup. Skipped FLS on required fields (not allowed by Salesforce — object read access covers them).

**Issue:** Valid bids rejected; low/equal bids accepted.  
**Fix:** Flipped check in `BidController` from `amount >= threshold` to `amount <= threshold`.

---

## Task 2 — Search & Category Filter

**Issue:** Search and category UI did nothing — Apex returned all listings.  
**Fix:** Wired filters from LWC to `getListings()`. Category filtered in SOQL; title/description filtered in Apex (`Description__c` is Long Text Area — not filterable in SOQL).

---

## Task 3 — Bid History

**Issue:** Bids not saved; no history shown.  
**Fix:** Insert `Bid__c` on each bid, added `getBidHistory()`, built history UI with highest bid highlighted. Fixed `placeBid` to return bid Id (not listing Id).

---

## Testing — Listing Selection

**Issue:** Clicking another listing did not update the detail panel.  
**Fix:** Renamed event `select` → `listingselect`; remount detail on switch; guard against stale async loads; reset bid form; highlight selected card.

---

## Testing — Listing Images

**Issue:** External image URLs blocked by browser CORS / CSP in Lightning.  
**Fix:** Added image host to **CORS Allowlist** and **Trusted URLs** in Setup (Session Settings / CSP Trusted Sites).

---


| Area | Fix in one line |
|------|-----------------|
| 1A | Permission set + assign script |
| 1B | Bid validation operator |
| 2 | Server-side search + category filter |
| 3 | Bid persistence + history UI |
| Images | CORS + Trusted URL config |
| Selection | Event rename + detail remount |
