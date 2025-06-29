import { LazySection } from "@/components/layout/lazy-section"
import { SectionSkeleton } from "@/components/layout/section-skeleton"
import { LazySimpleSlider } from "@/components/home/lazy-simple-slider"
import { LazyBrandCarousel } from "@/components/layout/lazy-brand-carousel"
import { LazyProductGrid } from "@/components/layout/lazy-product-grid"
import { LazyFeatureCard } from "@/components/layout/lazy-feature-card"
import { LazyPromotionSection } from "@/components/layout/lazy-promotion-section"
import LazyCategorySection from "@/components/layout/lazy-category-section"
import LazyFeaturedCategories from "@/components/layout/lazy-featured-categories"
import CategoryGrid from "@/components/categories/category-grid"

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Load immediately */}
      <LazySimpleSlider />

      {/* Brand Carousel - Load when in view */}
      <LazySection delay={100} fallback={<SectionSkeleton type="carousel" />}>
        <LazyBrandCarousel />
      </LazySection>

      {/* Category Grid - Load when in view */}
      <LazySection delay={175} threshold={0.2} rootMargin="125px" fallback={<SectionSkeleton type="grid" />}>
        <CategoryGrid />
      </LazySection>

      

     

      {/* Product Grid - Load when in view with delay */}
      <LazySection delay={300} threshold={0.2} rootMargin="200px" fallback={<SectionSkeleton type="grid" />}>
        <LazyProductGrid />
      </LazySection>

      {/* Promotion Section - Load when in view */}
      <LazySection delay={250} fallback={<SectionSkeleton type="features" />}>
        <LazyPromotionSection />
      </LazySection>

      {/* Features Section - Load when in view */}
      <LazySection delay={200} fallback={<SectionSkeleton type="features" />}>
        <LazyFeatureCard />
      </LazySection>
    </main>
  )
}
