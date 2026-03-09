import { ApiError } from './ApiError.js';

export const validateQuotationStatusTransition = (currentStatus, targetStatus, actor) => {
  const validTransitions = {
    BUYER: {
      SENT_TO_BUYER: ['BUYER_ACCEPTED', 'NEGOTIATION_REQUESTED', 'REJECTED'],
    },
    ADMIN: {
      SUBMITTED: ['ACCEPTED', 'REJECTED', 'UNDER_REVIEW'],
      UNDER_REVIEW: ['ACCEPTED', 'REJECTED', 'SENT_TO_BUYER'],
      REJECTED: ['UNDER_REVIEW'],
      ACCEPTED: ['SENT_TO_BUYER'],
      NEGOTIATION_REQUESTED: ['SENT_BACK_TO_SUPPLIER', 'CONFIRMED'],
      REVISION_REQUESTED: ['SENT_BACK_TO_SUPPLIER'],
      BUYER_ACCEPTED: ['CONFIRMED'],
      SENT_BACK_TO_SUPPLIER: ['SUBMITTED', 'UNDER_REVIEW'],
    },
    SUPPLIER: {
      DRAFT: ['SUBMITTED'],
      REJECTED: ['SUBMITTED'],
      SENT_BACK_TO_SUPPLIER: ['SUBMITTED'],
    }
  };

  const actorTransitions = validTransitions[actor];
  if (!actorTransitions) {
    throw new ApiError(403, `Invalid actor: ${actor}`);
  }

  const allowedStatuses = actorTransitions[currentStatus];
  if (!allowedStatuses) {
    throw new ApiError(400, `Invalid status transition from ${currentStatus} for ${actor}`);
  }

  if (!allowedStatuses.includes(targetStatus)) {
    throw new ApiError(400, `Cannot transition from ${currentStatus} to ${targetStatus}. Allowed: ${allowedStatuses.join(', ')}`);
  }

  return true;
};

export const canBuyerAcceptQuotation = (status) => {
  return status === 'SENT_TO_BUYER';
};

export const canBuyerRequestLowerPrice = (status) => {
  return status === 'SENT_TO_BUYER';
};

export const canBuyerRejectQuotation = (status) => {
  return status === 'SENT_TO_BUYER';
};

export const canBuyerViewQuotation = (status) => {
  return status === 'SENT_TO_BUYER' || status === 'BUYER_ACCEPTED' || status === 'NEGOTIATION_REQUESTED';
};
