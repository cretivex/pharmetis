import express from 'express'
import { authenticate, authorize } from '../../middlewares/auth.middleware.js'
import { getCheckoutQuotation, createCheckoutOrder } from './checkout.controller.js'

const router = express.Router()

router.use(authenticate)
router.use(authorize('BUYER'))

router.get('/:quotationId', getCheckoutQuotation)
router.post('/:quotationId', createCheckoutOrder)

export default router
