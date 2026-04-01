import { useState } from 'react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function RequestAccess() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: '',
    userType: 'buyer',
    message: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // UI only - no actual submission
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <Container>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-semibold text-white mb-4">Request Access</h1>
            <p className="text-slate-400">
              Join thousands of verified buyers and suppliers on the world's most trusted pharmaceutical B2B platform
            </p>
          </div>

          <Card variant="elevated" className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    placeholder="John"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="Your Company"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                  Job Title / Role
                </label>
                <input
                  type="text"
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="Procurement Manager"
                  required
                />
              </div>

              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-slate-300 mb-2">
                  I am a
                </label>
                <select
                  id="userType"
                  value={formData.userType}
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                  className="w-full px-4 py-3 bg-primary border border-blue-200 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="buyer">Buyer</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                  Additional Information (Optional)
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="Tell us about your requirements..."
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full">
                Request Access
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </div>
  )
}

export default RequestAccess
