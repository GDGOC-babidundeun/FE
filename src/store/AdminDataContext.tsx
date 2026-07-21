import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Menu, Order, Payment } from "../types/admin";
import {
  INITIAL_MENUS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
} from "../constants/mockData";

interface AdminDataValue {
  menus: Menu[];
  orders: Order[];
  payments: Payment[];

  // 메뉴 관리
  toggleMenuStatus: (id: string) => void;
  addMenu: (menu: Omit<Menu, "id">) => void;
  /** 기존 메뉴 정보 수정 */
  updateMenu: (id: string, patch: Omit<Menu, "id" | "status">) => void;

  // 주문 대시보드
  /** 특정 주문의 특정 메뉴 라인을 조리 완료 처리 (오른쪽 보드 초록) */
  cookItems: (orderId: string, itemNames: string[]) => void;
  /** 주문 호출 → 주문번호가 초록색으로 표시 (여러 번 호출 가능) */
  callOrder: (orderId: string) => void;
  /** 픽업 완료 → 보드에서 완전히 제거 */
  pickupOrder: (orderId: string) => void;

  // 결제 내역
  refundPayment: (id: string) => void;
}

const AdminDataContext = createContext<AdminDataValue | null>(null);

let menuSeq = 100;

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [menus, setMenus] = useState<Menu[]>(INITIAL_MENUS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);

  const value = useMemo<AdminDataValue>(
    () => ({
      menus,
      orders,
      payments,

      toggleMenuStatus: (id) =>
        setMenus((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, status: m.status === "판매중" ? "품절" : "판매중" }
              : m,
          ),
        ),

      addMenu: (menu) =>
        setMenus((prev) => [...prev, { ...menu, id: `m${++menuSeq}` }]),

      updateMenu: (id, patch) =>
        setMenus((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        ),

      cookItems: (orderId, itemNames) =>
        setOrders((prev) =>
          prev.map((order) => {
            if (order.id !== orderId) return order;
            const items = order.items.map((it) =>
              itemNames.includes(it.name) ? { ...it, cooked: true } : it,
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
    }),
    [menus, orders, payments],
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
