import prisma from '../prisma';


export class AccountService {
  async createAccount(userId: string, data: any) {
    const { name, broker, currency } = data;
    return prisma.account.create({
      data: {
        user_id: userId,
        name,
        broker,
        currency
      }
    });
  }

  async getAccounts(userId: string) {
    return prisma.account.findMany({
      where: { user_id: userId, is_deleted: false }
    });
  }

  async updateAccount(userId: string, accountId: bigint, data: any) {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account || account.user_id !== userId || account.is_deleted) {
      throw new Error('ERR_NOT_FOUND');
    }
    return prisma.account.update({
      where: { id: accountId },
      data
    });
  }

  async deleteAccount(userId: string, accountId: bigint) {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account || account.user_id !== userId) {
      throw new Error('ERR_NOT_FOUND');
    }
    // Soft Delete
    return prisma.account.update({
      where: { id: accountId },
      data: { is_deleted: true }
    });
  }
}

export const accountService = new AccountService();
