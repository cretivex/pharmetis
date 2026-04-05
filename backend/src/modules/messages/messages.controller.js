import {
  listThreadsService,
  getOrCreateThreadService,
  listMessagesService,
  sendMessageService,
} from './messages.service.js';

export const listThreads = async (req, res, next) => {
  try {
    const threads = await listThreadsService(req.user.id, req.user.role);
    res.status(200).json({ success: true, data: threads });
  } catch (e) {
    next(e);
  }
};

export const createThread = async (req, res, next) => {
  try {
    const thread = await getOrCreateThreadService(req.user.id, req.user.role, req.body || {});
    res.status(200).json({ success: true, data: thread });
  } catch (e) {
    next(e);
  }
};

export const listMessages = async (req, res, next) => {
  try {
    const messages = await listMessagesService(req.user.id, req.user.role, req.params.threadId);
    res.status(200).json({ success: true, data: messages });
  } catch (e) {
    next(e);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const message = await sendMessageService(req.user.id, req.user.role, req.params.threadId, req.body);
    res.status(201).json({ success: true, data: message });
  } catch (e) {
    next(e);
  }
};
