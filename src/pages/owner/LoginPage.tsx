import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo";
import { isAdminCredential, signInAdmin } from "../../constants/adminAccount";

export default function LoginPage() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 사장님 전용 지정 계정으로만 로그인 가능
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isAdminCredential(id, pw)) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    setError(null);
    signInAdmin();
    navigate("/admin/orders", { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-[460px]">
        <h1 className="mb-[40px] text-center text-[32px] font-medium tracking-[2px] text-black">
          로그인
        </h1>

        <label className="mb-[6px] block text-[16px] font-medium tracking-[1px] text-black">
          아이디
        </label>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="mb-[24px] h-[48px] w-full rounded-[10px] border border-black/50 bg-canvas px-[16px] text-[16px] outline-none focus:border-black"
        />

        <label className="mb-[6px] block text-[16px] font-medium tracking-[1px] text-black">
          비밀번호
        </label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="h-[48px] w-full rounded-[10px] border border-black/50 bg-canvas px-[16px] text-[16px] outline-none focus:border-black"
        />

        {error ? (
          <p className="mt-[10px] mb-[18px] text-[14px] font-medium tracking-[0.5px] text-danger">
            {error}
          </p>
        ) : (
          <div className="mb-[28px]" />
        )}

        <button
          type="submit"
          className="h-[48px] w-full rounded-[10px] text-[16px] font-medium tracking-[1px] text-canvas"
          style={{ backgroundColor: "rgba(189,146,59,0.75)" }}
        >
          로그인
        </button>

        {/* 회원가입은 추후 개발 예정 — 사장님 전용 지정 계정으로만 로그인합니다 */}
        <p className="mt-[36px] text-center text-[15px] font-medium leading-relaxed tracking-[1px] text-black/50">
          사장님 전용 계정으로만 로그인할 수 있습니다.
          <br />
          계정에 문제가 있다면 관리자에게 문의해 주세요.
        </p>
      </form>

      <div className="mt-[48px]">
        <BrandLogo width={150} />
      </div>
    </div>
  );
}
