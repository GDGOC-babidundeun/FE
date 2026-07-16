import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo";

export default function LoginPage() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  // 목업 로그인: 값과 무관하게 대시보드로 이동
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/admin/orders");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
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
          className="mb-[28px] h-[48px] w-full rounded-[10px] border border-black/50 bg-canvas px-[16px] text-[16px] outline-none focus:border-black"
        />

        <button
          type="submit"
          className="h-[48px] w-full rounded-[10px] text-[16px] font-medium tracking-[1px] text-canvas"
          style={{ backgroundColor: "rgba(189,146,59,0.75)" }}
        >
          로그인
        </button>

        <p className="mt-[36px] text-center text-[16px] font-medium tracking-[1px]">
          <span className="text-black/50">계정이 없습니까?</span>
          {"   "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-black hover:underline"
          >
            가입
          </button>
        </p>
        <p className="mt-[12px] text-center text-[16px] font-medium tracking-[1px] text-black">
          계정에 문제가 있습니까?
        </p>
      </form>

      <div className="mt-[48px]">
        <BrandLogo width={150} />
      </div>
    </div>
  );
}
