import express from 'express';
import { getMedicinesFilters } from './filters.controller.js';

const router = express.Router();

router.get('/medicines', getMedicinesFilters);

export default router;
