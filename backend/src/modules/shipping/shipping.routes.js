import express from 'express'
import { getShippingEstimate } from './shipping.controller.js'

const router = express.Router()

router.get('/estimate', getShippingEstimate)

export default router
