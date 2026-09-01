import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type SiteSettings = Tables<"site_settings">;
export type Service = Tables<"services">;
export type Product = Tables<"products">;

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async (): Promise<SiteSettings> => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    if (error) throw error;
    return data;
  },
});

export const servicesQuery = queryOptions({
  queryKey: ["services", "visible"],
  queryFn: async (): Promise<Service[]> => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("visible", true)
      .order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products", "visible", "top"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("visible", true)
      .is("parent_id", null)
      .order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const childProductsQuery = (parentId: string) =>
  queryOptions({
    queryKey: ["products", "children", parentId],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("visible", true)
        .eq("parent_id", parentId)
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });

export const childCountsQuery = queryOptions({
  queryKey: ["products", "child-counts"],
  queryFn: async (): Promise<Record<string, number>> => {
    const { data, error } = await supabase
      .from("products")
      .select("parent_id")
      .eq("visible", true)
      .not("parent_id", "is", null);
    if (error) throw error;
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      if (row.parent_id) counts[row.parent_id] = (counts[row.parent_id] ?? 0) + 1;
    }
    return counts;
  },
});

export const placementLabel = (placement: string) =>
  placement === "indoor"
    ? "Indoor"
    : placement === "outdoor"
      ? "Outdoor"
      : placement === "both"
        ? "Indoor & outdoor"
        : "";


export const allServicesQuery = queryOptions({
  queryKey: ["services", "all"],
  queryFn: async (): Promise<Service[]> => {
    const { data, error } = await supabase.from("services").select("*").order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const allProductsQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from("products").select("*").order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const digits = (value: string) => value.replace(/[^\d+]/g, "").replace(/^\+/, "");

export const whatsappLink = (whatsapp: string, message?: string) =>
  `https://wa.me/${digits(whatsapp)}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const LOGO_SRC = "/images/logo.jpg";

export type Tip = Tables<"tips">;

export const tipsQuery = queryOptions({
  queryKey: ["tips", "visible"],
  queryFn: async (): Promise<Tip[]> => {
    const { data, error } = await supabase
      .from("tips")
      .select("*")
      .eq("visible", true)
      .order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const allTipsQuery = queryOptions({
  queryKey: ["tips", "all"],
  queryFn: async (): Promise<Tip[]> => {
    const { data, error } = await supabase.from("tips").select("*").order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("visible", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
