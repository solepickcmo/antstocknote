import prisma from '../prisma';


export class TagService {
  async getTags(userId: string) {
    const tags = await prisma.tag.findMany({
      where: { user_id: userId },
      orderBy: { id: 'asc' }
    });
    return tags.map((tag: any) => ({
      ...tag,
      id: tag.id.toString(),
    }));
  }

  async createTag(userId: string, data: { name: string; type: string }) {
    if (!data.name || !data.type) {
      throw new Error('ERR_INVALID_DATA');
    }
    
    try {
      const tag = await prisma.tag.create({
        data: {
          user_id: userId,
          name: data.name,
          type: data.type as any
        }
      });
      return { ...tag, id: tag.id.toString() };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('ERR_DUPLICATE_TAG');
      }
      throw error;
    }
  }

  async deleteTag(userId: string, tagId: string) {
    const tag = await prisma.tag.findUnique({
      where: { id: BigInt(tagId) }
    });

    if (!tag) {
      throw new Error('ERR_NOT_FOUND');
    }

    if (tag.user_id !== userId) {
      throw new Error('ERR_FORBIDDEN');
    }

    await prisma.tag.delete({
      where: { id: BigInt(tagId) }
    });
  }
}

export const tagService = new TagService();
