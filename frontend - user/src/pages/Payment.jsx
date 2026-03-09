import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, CheckCircle2, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import { paymentService } from '../services/payment.service.js';
import { rfqService } from '../services/rfq.service.js';
import { useCurrency } from '../contexts/CurrencyContext';

function Payment() {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rfqId = searchParams.get('rfqId');
  const quotationId = searchParams.get('quotationId');

  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentType, setPaymentType] = useState('FULL');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentCreated, setPaymentCreated] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    if (rfqId) {
      loadRFQ();
    } else {
      setError('RFQ ID is required');
      setLoading(false);
    }
  }, [rfqId]);

  const loadRFQ = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rfqService.getById(rfqId);
      if (!data || !data.id) {
        throw new Error('RFQ not found');
      }
      setRfq(data);
      if (data.totalAmount) {
        setAdvanceAmount((parseFloat(data.totalAmount) * 0.3).toFixed(2));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load RFQ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!rfq) return;

    try {
      setProcessing(true);
      setError(null);

      const targetRfqId = rfq?.id;
      
      if (!targetRfqId) {
        throw new Error('RFQ ID not found');
      }

      const paymentData = {
        rfqId: targetRfqId,
        paymentType,
        ...(paymentType === 'ADVANCE' && { amount: parseFloat(advanceAmount) })
      };

      const payment = await paymentService.create(paymentData);
      setPaymentId(payment.id);
      setPaymentCreated(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentId) return;

    try {
      setProcessing(true);
      setError(null);

      await paymentService.confirm(paymentId, {
        transactionId: `TXN-${Date.now()}`,
        gateway: 'MANUAL'
      });

      navigate(rfqId ? `/my-rfqs?payment=success&rfqId=${rfqId}` : '/my-rfqs?payment=success');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to confirm payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-20 flex items-center justify-center">
        <Loading message="Loading payment details..." fullScreen={false} />
      </div>
    );
  }

  if (error && !rfq) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-20 flex items-center justify-center">
        <ErrorState
          message={error}
          retry="Back to RFQs"
          onRetry={() => navigate('/my-rfqs')}
        />
      </div>
    );
  }

  const totalAmount = parseFloat(rfq?.totalAmount) || 0;
  const currency = rfq?.selectedQuotation?.currency || 'USD';

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/my-rfqs')}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to RFQs
          </Button>

          <div className="bg-white rounded-2xl border border-blue-100 p-8 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Payment</h1>
                <p className="text-slate-600">RFQ #{rfq?.id?.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {!paymentCreated ? (
              <>
                <div className="mb-6 bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {formatPrice(totalAmount, currency)}
                      </p>
                    </div>
                    {rfq?.selectedQuotation?.supplier?.companyName && (
                      <div className="text-right">
                        <p className="text-sm text-slate-600 mb-1">Supplier</p>
                        <p className="font-semibold text-slate-900">{rfq.selectedQuotation.supplier.companyName}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Payment Type</label>
                  <div className="space-y-3">
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentType === 'FULL' ? 'border-primary bg-white' : 'border-blue-200 hover:bg-white'}`}>
                      <input
                        type="radio"
                        name="paymentType"
                        value="FULL"
                        checked={paymentType === 'FULL'}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-slate-900">Full Payment</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">Pay the complete amount: {formatPrice(totalAmount, currency)}</p>
                      </div>
                    </label>

                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentType === 'ADVANCE' ? 'border-primary bg-white' : 'border-blue-200 hover:bg-white'}`}>
                      <input
                        type="radio"
                        name="paymentType"
                        value="ADVANCE"
                        checked={paymentType === 'ADVANCE'}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-slate-900">Advance Payment</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">Pay 30% advance: {formatPrice(totalAmount * 0.3, currency)}</p>
                        {paymentType === 'ADVANCE' && (
                          <input
                            type="number"
                            value={advanceAmount}
                            onChange={(e) => setAdvanceAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="0"
                            max={totalAmount}
                            step="0.01"
                            className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={handleCreatePayment}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Created</h2>
                <p className="text-slate-600 mb-6">Please confirm your payment to complete the transaction.</p>
                <Button
                  variant="primary"
                  onClick={handleConfirmPayment}
                  disabled={processing}
                  className="flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm Payment
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </Container>
    </div>
  );
}

export default Payment;
