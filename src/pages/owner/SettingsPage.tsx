import AdminShell from "../../components/AdminShell";

export default function SettingsPage() {
  return (
    <AdminShell>
      <div className="p-[32px]">
        <h1 className="text-[24px] font-bold text-black">설정</h1>
        <p className="mt-[12px] text-[15px] text-black/60">
          매장 정보, 영업 시간, 알림 등 설정 화면입니다. (추후 구현 예정)
        </p>
      </div>
    </AdminShell>
  );
}
