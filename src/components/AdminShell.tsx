import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOutAdmin } from "../constants/adminAccount";

const NAV = [
  { to: "/admin/orders", label: "주문 현황" },
  { to: "/admin/menus", label: "메뉴 관리" },
  { to: "/admin/payments", label: "결제 내역" },
  { to: "/admin/settings", label: "설정" },
];

interface AdminShellProps {
  /** 사이드바 상단 슬롯 (주문 현황 대시보드의 주문 상세 패널) */
  sidebarTop?: ReactNode;
  children: ReactNode;
}

/** 관리자 공통 레이아웃 (사이드바 + 메인) — 피그마 기준 */
export default function AdminShell({ sidebarTop, children }: AdminShellProps) {
  const navigate = useNavigate();

  return (
    // h-dvh: iOS Safari 등에서 주소창/툴바 높이를 제외한 실제 보이는 높이 사용
    <div className="flex h-dvh w-full overflow-hidden bg-canvas">
      {/* 사이드바 */}
      {/* 주문 상세(2개 메뉴 기준)가 한 화면에 들어오도록 사이드바 폭 확대 */}
      <aside
        className="flex w-[240px] shrink-0 flex-col overflow-hidden bg-panel px-[15px] py-[20px] md:w-[300px] lg:w-[340px]"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        {/* 상단 슬롯 (내용이 길면 이 영역만 스크롤 → 하단 메뉴는 항상 보임) */}
        <div className="min-h-0 flex-1 overflow-y-auto">{sidebarTop}</div>

        {/* 구분선 */}
        <div className="my-[14px] shrink-0 border-t border-black/40" />

        {/* 네비게이션 */}
        <nav className="flex shrink-0 flex-col gap-[10px]">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className="block">
              {({ isActive }) => <NavPill label={item.label} active={isActive} />}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => {
              signOutAdmin();
              navigate("/login", { replace: true });
            }}
            className="block text-left"
          >
            <NavPill label="로그아웃" active={false} />
          </button>
        </nav>

        {/* 날짜 */}
        <div className="mt-[14px] shrink-0 text-center text-[14px] font-medium leading-tight text-black">
          <p>2026.07.09 (목)</p>
          <p>14:51</p>
        </div>
      </aside>

      {/* 메인 */}
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`flex h-[44px] items-center gap-[12px] rounded-[10px] px-[16px] text-[15px] font-medium tracking-[0.5px] ${
        active ? "bg-black text-canvas" : "bg-canvas text-black"
      }`}
    >
      <span className="size-[14px] shrink-0 rounded-full bg-danger" />
      {label}
    </span>
  );
}
