import express from 'express';
import { getExchangeRates } from './exchange-rates.controller.js';

const router = express.Router();

router.get('/', getExchangeRates);

export default router;
