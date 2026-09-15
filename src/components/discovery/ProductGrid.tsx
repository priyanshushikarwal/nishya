import React from "react";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/discovery/ProductCard";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  className?: string;
  columns?: 3 | 4;
}

export function ProductGrid({
  products,
  className = "",
  columns = 4,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8",
        columns === 3 && "lg:grid-cols-3",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
