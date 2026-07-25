import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Menu, MenuCategory, Order, Payment } from "../types/admin";
import {
  INITIAL_CATEGORIES,
  INITIAL_MENUS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
} from "../constants/mockData";
import {
  clearAdminState,
  loadAdminState,
  saveAdminState,
} from "../utils/adminStorage";

/** 학생용 화면에서 결제가 완료됐을 때 넘겨받는 주문 정보 */
export interface IncomingOrder {
  items: { name: string; quantity: number; options: string[] }[];
  totalPrice: number;
  /** 결제 수단 표시명 (예: "카카오페이") */
  method: string;
}

/** 접수된 주문에 부여된 정보 (학생 화면의 대기번호로도 사용) */
export interface AcceptedOrder {
  orderId: string;
  number: number;
}

interface AdminDataValue {
  categories: MenuCategory[];
  menus: Menu[];
  orders: Order[];
  payments: Payment[];

  // 메뉴 관리
  /**
   * 카테고리 추가
   * @returns 추가 성공 여부 (빈 값이거나 이미 있는 이름이면 false)
   */
  addCategory: (name: string) => boolean;
  toggleMenuStatus: (id: string) => void;
  addMenu: (menu: Omit<Menu, "id">) => void;
  /** 기존 메뉴 정보 수정 */
  updateMenu: (id: string, patch: Omit<Menu, "id" | "status">) => void;

  // 주문 대시보드
  /** 학생용 화면의 주문 완료를 대시보드에 접수 (대기번호 채번 + 결제 내역 기록) */
  receiveOrder: (order: IncomingOrder) => AcceptedOrder;
  /** 특정 주문의 특정 메뉴 라인을 조리 완료 처리 (오른쪽 보드 초록) */
  cookItems: (orderId: string, itemIds: string[]) => void;
  /** 주문 호출 → 주문번호가 초록색으로 표시 (여러 번 호출 가능) */
  callOrder: (orderId: string) => void;
  /** 픽업 완료 → 보드에서 완전히 제거 */
  pickupOrder: (orderId: string) => void;

  // 결제 내역
  refundPayment: (id: string) => void;

  /** 저장된 데이터를 지우고 초기 목업 데이터로 되돌림 (시연/테스트용) */
  resetAdminData: () => void;
}

const AdminDataContext = createContext<AdminDataValue | null>(null);

/** 저장된 메뉴 id(m101 …) 와 겹치지 않는 다음 메뉴 id 생성 */
function nextMenuId(menus: Menu[]): string {
  const maxSeq = menus.reduce((max, m) => {
    const n = Number(m.id.replace(/^m/, ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 100);
  return `m${maxSeq + 1}`;
}

/** 대기번호 시작값 — 저장된 값이 없으면 목업 주문의 마지막 번호를 이어서 사용 */
function initialLastOrderNumber(orders: Order[]): number {
  return orders.reduce((max, o) => Math.max(max, o.number), 100);
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** "14:48" 형식 (보드 카드 표시용) */
function formatTime(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** "2026.07.09 14:48" 형식 (결제 내역 표시용) */
function formatDateTime(d: Date) {
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())} ${formatTime(d)}`;
}

/** 결제 내역 요약 문구 ("삼겹소금 외 1개") */
function summarize(items: IncomingOrder["items"]): string {
  if (items.length === 0) return "-";
  const [first, ...rest] = items;
  return rest.length === 0 ? first.name : `${first.name} 외 ${rest.length}개`;
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  // 새로고침 시 목업 데이터로 되돌아가지 않도록 저장된 상태를 우선 사용
  const persisted = useMemo(() => loadAdminState(), []);
  const [categories, setCategories] = useState<MenuCategory[]>(
    persisted?.categories ?? INITIAL_CATEGORIES,
  );
  const [menus, setMenus] = useState<Menu[]>(persisted?.menus ?? INITIAL_MENUS);
  const [orders, setOrders] = useState<Order[]>(persisted?.orders ?? INITIAL_ORDERS);
  const [payments, setPayments] = useState<Payment[]>(
    persisted?.payments ?? INITIAL_PAYMENTS,
  );
  const [lastOrderNumber, setLastOrderNumber] = useState<number>(
    () =>
      persisted?.lastOrderNumber || initialLastOrderNumber(persisted?.orders ?? INITIAL_ORDERS),
  );

  // 상태가 바뀔 때마다 저장 (픽업 완료로 주문이 0건이 된 상태도 그대로 유지)
  useEffect(() => {
    saveAdminState({ categories, menus, orders, payments, lastOrderNumber });
  }, [categories, menus, orders, payments, lastOrderNumber]);

  const value = useMemo<AdminDataValue>(
    () => ({
      categories,
      menus,
      orders,
      payments,

      addCategory: (name) => {
        const trimmed = name.trim();
        if (!trimmed || categories.includes(trimmed)) return false;
        setCategories((prev) => [...prev, trimmed]);
        return true;
      },

      toggleMenuStatus: (id) =>
        setMenus((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, status: m.status === "판매중" ? "품절" : "판매중" }
              : m,
          ),
        ),

      addMenu: (menu) =>
        setMenus((prev) => [...prev, { ...menu, id: nextMenuId(prev) }]),

      updateMenu: (id, patch) =>
        setMenus((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        ),

      receiveOrder: (incoming) => {
        const now = new Date();
        const number = lastOrderNumber + 1;
        const orderId = `u${now.getTime()}`;

        const newOrder: Order = {
          id: orderId,
          number,
          time: formatTime(now),
          status: "waiting",
          called: false,
          items: incoming.items.map((it, idx) => ({
            id: `${orderId}-${idx}`,
            name: it.name,
            quantity: it.quantity,
            options: it.options,
            cooked: false,
          })),
        };

        const newPayment: Payment = {
          id: `p${now.getTime()}`,
          paidAt: formatDateTime(now),
          orderNumber: number,
          method: incoming.method,
          amount: incoming.totalPrice,
          status: "결제완료",
          summary: summarize(incoming.items),
        };

        setLastOrderNumber(number);
        setOrders((prev) => [...prev, newOrder]);
        setPayments((prev) => [newPayment, ...prev]);

        return { orderId, number };
      },

      cookItems: (orderId, itemIds) =>
        setOrders((prev) =>
          prev.map((order) => {
            if (order.id !== orderId) return order;
            const items = order.items.map((it) =>
              itemIds.includes(it.id) ? { ...it, cooked: true } : it,
            );
            const allCooked = items.every((it) => it.cooked);
            return {
              ...order,
              items,
              status: allCooked ? "done" : "cooking",
            };
          }),
        ),

      callOrder: (orderId) =>
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, called: true } : o)),
        ),

      pickupOrder: (orderId) =>
        setOrders((prev) => prev.filter((o) => o.id !== orderId)),

      refundPayment: (id) =>
        setPayments((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: "취소됨" } : p,
          ),
        ),

      resetAdminData: () => {
        clearAdminState();
        setCategories(INITIAL_CATEGORIES);
        setMenus(INITIAL_MENUS);
        setOrders(INITIAL_ORDERS);
        setPayments(INITIAL_PAYMENTS);
        setLastOrderNumber(initialLastOrderNumber(INITIAL_ORDERS));
      },
    }),
    [categories, menus, orders, payments, lastOrderNumber],
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }
  return ctx;
}
