import CategoryProductsPage from "@/components/categories/category-products-page"

interface CategoryPageProps {
  params: {
    category: string
  }
  searchParams: {
    subcategory?: string
    sortBy?: string
    sortOrder?: string
    page?: string
  }
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const decodedCategory = decodeURIComponent(params.category)

  return (
    <div className="min-h-screen">
      <CategoryProductsPage
        category={decodedCategory}
        subcategory={searchParams.subcategory}
        sortBy={searchParams.sortBy}
        sortOrder={searchParams.sortOrder}
        page={searchParams.page}
      />
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { category: string } }) {
  const category = decodeURIComponent(params.category)

  return {
    title: `${category} Products - Shop Now`,
    description: `Browse our wide selection of ${category} products. Find the best deals and quality items.`,
  }
}
