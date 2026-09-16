import React from "react";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/products";
import { ProductDetailPageClient } from "@/components/product/ProductDetailPageClient";
import { ProductNotFound } from "@/components/product/ProductNotFound";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Piece Not Found | Nishya — Luxe Handbags",
      description: "The requested luxury creation could not be found.",
    };
  }

  return {
    title: `${product.name} | Nishya — Luxe Handbags & Purses`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Nishya Haute Maroquinerie`,
      description: product.description,
      images: [
        {
          url: product.image,
          width: 1200,
          height: 900,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return <ProductNotFound />;
  }

  const related = await getRelatedProducts(slug, 4);

  return <ProductDetailPageClient product={product} related={related} />;
}
