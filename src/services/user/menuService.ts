import type { MenuCategory, MenuDetail } from "../../types/user";
import { MOCK_CATEGORIES, MOCK_MENU_DETAILS } from "../../constants/userMockData";

/**
 * 학생용 메뉴 관련 API 서비스
 * (추후 실제 API 연동 시 fetch/axios 호출 코드로 쉽게 교체할 수 있도록 설계)
 */
export const menuService = {
  /**
   * 전체 메뉴 및 카테고리 목록 조회
   * GET /api/menus
   */
  async getCategories(): Promise<MenuCategory[]> {
    // 네트워크 딜레이 시뮬레이션 (약 100ms)
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_CATEGORIES;
  },

  /**
   * 메뉴 상세 및 옵션 조회
   * GET /api/menus/{id}
   */
  async getMenuDetail(id: number): Promise<MenuDetail> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const menuDetail = MOCK_MENU_DETAILS[id];
    if (!menuDetail) {
      throw new Error("MENU_NOT_FOUND");
    }
    return menuDetail;
  },
};
