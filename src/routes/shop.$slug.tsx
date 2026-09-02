import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProductQuickView, type QuickViewItem } from "@/components/site/ProductQuickView";
import {
  productQuery,
  productsQuery,
  servicesQuery,
  settingsQuery,
  whatsappLink,
} from "@/lib/site-data";


export const Route = createFileRoute("/shop/$slug")({
  loader: async ({ context, params }) => {
    const [product] = await Promise.all([
      context.queryClient.ensureQueryData(productQuery(params.slug)),
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(productsQuery),
    ]);
    if (!product) throw notFound();
    return {
      name: product.name,
      description: product.description,
      image: product.image_url,
      slug: product.slug,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} | Shop — G Modern Creativity Ltd`;
    const description =
      loaderData.description || `${loaderData.name} from G Modern Creativity Ltd, delivered across Rwanda.`;
    const url = `/shop/${loaderData.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(slug));
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);

  const gallery = product
    ? [product.image_url, ...(product.gallery ?? [])].filter(Boolean)
    : [];
  const lightbox = useLightbox(gallery.length);

  if (!product) return null;
  const others = products.filter((p) => p.slug !== product.slug).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader settings={settings} />

      <section className="mx-auto max-w-6xl px-5 py-12">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <button
              type="button"
              onClick={() => lightbox.open(0)}
              aria-label={`Open ${product.name} photo`}
              className="block w-full overflow-hidden rounded-2xl shadow-[var(--shadow-soft)]"
            >
              <img
                src={gallery[0]}
                alt={product.name}
                width={1200}
                height={912}
                className="h-72 w-full object-cover sm:h-96"
              />
            </button>
            {gallery.length > 1 ? (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {gallery.slice(1).map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => lightbox.open(i + 1)}
                    aria-label={`Open ${product.name} photo ${i + 2}`}
                    className="overflow-hidden rounded-xl"
                  >
                    <img
                      src={src}
                      alt={`${product.name} photo ${i + 2}`}
                      loading="lazy"
                      width={1200}
                      height={912}
                      className="h-32 w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-40"
                    />
                  </button>
                ))}
              </div>
            ) : null}
            <ImageLightbox
              images={gallery}
              index={lightbox.index}
              alt={product.name}
              onClose={lightbox.close}
              onNext={lightbox.next}
              onPrev={lightbox.prev}
            />
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl">{product.name}</h1>
            <div className="rule-gold mt-4 max-w-[8rem]" />
            {product.price ? (
              <p className="mt-4 font-display text-xl text-leaf">{product.price}</p>
            ) : null}
            {product.description ? (
              <p className="mt-4 text-muted-foreground">{product.description}</p>
            ) : null}
            {product.details ? (
              <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
                {product.details}
              </p>
            ) : null}
            <p className="mt-4 text-xs text-muted-foreground">
              {product.available ? "Available" : "Currently out of stock"}
            </p>
            <a
              href={whatsappLink(
                settings.whatsapp,
                `Hello G Modern Creativity, I would like to order: ${product.name}`,
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              Make Your Order
            </a>
            <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
              <p>{settings.delivery_text}</p>
              <p className="mt-2">{settings.location_text}</p>
            </div>
          </div>
        </div>

        {others.length ? (
          <div className="mt-16">
            <h2 className="text-2xl">More from the shop</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {others.map((p) => (
                <Link
                  key={p.id}
                  to="/shop/$slug"
                  params={{ slug: p.slug }}
                  className="group overflow-hidden rounded-xl border border-border bg-card"
                >
                  <img
                    src={p.image_url}
                    alt={p.name}
                    loading="lazy"
                    width={1200}
                    height={912}
                    className="h-24 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-28"
                  />
                  <p className="px-2 py-2 text-xs">{p.name}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <SiteFooter settings={settings} services={services} />
    </div>
  );
}
