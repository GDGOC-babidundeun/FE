import {
  createContext,
  useContext,
  useEffect,
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
import {
  clearAdminState,
  loadAdminState,
  saveAdminState,
} from "../utils/adminStorage";

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

export function AdminDataProvider({ children }: { children: ReactNode }) {
  // 새로고침 시 목업 데이터로 되돌아가지 않도록 저장된 상태를 우선 사용
  const persisted = useMemo(() => loadAdminState(), []);
  const [menus, setMenus] = useState<Menu[]>(persisted?.menus ?? INITIAL_MENUS);
  const [orders, setOrders] = useState<Order[]>(persisted?.orders ?? INITIAL_ORDERS);
  const [payments, setPayments] = useState<Payment[]>(
    persisted?.payments ?? INITIAL_PAYMENTS,
  );

  // 상태가 바뀔 때마다 저장 (픽업 완료로 주문이 0건이 된 상태도 그대로 유지)
  useEffect(() => {
    saveAdminState({ menus, orders, payments });
  }, [menus, orders, payments]);

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
        setMenus((prev) => [...prev, { ...menu, id: nextMenuId(prev) }]),

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

      resetAdminData: () => {
        clearAdminState();
        setMenus(INITIAL_MENUS);
        setOrders(INITIAL_ORDERS);
        setPayments(INITIAL_PAYMENTS);
      },
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
