import { Request, Response } from 'express';
import { noteService } from '../services/note.service';

export const upsertNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const tradeId = Number(req.params.tradeId as string);
    const { mistakeType, content } = req.body;
    
    const note = await noteService.createOrUpdateNote(userId, tradeId, mistakeType, content);
    res.status(200).json({ ...note, id: note.id.toString(), trade_id: note.trade_id.toString() });
  } catch (error: any) {
    if (error.message === 'ERR_INVALID_TRADE') return res.status(404).json({ error: 'Trade not found' });
    res.status(500).json({ error: error.message });
  }
};

export const getNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const tradeId = Number(req.params.tradeId as string);
    
    const note = await noteService.getNote(userId, tradeId);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.status(200).json({ ...note, id: note.id.toString(), trade_id: note.trade_id.toString() });
  } catch (error: any) {
    if (error.message === 'ERR_INVALID_TRADE') return res.status(404).json({ error: 'Trade not found' });
    res.status(500).json({ error: error.message });
  }
};
