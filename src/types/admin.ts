// 사장님(admin) 화면에서 사용하는 도메인 타입 정의 (피그마 기준)

/**
 * 메뉴 카테고리
 * 사장님이 직접 추가할 수 있으므로 고정 목록이 아닌 문자열로 다룹니다.
 * (기본 카테고리는 constants/mockData 의 INITIAL_CATEGORIES 참고)
 */
export type MenuCategory = string;

/** 판매 상태 */
export type MenuStatus = "판매중" | "품절";

export interface Menu {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  status: MenuStatus;
  /** 토핑 선택 가능 여부 */
  toppingAvailable: boolean;
}

/** 주문 안의 개별 메뉴 라인 */
export interface OrderItem {
  /** 같은 메뉴를 옵션만 다르게 주문한 경우를 구분하기 위한 고유 id */
  id: string;
  name: string;
  /** 주문 수량 */
  quantity: number;
  /** 옵션/추가사항 (예: "더블", "계란후라이 추가 x 3") */
  options: string[];
  /** 조리 완료 여부 (오른쪽 보드에서 초록 박스로 표시) */
  cooked: boolean;
}

/**
 * 조리 진행 상태
 * - waiting: 신규 접수
 * - cooking: 일부 조리 완료
 * - done: 전체 조리 완료
 */
export type OrderStatus = "waiting" | "cooking" | "done";

export interface Order {
  id: string;
  number: number;
  time: string;
  items: OrderItem[];
  status: OrderStatus;
  /** 호출 여부 (주문번호가 초록색으로 표시됨. 재호출 가능) */
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
