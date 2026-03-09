import { motion } from 'framer-motion'
import Container from '../ui/Container'
import ProductCard from '../ProductCard'
import FilterBar from '../FilterBar'

function FeaturedProductsSection({ products, onSendRFQ, onViewDetails, filters, onFilterChange, onResetFilters }) {
  return (
    <section className="py-20 bg-blue-50/50">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Featured Products
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Browse verified pharmaceutical products from certified global manufacturers
          </p>
        </motion.div>

        {/* Filter Bar - Integrated into Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <FilterBar
            filters={filters}
            onFilterChange={onFilterChange}
            onReset={onResetFilters}
          />
        </motion.div>

        {products.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onSendRFQ={onSendRFQ}
                  onViewDetails={onViewDetails}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600">No products found. Try adjusting your filters.</p>
          </div>
        )}
      </Container>
    </section>
  )
}

export default FeaturedProductsSection
