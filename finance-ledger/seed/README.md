# Seed data

`inventory.csv` — current stock, one row per physical unit (86 rows).

Load it from **Import → Inventory** in the app, then drop the file in.
Cost and list price are blank (imported as £0) — fill them in per item from
the Inventory screen once you've priced them.

| Column | Notes |
| --- | --- |
| `name` | Required. Rows without a name are skipped. |
| `purchasePrice` / `listPrice` | Blank → 0 |
| `qty` | Blank → 1 |
| `platform` | eBay / Vinted / Facebook / In-Person / Other (unknown → Other) |
| `status` | InStock / Listed / Sold (unknown → InStock) |
| `category` | Free text, shown on the item card |
| `notes` | Free text |

Importing appends — running it twice creates duplicates.
