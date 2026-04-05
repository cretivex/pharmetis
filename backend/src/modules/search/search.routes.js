import express from 'express';
import { getSearch } from './search.controller.js';

const router = express.Router();

router.get('/', getSearch);

export default router;
