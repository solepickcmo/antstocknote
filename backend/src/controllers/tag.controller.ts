import { Request, Response } from 'express';
import { tagService } from '../services/tag.service';

export const getTags = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const tags = await tagService.getTags(userId);
    res.status(200).json({ tags });
  } catch (error: any) {
    res.status(500).json({ code: 'ERR_SERVER', message: error.message });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const tag = await tagService.createTag(userId, req.body);
    res.status(201).json(tag);
  } catch (error: any) {
    if (error.message === 'ERR_INVALID_DATA') {
      res.status(400).json({ code: 'ERR_INVALID_DATA', message: '태그 이름과 타입이 필요합니다.' });
    } else if (error.message === 'ERR_DUPLICATE_TAG') {
      res.status(409).json({ code: 'ERR_DUPLICATE_TAG', message: '이미 존재하는 태그 이름입니다.' });
    } else {
      res.status(500).json({ code: 'ERR_SERVER', message: error.message });
    }
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const id = req.params.id as string;
    await tagService.deleteTag(userId, id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'ERR_NOT_FOUND') {
      res.status(404).json({ code: 'ERR_NOT_FOUND', message: '태그를 찾을 수 없습니다.' });
    } else if (error.message === 'ERR_FORBIDDEN') {
      res.status(403).json({ code: 'ERR_FORBIDDEN', message: '권한이 없습니다.' });
    } else {
      res.status(500).json({ code: 'ERR_SERVER', message: error.message });
    }
  }
};
