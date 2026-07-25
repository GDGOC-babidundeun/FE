/**
 * 사장님 전용 관리자 계정
 *
 * 회원가입 기능은 추후 개발 예정이므로, 운영 환경에서도 아래 지정 계정 하나로만 로그인합니다.
 * 계정 정보는 Vercel 환경 변수(VITE_ADMIN_ID / VITE_ADMIN_PW)로 덮어쓸 수 있습니다.
 */
export const ADMIN_ID = import.meta.env.VITE_ADMIN_ID ?? "babidundeun";
export const ADMIN_PW = import.meta.env.VITE_ADMIN_PW ?? "babi2026!";

/** 로그인 상태 보관 키 (탭을 닫으면 해제되도록 sessionStorage 사용) */
const AUTH_KEY = "gdgoc-admin-auth";

/** 입력한 아이디/비밀번호가 사장님 계정과 일치하는지 확인 */
export function isAdminCredential(id: string, pw: string): boolean {
  return id.trim() === ADMIN_ID && pw === ADMIN_PW;
}

/** 로그인 성공 상태 저장 (새로고침 후에도 유지) */
export function signInAdmin() {
  sessionStorage.setItem(AUTH_KEY, "true");
}

export function signOutAdmin() {
  sessionStorage.removeItem(AUTH_KEY);
}

export function isAdminSignedIn(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}
