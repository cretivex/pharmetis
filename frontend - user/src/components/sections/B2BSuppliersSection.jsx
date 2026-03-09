import Container from '../ui/Container'
import SupplierCard from '../SupplierCard'

function B2BSuppliersSection({ suppliers, onViewSupplier, onSendInquiry }) {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Verified Suppliers
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-3">
            Connect with certified pharmaceutical manufacturers and exporters
          </p>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            All suppliers undergo regulatory and compliance verification.
          </p>
        </div>

        {suppliers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier, index) => (
              <SupplierCard
                key={supplier.id || index}
                supplier={supplier}
                onViewSupplier={onViewSupplier}
                onSendInquiry={onSendInquiry}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600">No suppliers found.</p>
          </div>
        )}
      </Container>
    </section>
  )
}

export default B2BSuppliersSection
