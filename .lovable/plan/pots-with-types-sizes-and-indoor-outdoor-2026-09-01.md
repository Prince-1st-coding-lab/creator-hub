# Pots with types, sizes and indoor/outdoor

Right now "Pots" is a single shop item with one photo and one price, so there is nowhere to express that a pot comes in different types, sizes, or is meant for indoors vs outdoors.

The fix: turn **Pots** into a small category. The Pots card in the shop opens a page listing each individual pot, and each pot gets its own page with its own photos, price, size, material and placement.

## What the visitor sees

```text
/shop                -> Pots (card, "6 options") | Vases | Flowers | Stands | Gifts
/shop/pots           -> grid of individual pots + filter chips
                        [All] [Indoor] [Outdoor]   [Clay] [Ceramic] [Plastic] ...
                        each card: photo, name, size, price, Indoor/Outdoor badge
/shop/pots/<a pot>   -> full page: gallery + lightbox, price, availability,
                        Size / Type / Best for rows, description,
                        "Make Your Order" WhatsApp button prefilled with
                        the exact pot name and size
```

Anything not set is simply hidden, so a pot without a stated material shows no material row.

## What the owner does in the admin

In **Shop**, each product keeps its current fields plus:

- **Belongs to** — leave empty for a normal shop item, or pick "Pots" to make it one of the pots.
- **Size / measurement** — free text, e.g. `30cm x 25cm` or `Large`.
- **Type / material** — free text, e.g. `Clay`, `Ceramic`, `Fiberglass`.
- **Best for** — Indoor / Outdoor / Both / not specified.

Adding a new pot is just "Add product", set Belongs to = Pots, fill the fields, tick Visible.

## Scope

Only Pots gets sub-items now, but the mechanism is generic, so later she can point Vases or Stands at the same setup without another rebuild.

## Technical notes

Database migration on `products`:

- `parent_id uuid null references public.products(id) on delete cascade`
- `size text not null default ''`
- `material text not null default ''`
- `placement text not null default ''` (`''` | `indoor` | `outdoor` | `both`)
- index on `parent_id`; existing RLS/grants already cover the table (no new table, so no new grants needed)
- seed 4-6 example pots as children of the existing Pots row (visible, editable) so the page is not empty

Frontend:

- `src/lib/site-data.ts`: shop listing query filters `parent_id is null`; add `childProductsQuery(parentId)`.
- `src/routes/shop.index.tsx`: unchanged layout; card shows an "N options" hint when a product has children.
- `src/routes/shop.$slug.tsx`: if the product has children, render the category view (intro text + filter chips driven by the children's `placement` / `material` values, client-side `useState` filtering); otherwise render today's detail view extended with Size / Type / Best for rows and a WhatsApp message that includes the size.
- Child pot pages reuse `/shop/$slug` (each pot has its own unique slug), so no new route file; "Back" on a child links to its parent.
- `src/routes/admin.tsx` `ProductsPanel`: add the Belongs to select (top-level products only), Size, Type/material, Best for select, and include them in save/insert.
- Types come from the regenerated Supabase types; head() metadata on the pots page and pot pages stays route-specific.
