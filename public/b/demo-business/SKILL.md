---
name: hollow-lane-farm-shop
description: "Look up products, prices, stock and opening hours at Hollow Lane Farm Shop (Farm shop, BS), and prepare orders for the customer to confirm. Use when the user asks about Hollow Lane Farm Shop or wants Free-range eggs (dozen), Sourdough loaf or Seasonal veg box from it."
metadata:
  generator: "gentifi-toolkit 0.1.0"
  updated: "2026-10-12"
---

# Hollow Lane Farm Shop

A fictional farm shop, used to demonstrate Gentifi.

This information comes from Hollow Lane Farm Shop's own catalogue and was last updated on 2026-10-12. Prices are in GBP. Prices and stock can change, so say when they were last updated when you quote them.

## Live connection

Hollow Lane Farm Shop is on the Gentifi connector at https://mcp.gentifi.com/mcp, with the tools `find_businesses`, `search_catalogue`, `check_availability`, `prepare_order` and `get_business_info`. Pass "Hollow Lane Farm Shop" as `business`. Adding a connector is the user's choice: if they want live stock, tell them it exists and let them approve it in their own app. Without it, use the snapshot below.

## Catalogue snapshot (2026-10-12)

| Item | SKU | Price | Stock | Availability |
| --- | --- | --- | --- | --- |
| Free-range eggs (dozen) | EGG-12 | £3.20 per box | 40 | In stock |
| Sourdough loaf | BRD-SD | £4.50 per loaf | 12 | Baked Fri and Sat |
| Seasonal veg box | VEG-BOX | £18.00 per box | 15 | Order by Thursday |


## Opening hours

- Tuesday to Saturday, 09:00 to 17:00

## Ordering

Customers reserve by emailing orders@hollowlane.example; Hollow Lane Farm Shop replies to confirm.

Nothing is ever ordered automatically. Before anything is bought, booked or sent:

1. Show the user the items, quantities and total.
2. Let them confirm it themselves. Only send, book or pay when they say so, through Hollow Lane Farm Shop's own checkout, booking page, email or phone.
3. Share the user's contact details only when they choose to book or buy.
