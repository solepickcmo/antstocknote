import prisma from '../prisma';

export class PrincipleService {
  /**
   * 특정 유저의 투자 원칙 목록을 순서대로 조회한다.
   * order_num ASC 정렬로 항상 1번 원칙이 먼저 오도록 보장한다.
   */
  async getPrinciples(userId: string) {
    return prisma.investmentPrinciple.findMany({
      where: { user_id: userId },
      orderBy: { order_num: 'asc' },
    });
  }

  /**
   * 투자 원칙 배열을 통째로 저장/수정한다 (upsert 방식).
   * 각 원칙을 order_num 기준으로 upsert하여,
   * 이미 있으면 content를 업데이트하고 없으면 새로 생성한다.
   *
   * 왜 배열 통째로 upsert인가:
   * - 프론트에서 순서 변경, 삭제, 추가를 모두 한 번의 저장 버튼으로 처리하기 위해
   * - 개별 PATCH는 UX에서 복잡도를 높이고 네트워크 요청도 많아짐
   */
  async savePrinciples(userId: string, principles: { order_num: number; content: string }[]) {
    const upsertPromises = principles.map(({ order_num, content }) =>
      prisma.investmentPrinciple.upsert({
        where: { user_id_order_num: { user_id: userId, order_num } },
        create: { user_id: userId, order_num, content },
        update: { content },
      })
    );

    return Promise.all(upsertPromises);
  }

  /**
   * 특정 원칙 1개를 삭제한다.
   * 삭제 전 해당 원칙이 본인 것인지 확인해 무결성을 보장한다.
   */
  async deletePrinciple(userId: string, id: string) {
    // 본인 소유 확인 (타인 원칙 삭제 방지)
    const principle = await prisma.investmentPrinciple.findFirst({
      where: { id, user_id: userId },
    });

    if (!principle) {
      throw new Error('ERR_NOT_FOUND');
    }

    return prisma.investmentPrinciple.delete({ where: { id } });
  }

  /**
   * 특정 유저의 원칙이 1개 이상 존재하는지 여부를 반환한다.
   * TradeModal 진입 시 원칙 작성 여부 확인에 사용한다.
   */
  async hasPrinciples(userId: string): Promise<boolean> {
    const count = await prisma.investmentPrinciple.count({ where: { user_id: userId } });
    return count > 0;
  }
}

export const principleService = new PrincipleService();
