import { useState } from "react";
import AdminShell from "../../components/AdminShell";
import { useAdminData } from "../../store/AdminDataContext";
import type { Order, OrderItem } from "../../types/admin";

export default function OrdersDashboardPage() {
  const { orders, cookItems, callOrder, pickupOrder } = useAdminData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, string[]>>({});
  const [toast, setToast] = useState<string | null>(null);

  // 픽업 전 주문은 호출 여부와 무관하게 모두 왼쪽 상세 대상
  const active = orders.find((o) => o.id === selectedId) ?? orders[0] ?? null;

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const togglePending = (orderId: string, name: string) =>
    setPending((prev) => {
      const cur = prev[orderId] ?? [];
      return {
        ...prev,
        [orderId]: cur.includes(name)
          ? cur.filter((n) => n !== name)
          : [...cur, name],
      };
    });

  const handleCook = (order: Order) => {
    const checked = pending[order.id] ?? [];
    if (checked.length === 0) return;
    cookItems(order.id, checked);
    setPending((prev) => ({ ...prev, [order.id]: [] }));
  };

  const orderDetail = active ? (
    <OrderDetailPanel
      order={active}
      pending={pending[active.id] ?? []}
      onToggle={(name) => togglePending(active.id, name)}
      onCook={() => handleCook(active)}
      onCall={() => {
        if (active.called) return;
        callOrder(active.id);
        flash(`${active.number}번 고객님을 호출했습니다.`);
      }}
      onPickup={() => {
        pickupOrder(active.id);
        flash(`${active.number}번 픽업이 완료되었습니다.`);
      }}
    />
  ) : (
    <div className="flex h-full items-center justify-center text-center text-[14px] text-black/50">
      대기 중인 주문이 없습니다.
    </div>
  );

  return (
    <AdminShell sidebarTop={orderDetail}>
      <div className="flex h-full flex-col p-[32px]">
        <h1 className="mb-[20px] text-[24px] font-bold text-black">
          주문 현황 대시보드
        </h1>

        <div className="flex-1 overflow-auto rounded-[25px] bg-panel p-[24px]">
          {orders.length === 0 ? (
            <div className="flex h-full items-center justify-center text-[15px] text-black/50">
              진행 중인 주문이 없습니다.
            </div>
          ) : (
            <div className="flex flex-wrap gap-[24px]">
              {orders.map((o) => (
                <BoardCard
                  key={o.id}
                  order={o}
                  selected={active?.id === o.id}
                  onSelect={() => setSelectedId(o.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 rounded-full bg-black px-[20px] py-[10px] text-[14px] font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </AdminShell>
  );
}

/* ── 왼쪽 사이드바 상단: 선택된 주문 상세 ── */
function OrderDetailPanel({
  order,
  pending,
  onToggle,
  onCook,
  onCall,
  onPickup,
}: {
  order: Order;
  pending: string[];
  onToggle: (name: string) => void;
  onCook: () => void;
  onCall: () => void;
  onPickup: () => void;
}) {
  const numberColor = order.status === "done" ? "#22c55e" : "#ef4444";
  const allCooked = order.items.every((it) => it.cooked);

  return (
    <div className="flex h-full flex-col rounded-[10px] bg-canvas p-[20px]">
      <p className="text-[16px] font-medium text-black/75">주문번호</p>
      <p
        className="mt-[4px] text-[40px] font-bold leading-none"
        style={{ color: numberColor }}
      >
        {order.number}
      </p>

      <ul className="mt-[20px] flex flex-1 flex-col gap-[14px]">
        {order.items.map((it) => (
          <li key={it.name} className="flex gap-[10px]">
            <button
              type="button"
              disabled={it.cooked}
              onClick={() => onToggle(it.name)}
              aria-pressed={it.cooked || pending.includes(it.name)}
              className="mt-[3px] flex size-[22px] shrink-0 items-center justify-center border border-black bg-canvas text-[14px] leading-none"
            >
              {(it.cooked || pending.includes(it.name)) && (
                <span style={{ color: it.cooked ? "#22c55e" : "#000" }}>✓</span>
              )}
            </button>
            <ItemText item={it} nameSize={16} optSize={13} />
          </li>
        ))}
      </ul>

      <div className="mt-[20px] flex flex-col gap-[10px]">
        <button
          onClick={onCook}
          disabled={allCooked}
          className="mx-auto h-[40px] w-[120px] rounded-full bg-panel text-[15px] font-medium tracking-[1px] text-black disabled:opacity-40"
        >
          조리완료
        </button>
        <button
          onClick={onCall}
          disabled={order.called}
          className="mx-auto h-[40px] w-[120px] rounded-full bg-panel text-[15px] font-medium tracking-[1px] text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {order.called ? "호출됨" : "호출"}
        </button>
        <button
          onClick={onPickup}
          className="mx-auto h-[40px] w-[120px] rounded-full bg-panel text-[15px] font-medium tracking-[1px] text-black"
        >
          픽업완료
        </button>
      </div>
    </div>
  );
}

/* ── 오른쪽 보드 카드 ── */
function BoardCard({
  order,
  selected,
  onSelect,
}: {
  order: Order;
  selected: boolean;
  onSelect: () => void;
}) {
  const numberColor = order.status === "done" ? "#22c55e" : "#ef4444";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-[300px] flex-col rounded-[25px] bg-canvas p-[20px] text-left transition-shadow ${
        selected ? "ring-2 ring-black/40" : ""
      }`}
    >
      <p
        className="text-center text-[34px] font-bold leading-none"
        style={{ color: numberColor }}
      >
        {order.number}
      </p>
      <p className="mt-[6px] text-center text-[14px] text-black">
        {order.time}
        {order.called && (
          <span className="ml-[6px] font-medium text-black/60">· 호출됨</span>
        )}
      </p>

      <div className="mt-[16px] flex flex-col gap-[12px]">
        {order.items.map((it) => (
          <div
            key={it.name}
            className="rounded-[10px] px-[16px] py-[12px]"
            style={{
              backgroundColor: it.cooked
                ? "rgba(34,197,94,0.5)"
                : "rgba(217,217,217,0.5)",
            }}
          >
            <ItemText item={it} nameSize={18} optSize={14} />
          </div>
        ))}
      </div>
    </button>
  );
}

/* 메뉴명 + 옵션(불릿) */
function ItemText({
  item,
  nameSize,
  optSize,
}: {
  item: OrderItem;
  nameSize: number;
  optSize: number;
}) {
  return (
    <div className="min-w-0">
      <p className="font-medium text-black" style={{ fontSize: nameSize }}>
        {item.name}
      </p>
      {item.options.length > 0 && (
        <ul className="mt-[2px] list-disc pl-[18px]">
          {item.options.map((opt) => (
            <li key={opt} className="text-black" style={{ fontSize: optSize }}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
