import SimpleSlider from '@/components/home/SimpleSlider'
import ProductGrid from '@/components/layout/product-grid'
import { BrandCarousel } from '@/components/layout/brand-carousel'
import FeatureCard from '@/components/layout/features-section'

export default function Home() {
  return (
    <main className="min-h-screen">
      <SimpleSlider />
      <BrandCarousel />
      <ProductGrid />
      <FeatureCard />
      
      {/* Add more sections here */}
    </main>
  )
}