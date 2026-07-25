import AdminShell from "../../components/AdminShell";
import { useAdminData } from "../../store/AdminDataContext";

export default function SettingsPage() {
  const { resetAdminData } = useAdminData();

  return (
    <AdminShell>
      <div className="p-[20px] md:p-[32px]">
        <h1 className="text-[24px] font-bold text-black">설정</h1>
        <p className="mt-[12px] text-[15px] text-black/60">
          매장 정보, 영업 시간, 알림 등 설정 화면입니다. (추후 구현 예정)
        </p>

        {/* 주문/메뉴/결제 상태는 브라우저에 저장되어 새로고침해도 유지됩니다. */}
        <div className="mt-[32px] max-w-[520px] rounded-[25px] border border-black/50 bg-canvas p-[24px]">
          <h2 className="text-[18px] font-medium tracking-[1px] text-black">
            데이터 초기화
          </h2>
          <p className="mt-[8px] text-[14px] leading-relaxed text-black/60">
            주문 현황·메뉴·결제 내역은 브라우저에 저장되어 새로고침 후에도
            유지됩니다. 시연을 위해 초기 목업 데이터로 되돌리려면 아래 버튼을
            눌러주세요.
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("저장된 주문/메뉴/결제 데이터를 초기 상태로 되돌릴까요?")) {
                resetAdminData();
              }
            }}
            className="mt-[16px] h-[44px] rounded-[10px] border border-black/50 bg-canvas px-[20px] text-[15px] font-medium tracking-[1px] text-black"
          >
            초기 데이터로 되돌리기
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
