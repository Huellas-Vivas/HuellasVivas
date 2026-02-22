"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DonationCard } from "@/components/home/DonationCard";
import { AnimalCategory, ANIMAL_CATEGORIES, mockPosts } from "@/lib/mock-data";

const POSTS_PER_PAGE = 6;

const HomePage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<AnimalCategory | "all">("all");
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  const filtered = mockPosts
    .filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const visiblePosts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => prev + POSTS_PER_PAGE);
    }
  }, [hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [loadMore]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold">Publicaciones</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(POSTS_PER_PAGE); }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => { setActiveCategory("all"); setVisibleCount(POSTS_PER_PAGE); }}
        >
          Todos
        </Button>
        {ANIMAL_CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={activeCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => { setActiveCategory(cat.value); setVisibleCount(POSTS_PER_PAGE); }}
            className="gap-1.5"
          >
            <cat.Icon className="h-4 w-4" />
            {cat.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No se encontraron publicaciones.
        </p>
      ) : (
        <>
        <div className="flex flex-col gap-5 max-w-2xl mx-auto">
            {visiblePosts.map((post, i) => (
              <DonationCard key={post.id} post={post} index={i} />
            ))}
          </div>
          {hasMore && (
            <div ref={loaderRef} className="flex justify-center py-8">
              <p className="text-sm text-muted-foreground">Cargando más...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;