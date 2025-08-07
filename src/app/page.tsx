import { LazySection } from "@/components/layout/lazy-section"
import { SectionSkeleton } from "@/components/layout/section-skeleton"
import { LazySimpleSlider } from "@/components/home/lazy-simple-slider"
import { LazyBrandCarousel } from "@/components/layout/lazy-brand-carousel"
import { LazyProductGrid } from "@/components/layout/lazy-product-grid"
import { LazyFeatureCard } from "@/components/layout/lazy-feature-card"
import { LazyPromotionSection } from "@/components/layout/lazy-promotion-section"
import PromotionalBanner from "@/components/layout/promotional-banner"
import CategoryGrid from "@/components/categories/category-grid"
import DeliveryPoster from "@/components/layout/delivery-poster"

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Load immediately with highest priority - NO lazy loading for critical content */}
      <LazySimpleSlider />

      {/* Brand Carousel - Reduced delay and optimized threshold 
      <LazySection delay={50} threshold={0.1} rootMargin="50px" fallback={<SectionSkeleton type="carousel" />}>
        <LazyBrandCarousel />
      </LazySection> */}

      {/* Category Grid - Optimized loading parameters */}
      <LazySection delay={75} threshold={0.1} rootMargin="75px" fallback={<SectionSkeleton type="grid" />}>
        <CategoryGrid />
      </LazySection>

      {/* Delivery Poster - Reduced delay */}
      <LazySection delay={100} threshold={0.2} rootMargin="100px" fallback={<SectionSkeleton type="features" />}>
        <DeliveryPoster />
      </LazySection>

      {/* Product Grid - Optimized for faster loading */}
      <LazySection delay={150} threshold={0.1} rootMargin="150px" fallback={<SectionSkeleton type="grid" />}>
        <LazyProductGrid />
      </LazySection>

      {/* Promotional Banner - Reduced delay */}
      <LazySection delay={125} threshold={0.2} rootMargin="100px" fallback={<SectionSkeleton type="features" />}>
        <PromotionalBanner />
      </LazySection>

      {/* Promotion Section - Optimized loading */}
      <LazySection delay={175} threshold={0.2} rootMargin="125px" fallback={<SectionSkeleton type="features" />}>
        <LazyPromotionSection />
      </LazySection>

      {/* Features Section - Load last with minimal delay */}
      <LazySection delay={100} threshold={0.2} rootMargin="100px" fallback={<SectionSkeleton type="features" />}>
        <LazyFeatureCard />
      </LazySection>
    </main>
  )
}
 