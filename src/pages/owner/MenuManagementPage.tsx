import { useEffect, useRef, useState, type FormEvent } from "react";
import AdminShell from "../../components/AdminShell";
import Toggle from "../../components/Toggle";
import { useAdminData } from "../../store/AdminDataContext";
import type { Menu, MenuCategory } from "../../types/admin";

/** 우측 패널 상태: 닫힘 | 신규 등록 | 특정 메뉴 수정 */
type PanelState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; menuId: string };

export default function MenuManagementPage() {
  const { categories, menus, addCategory, toggleMenuStatus, addMenu, updateMenu } =
    useAdminData();
  const [tab, setTab] = useState<MenuCategory>(categories[0] ?? "");
  const [panel, setPanel] = useState<PanelState>({ mode: "closed" });
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const filtered = menus.filter((m) => m.category === tab);
  const editing =
    panel.mode === "edit" ? menus.find((m) => m.id === panel.menuId) ?? null : null;

  const closePanel = () => setPanel({ mode: "closed" });

  return (
    <AdminShell>
      <div className="flex h-full flex-col p-[20px] md:p-[32px]">
        {/* 헤더 */}
        <div className="mb-[24px] flex flex-wrap items-center justify-between gap-[12px]">
          <h1 className="text-[24px] font-bold text-black">메뉴 관리</h1>
          <button
            onClick={() => setPanel({ mode: "create" })}
            className="h-[48px] rounded-[10px] border border-black/50 bg-black px-[20px] text-[15px] font-medium tracking-[1px] text-white"
          >
            + 새 메뉴 등록
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div className="mb-[24px] flex flex-wrap gap-[12px] md:gap-[16px]">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setTab(c);
                // 다른 카테고리로 이동하면 열려 있던 수정 패널은 닫는다
                if (panel.mode === "edit") closePanel();
              }}
              className={`h-[48px] rounded-[10px] border border-black/50 px-[24px] text-[15px] font-medium tracking-[1px] ${
                tab === c ? "bg-black text-white" : "bg-canvas text-black"
              }`}
            >
              {c}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCategoryModalOpen(true)}
            className="h-[48px] rounded-[10px] border border-dashed border-black/50 bg-canvas px-[24px] text-[15px] font-medium tracking-[1px] text-black/70 hover:border-black hover:text-black"
          >
            + 카테고리 추가
          </button>
        </div>

        {/* 본문: 메뉴 그리드 + (등록 폼) */}
        {/* 좁은 화면(태블릿 세로 등)에서는 폼이 아래로 내려가도록 세로 배치 */}
        <div className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-auto lg:flex-row lg:gap-[24px] lg:overflow-hidden">
          <div className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(220px,1fr))] content-start gap-[16px] pr-[4px] md:gap-[24px] lg:overflow-auto">
            {filtered.map((menu) => (
              <div
                key={menu.id}
                role="button"
                tabIndex={0}
                onClick={() => setPanel({ mode: "edit", menuId: menu.id })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setPanel({ mode: "edit", menuId: menu.id });
                  }
                }}
                className={`flex w-full cursor-pointer flex-col rounded-[25px] border bg-canvas p-[20px] transition-shadow ${
                  editing?.id === menu.id
                    ? "border-black ring-2 ring-black/40"
                    : "border-black/50"
                }`}
              >
                {/* 사진 */}
                <div className="flex h-[160px] flex-col items-center justify-center gap-[6px] rounded-[10px] border border-dashed border-black/50 text-black/50">
                  <PhotoIcon />
                  <span className="text-[18px] font-medium tracking-[1px]">사진</span>
                </div>

                <p className="mt-[20px] text-[28px] font-medium tracking-[1.5px] text-black">
                  {menu.name}
                </p>
                <p className="mt-[6px] text-[18px] font-medium tracking-[1px] text-black">
                  {menu.price.toLocaleString()}원
                </p>

                {/* 판매 상태 토글은 카드 클릭(메뉴 수정)과 분리 */}
                <div
                  className="mt-[16px] flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[18px] font-medium tracking-[1px] text-black">
                    {menu.status === "판매중" ? "판매 중" : "품절"}
                  </span>
                  <Toggle
                    checked={menu.status === "판매중"}
                    onChange={() => toggleMenuStatus(menu.id)}
                    label={`${menu.name} 판매 상태`}
                  />
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-[15px] text-black/50">이 카테고리에 등록된 메뉴가 없습니다.</p>
            )}
          </div>

          {panel.mode === "create" && (
            <MenuForm
              key="create"
              mode="create"
              categories={categories}
              defaultCategory={tab}
              onClose={closePanel}
              onSubmit={(values) => {
                addMenu({ ...values, status: "판매중" });
                closePanel();
              }}
            />
          )}

          {editing && (
            <MenuForm
              key={editing.id}
              mode="edit"
              menu={editing}
              categories={categories}
              defaultCategory={editing.category}
              onClose={closePanel}
              onSubmit={(values) => {
                updateMenu(editing.id, values);
                setTab(values.category);
                closePanel();
              }}
            />
          )}
        </div>
      </div>

      {categoryModalOpen && (
        <CategoryModal
          existing={categories}
          onClose={() => setCategoryModalOpen(false)}
          onSubmit={(name) => {
            if (!addCategory(name)) return false;
            // 추가한 카테고리를 바로 선택된 탭으로 전환
            setTab(name.trim());
            setCategoryModalOpen(false);
            return true;
          }}
        />
      )}
    </AdminShell>
  );
}

/** 카테고리 추가 모달 */
function CategoryModal({
  existing,
  onClose,
  onSubmit,
}: {
  existing: MenuCategory[];
  onClose: () => void;
  /** 추가 성공 여부 반환 */
  onSubmit: (name: string) => boolean;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("카테고리 이름을 입력해 주세요.");
      return;
    }
    if (existing.includes(trimmed)) {
      setError("이미 있는 카테고리입니다.");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[20px]"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-[25px] bg-canvas p-[24px]"
      >
        <h2 className="text-[22px] font-medium tracking-[1.5px] text-black">
          카테고리 추가
        </h2>

        <input
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="예) 사이드"
          maxLength={12}
          className="mt-[20px] h-[48px] w-full rounded-[10px] border border-black/50 bg-canvas px-[20px] text-[15px] tracking-[1px] outline-none placeholder:text-black/50 focus:border-black"
        />
        {error && (
          <p className="mt-[8px] text-[14px] font-medium text-danger">{error}</p>
        )}

        <div className="mt-[24px] flex gap-[16px]">
          <button
            type="button"
            onClick={onClose}
            className="h-[48px] flex-1 rounded-[10px] border border-black/50 bg-canvas text-[15px] font-medium tracking-[1px] text-black"
          >
            취소
          </button>
          <button
            type="submit"
            className="h-[48px] flex-[1.2] rounded-[10px] bg-black text-[15px] font-medium tracking-[1px] text-canvas"
          >
            추가
          </button>
        </div>
      </form>
    </div>
  );
}

/** 신규 등록 / 기존 메뉴 수정 공용 폼 */
function MenuForm({
  mode,
  menu,
  categories,
  defaultCategory,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  menu?: Menu;
  categories: MenuCategory[];
  defaultCategory: MenuCategory;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    price: number;
    category: MenuCategory;
    toppingAvailable: boolean;
  }) => void;
}) {
  const [name, setName] = useState(menu?.name ?? "");
  const [price, setPrice] = useState(menu ? String(menu.price) : "");
  const [category, setCategory] = useState<MenuCategory>(
    menu?.category ?? defaultCategory,
  );
  const [topping, setTopping] = useState(
    menu?.toppingAvailable === false ? "불가능" : "가능",
  );

  // 좁은 화면에서는 폼이 목록 아래에 배치되므로, 열릴 때 화면 안으로 스크롤
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    formRef.current?.scrollIntoView({ block: "start" });
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    onSubmit({
      name: name.trim(),
      price: Number(price),
      category,
      toppingAvailable: topping === "가능",
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex w-full shrink-0 flex-col rounded-[25px] border border-black/50 bg-canvas p-[24px] lg:w-[340px] lg:overflow-auto"
    >
      <h2 className="text-[26px] font-medium tracking-[2px] text-black">
        {mode === "edit" ? "메뉴 수정" : "새 메뉴 등록"}
      </h2>

      {/* 사진 첨부 */}
      <div className="mt-[20px] flex h-[200px] flex-col items-center justify-center gap-[8px] rounded-[25px] border border-dashed border-black/50 text-black/50">
        <PhotoIcon />
        <span className="text-[18px] font-medium tracking-[1.5px]">사진 첨부</span>
        <span className="text-[14px] tracking-[1px]">JPG, PNG (최대 5MB)</span>
      </div>

      <FormLabel>메뉴명</FormLabel>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="예) 참치마요 컵밥"
        className="h-[48px] rounded-[10px] border border-black/50 bg-canvas px-[24px] text-[15px] tracking-[1px] outline-none placeholder:text-black/50 focus:border-black"
      />

      <FormLabel>가격</FormLabel>
      <div className="relative">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="예) 6800"
          className="h-[48px] w-full rounded-[10px] border border-black/50 bg-canvas px-[24px] pr-[48px] text-[15px] tracking-[1px] outline-none placeholder:text-black/50 focus:border-black"
        />
        <span className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[15px] text-black/50">
          원
        </span>
      </div>

      <FormLabel>카테고리</FormLabel>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as MenuCategory)}
        className="h-[48px] rounded-[10px] border border-black/50 bg-canvas px-[20px] text-[15px] tracking-[1px] outline-none focus:border-black"
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <FormLabel>토핑 선택</FormLabel>
      <select
        value={topping}
        onChange={(e) => setTopping(e.target.value)}
        className="h-[48px] rounded-[10px] border border-black/50 bg-canvas px-[20px] text-[15px] tracking-[1px] outline-none focus:border-black"
      >
        <option value="가능">가능</option>
        <option value="불가능">불가능</option>
      </select>

      <div className="mt-[28px] flex gap-[16px]">
        <button
          type="button"
          onClick={onClose}
          className="h-[48px] flex-1 rounded-[10px] border border-black/50 bg-canvas text-[15px] font-medium tracking-[1px] text-black"
        >
          취소
        </button>
        <button
          type="submit"
          className="h-[48px] flex-[1.2] rounded-[10px] bg-black text-[15px] font-medium tracking-[1px] text-canvas"
        >
          저장
        </button>
      </div>
    </form>
  );
}

function FormLabel({ children }: { children: string }) {
  return (
    <label className="mt-[24px] mb-[10px] block text-[20px] font-medium tracking-[1.5px] text-black">
      {children}
    </label>
  );
}

function PhotoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M4 18l5-5 4 4 3-3 4 4" />
    </svg>
  );
}
