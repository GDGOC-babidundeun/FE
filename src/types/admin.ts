// 사장님(admin) 화면에서 사용하는 도메인 타입 정의 (피그마 기준)

/** 메뉴 카테고리 */
export type MenuCategory = "컵밥" | "우동" | "세트" | "음료";

/** 판매 상태 */
export type MenuStatus = "판매중" | "품절";

export interface Menu {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  status: MenuStatus;
}

/** 주문 안의 개별 메뉴 라인 */
export interface OrderItem {
  name: string;
  /** 옵션/추가사항 (예: "더블", "계란후라이 추가 x 3") */
  options: string[];
  /** 조리 완료 여부 (오른쪽 보드에서 초록 박스로 표시) */
  cooked: boolean;
}

/**
 * 조리 진행 상태 (번호 색상 결정)
 * - waiting: 신규 접수
 * - cooking: 일부 조리 완료
 * - done: 전체 조리 완료 (번호가 초록색)
 */
export type OrderStatus = "waiting" | "cooking" | "done";

export interface Order {
  id: string;
  number: number;
  time: string;
  items: OrderItem[];
  status: OrderStatus;
  /** 호출 완료 여부 (색상과 무관, 호출 버튼 비활성화용) */
  called: boolean;
}

/** 결제 상태 */
export type PaymentStatus = "결제완료" | "취소됨";

export interface Payment {
  id: string;
  paidAt: string;
  orderNumber: number;
  method: string;
  amount: number;
  status: PaymentStatus;
  summary: string;
}
