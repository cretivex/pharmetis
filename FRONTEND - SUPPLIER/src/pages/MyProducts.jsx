import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Upload, Download, Loader2, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getMyProducts, deleteProduct, bulkUploadProducts } from '@/services/products.service'

export default function MyProducts() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getMyProducts()
      const productsList = Array.isArray(data) ? data : (data?.products || data || [])
      setProducts(productsList)
    } catch (error) {
      console.error('Failed to load products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setDeleting(true)
      setError(null)
      await deleteProduct(id)
      setSuccess('Product deleted successfully')
      setTimeout(() => setSuccess(null), 3000)
      loadProducts()
      setDeleteConfirm(null)
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete product'
      setError(errorMessage)
      setTimeout(() => setError(null), 5000)
      setDeleteConfirm(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log('[handleBulkUpload] No file selected')
      return
    }

    console.log('[handleBulkUpload] File selected:', file.name, file.type, file.size)

    // Validate file type - only accept .xlsx
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    const validExtensions = ['.xlsx']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please upload an Excel (.xlsx) file only.')
      setTimeout(() => setError(null), 5000)
      return
    }

    try {
      setUploading(true)
      setError(null)
      setSuccess(null)
      console.log('[handleBulkUpload] Starting upload...')
      const result = await bulkUploadProducts(file)
      console.log('[handleBulkUpload] Upload result:', result)
      setShowUpload(false)
      await loadProducts()
      const message = result?.message || `Products uploaded: ${result?.successful || 0} successful, ${result?.failed || 0} failed`
      setSuccess(message)
      setTimeout(() => setSuccess(null), 5000)
      
      // Reset file input
      e.target.value = ''
    } catch (error) {
      console.error('[handleBulkUpload] Upload error:', error)
      console.error('[handleBulkUpload] Error response:', error.response?.data)
      console.error('[handleBulkUpload] Error status:', error.response?.status)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload products'
      setError(errorMessage)
      setTimeout(() => setError(null), 5000)
      
      // Reset file input
      e.target.value = ''
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const headers = ['Name', 'Brand', 'Strength', 'Dosage Form', 'Manufacturer', 'Price', 'Availability']
    const example = ['Paracetamol 500mg', 'Generic', '500mg', 'TABLET', 'ABC Pharma', '0.50', 'IN_STOCK']
    const csv = [headers.join(','), example.join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'product-template.csv'
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm">{success}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSuccess(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUpload(!showUpload)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={() => navigate('/supplier/products/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Upload Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleBulkUpload}
                className="hidden"
                id="bulkUpload"
                disabled={uploading}
              />
              <label
                htmlFor="bulkUpload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileSpreadsheet className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload Excel or CSV file'}
                </span>
              </label>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Sample Template
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No products found</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowUpload(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Products
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Dosage Form</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.brand || '-'}</TableCell>
                    <TableCell>{product.dosageForm}</TableCell>
                    <TableCell>${product.price || '0.00'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.availability === 'IN_STOCK'
                            ? 'success'
                            : product.availability === 'OUT_OF_STOCK'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {product.availability}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => navigate(`/supplier/products/${product.id}/edit`)}
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm({ id: product.id, name: product.name })}
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="border-red-200 bg-white max-w-md w-full mx-4">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Confirm Delete</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setDeleteConfirm(null)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDelete(deleteConfirm.id)}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
