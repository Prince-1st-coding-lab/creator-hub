ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS parent_id uuid NULL REFERENCES public.products(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS size text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS material text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS placement text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS products_parent_id_idx ON public.products(parent_id);

INSERT INTO public.products (name, slug, description, details, price, image_url, size, material, placement, parent_id, position, visible, available)
SELECT v.name, v.slug, v.description, v.details, v.price, p.image_url, v.size, v.material, v.placement, p.id, v.position, true, true
FROM public.products p
CROSS JOIN (VALUES
  ('Small Clay Pot', 'small-clay-pot', 'Classic terracotta pot for desks, windows and small plants.', 'Hand finished clay pot with drainage hole. Ideal for succulents and small herbs.', '', '15cm x 13cm', 'Clay', 'indoor', 1),
  ('Medium Ceramic Pot', 'medium-ceramic-pot', 'Glazed ceramic pot that suits living rooms and offices.', 'Smooth glazed finish, wipe clean. Comes with a matching saucer on request.', '', '25cm x 22cm', 'Ceramic', 'indoor', 2),
  ('Large Ceramic Floor Pot', 'large-ceramic-floor-pot', 'Statement floor pot for tall indoor plants.', 'Heavy base for stability. Best for ficus, palms and monstera.', '', '40cm x 45cm', 'Ceramic', 'indoor', 3),
  ('Outdoor Concrete Pot', 'outdoor-concrete-pot', 'Weather resistant concrete pot for gardens and terraces.', 'Withstands sun and rain. Recommended for outdoor shrubs and flowering plants.', '', '35cm x 35cm', 'Concrete', 'outdoor', 4),
  ('Fiberglass Planter', 'fiberglass-planter', 'Lightweight planter that works indoors and outdoors.', 'Light enough to move easily, strong enough to stay outside all year.', '', '50cm x 40cm', 'Fiberglass', 'both', 5),
  ('Hanging Pot', 'hanging-pot', 'Hanging pot for balconies, patios and bright corners.', 'Includes hanging rope. Great for trailing plants.', '', '20cm x 18cm', 'Plastic', 'both', 6)
) AS v(name, slug, description, details, price, size, material, placement, position)
WHERE p.slug = 'pots'
  AND NOT EXISTS (SELECT 1 FROM public.products c WHERE c.slug = v.slug);