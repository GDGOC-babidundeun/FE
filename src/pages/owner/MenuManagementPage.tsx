import { useState, type FormEvent } from "react";
import AdminShell from "../../components/AdminShell";
import Toggle from "../../components/Toggle";
import { useAdminData } from "../../store/AdminDataContext";
import type { MenuCategory } from "../../types/admin";

const CATEGORIES: MenuCategory[] = ["컵밥", "우동", "세트", "음료"];

export default function MenuManagementPage() {
  const { menus, toggleMenuStatus, addMenu } = useAdminData();
  const [tab, setTab] = useState<MenuCategory>("컵밥");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = menus.filter((m) => m.category === tab);

  return (
    <AdminShell>
      <div className="flex h-full flex-col p-[32px]">
        {/* 헤더 */}
        <div className="mb-[24px] flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-black">메뉴 관리</h1>
          <button
            onClick={() => setFormOpen(true)}
            className="h-[48px] rounded-[10px] border border-black/50 bg-black px-[20px] text-[15px] font-medium tracking-[1px] text-white"
          >
            + 새 메뉴 등록
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div className="mb-[24px] flex gap-[16px]">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setTab(c)}
              className={`h-[48px] rounded-[10px] border border-black/50 px-[24px] text-[15px] font-medium tracking-[1px] ${
                tab === c ? "bg-black text-white" : "bg-canvas text-black"
              }`}
            >
              {c}
            </button>
          ))}
          <button className="h-[48px] rounded-[10px] border border-black/50 bg-canvas px-[24px] text-[15px] font-medium tracking-[1px] text-black opacity-50">
            + 카테고리 추가
          </button>
        </div>

        {/* 본문: 메뉴 그리드 + (등록 폼) */}
        <div className="flex flex-1 gap-[24px] overflow-hidden">
          <div className="flex flex-1 flex-wrap content-start gap-[24px] overflow-auto pr-[4px]">
            {filtered.map((menu) => (
              <div
                key={menu.id}
                className="flex w-[300px] flex-col rounded-[25px] border border-black/50 bg-canvas p-[20px]"
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

                <div className="mt-[16px] flex items-center justify-between">
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

          {formOpen && (
            <NewMenuForm
              defaultCategory={tab}
              onClose={() => setFormOpen(false)}
              onSubmit={(menu) => {
                addMenu(menu);
                setFormOpen(false);
              }}
            />
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function NewMenuForm({
  defaultCategory,
  onClose,
  onSubmit,
}: {
  defaultCategory: MenuCategory;
  onClose: () => void;
  onSubmit: (menu: {
    name: string;
    price: number;
    category: MenuCategory;
    status: "판매중" | "품절";
  }) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<MenuCategory>(defaultCategory);
  const [topping, setTopping] = useState("가능");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    onSubmit({
      name: name.trim(),
      price: Number(price),
      category,
      status: "판매중",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-[380px] shrink-0 flex-col overflow-auto rounded-[25px] border border-black/50 bg-canvas p-[24px]"
    >
      <h2 className="text-[26px] font-medium tracking-[2px] text-black">새 메뉴 등록</h2>

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
        {CATEGORIES.map((c) => (
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
