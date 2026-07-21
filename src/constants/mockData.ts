import type { Menu, Order, Payment } from "../types/admin";

// 프론트 프로토타입용 목업 데이터 (새로고침 시 초기화)

export const INITIAL_MENUS: Menu[] = [
  { id: "m1", name: "삼겹소금", price: 3600, category: "컵밥", status: "판매중", toppingAvailable: true },
  { id: "m2", name: "삼겹제육", price: 3600, category: "컵밥", status: "품절", toppingAvailable: true },
  { id: "m3", name: "참치마요", price: 3800, category: "컵밥", status: "판매중", toppingAvailable: true },
  { id: "m4", name: "김치제육", price: 3800, category: "컵밥", status: "판매중", toppingAvailable: true },
  { id: "m5", name: "냉모밀", price: 4000, category: "우동", status: "판매중", toppingAvailable: true },
  { id: "m6", name: "유부우동", price: 4500, category: "우동", status: "판매중", toppingAvailable: true },
  { id: "m7", name: "2인 세트", price: 9900, category: "세트", status: "판매중", toppingAvailable: true },
  { id: "m8", name: "4인 세트", price: 18900, category: "세트", status: "품절", toppingAvailable: true },
  { id: "m9", name: "콜라", price: 2000, category: "음료", status: "판매중", toppingAvailable: false },
  { id: "m10", name: "사이다", price: 2000, category: "음료", status: "판매중", toppingAvailable: false },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "o1",
    number: 101,
    time: "14:48",
    status: "waiting",
    called: false,
    items: [
      { name: "삼겹소금", options: ["더블", "계란후라이 추가 x 3"], cooked: false },
      { name: "냉모밀", options: [], cooked: true },
    ],
  },
  {
    id: "o2",
    number: 102,
    time: "14:48",
    status: "done",
    called: false,
    items: [
      { name: "삼겹소금", options: ["점보", "계란후라이 추가 x 3"], cooked: true },
    ],
  },
  {
    id: "o3",
    number: 103,
    time: "14:48",
    status: "waiting",
    called: false,
    items: [{ name: "냉모밀", options: [], cooked: false }],
  },
  {
    id: "o4",
    number: 104,
    time: "14:52",
    status: "waiting",
    called: false,
    items: [
      { name: "삼겹소금", options: ["더블"], cooked: false },
      { name: "콜라", options: [], cooked: false },
    ],
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: "p1",
    paidAt: "2026.07.09 14:48",
    orderNumber: 101,
    method: "카카오페이",
    amount: 11600,
    status: "결제완료",
    summary: "삼겹소금 외 1개",
  },
  {
    id: "p2",
    paidAt: "2026.07.09 14:48",
    orderNumber: 102,
    method: "애플페이",
    amount: 8600,
    status: "결제완료",
    summary: "삼겹소금",
  },
  {
    id: "p3",
    paidAt: "2026.07.09 14:48",
    orderNumber: 103,
    method: "페이코",
    amount: 5500,
    status: "결제완료",
    summary: "냉모밀",
  },
  {
    id: "p4",
    paidAt: "2026.07.09 14:48",
    orderNumber: 104,
    method: "토스페이",
    amount: 11600,
    status: "결제완료",
    summary: "삼겹소금 외 1개",
  },
];
