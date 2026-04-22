import prisma from '../prisma';

export class StockAnalysisService {
  /**
   * 특정 유저의 전체 분석 목록 조회 (ticker 필터 가능)
   * 왜 pagination을 지원하는가:
   * - 분석 기록이 쌓이면 한 번에 모두 내려받으면 성능 저하가 발생하므로
   * - 기본 50개씩 페이지네이션으로 처리
   */
  async getAnalyses(userId: string, filters: { ticker?: string; page?: number; size?: number }) {
    const page = Number(filters.page || 0);
    const size = Number(filters.size || 50);

    const where: any = { user_id: userId };
    if (filters.ticker) where.ticker = filters.ticker;

    const [total, analyses] = await Promise.all([
      prisma.stockAnalysis.count({ where }),
      prisma.stockAnalysis.findMany({
        where,
        orderBy: { analysis_date: 'desc' },
        skip: page * size,
        take: size,
      }),
    ]);

    return { total, page, analyses };
  }

  /**
   * 특정 종목(ticker)의 분석 목록 조회
   * HoldingsPage에서 "이 종목 분석 보기" 클릭 시 사용
   */
  async getAnalysesByTicker(userId: string, ticker: string) {
    return prisma.stockAnalysis.findMany({
      where: { user_id: userId, ticker },
      orderBy: { analysis_date: 'desc' },
    });
  }

  /**
   * 새 분석 기록 생성
   */
  async createAnalysis(
    userId: string,
    data: {
      ticker?: string;
      stock_name?: string;
      title: string;
      content: string;
      analysis_date?: string;
    }
  ) {
    return prisma.stockAnalysis.create({
      data: {
        user_id: userId,
        ticker: data.ticker || null,
        stock_name: data.stock_name || null,
        title: data.title,
        content: data.content,
        analysis_date: data.analysis_date ? new Date(data.analysis_date) : new Date(),
      },
    });
  }

  /**
   * 분석 수정 (제목, 본문, 날짜만 수정 가능)
   * 왜 ticker는 수정 못하는가:
   * - 종목 변경은 새 분석을 작성하는 것이 의미적으로 명확하기 때문
   */
  async updateAnalysis(
    userId: string,
    id: string,
    data: { title?: string; content?: string; analysis_date?: string }
  ) {
    // 소유권 확인
    const existing = await prisma.stockAnalysis.findFirst({
      where: { id, user_id: userId },
    });
    if (!existing) throw new Error('ERR_NOT_FOUND');

    return prisma.stockAnalysis.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.analysis_date && { analysis_date: new Date(data.analysis_date) }),
      },
    });
  }

  /**
   * 분석 삭제
   */
  async deleteAnalysis(userId: string, id: string) {
    const existing = await prisma.stockAnalysis.findFirst({
      where: { id, user_id: userId },
    });
    if (!existing) throw new Error('ERR_NOT_FOUND');

    return prisma.stockAnalysis.delete({ where: { id } });
  }
}

export const stockAnalysisService = new StockAnalysisService();
