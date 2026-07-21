import React, { createContext, useContext, useState, useMemo } from "react";
import type { CartItem, MenuDetail, MenuOption, Order, OrderStatus, NotificationItem, NotificationType } from "../types/user";

interface UserDataContextType {
  cart: CartItem[];
  orders: Order[];
  currentOrder: Order | null;
  latestOrderId: string | null;
  notifications: NotificationItem[];
  addToCart: (menu: MenuDetail, selectedOptions: MenuOption[], quantity: number) => void;
  updateCartQuantity: (cartItemId: string, newQuantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  createOrder: (paymentMethod: string) => Promise<Order>;
  getOrderById: (orderId: string) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cartTotal: number;
  addNotification: (type: NotificationType, title: string, message: string, orderId: string) => void;
  markAsRead: (id: string) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 알림 추가 헬퍼
  const addNotification = (type: NotificationType, title: string, message: string, orderId: string) => {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newNotification: NotificationItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      orderId,
      createdAt: timeString,
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // 알림 읽음 처리
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // 장바구니 고유 ID 생성 (menuId + 정렬된 옵션 ID들의 조합)
  const generateCartItemId = (menuId: number, options: MenuOption[]): string => {
    const sortedOptionIds = [...options].map((o) => o.id).sort((a, b) => a - b);
    return `${menuId}-${sortedOptionIds.join("-")}`;
  };

  // 장바구니 아이템 추가
  const addToCart = (menu: MenuDetail, selectedOptions: MenuOption[], quantity: number) => {
    const cartItemId = generateCartItemId(menu.id, selectedOptions);

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);

      // 단일 품목의 총액 = (메뉴 기본가 + 선택한 옵션 추가금들의 합) * 수량
      const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.additionalPrice, 0);
      const singleItemPrice = menu.basePrice + optionsPrice;

      if (existingItemIndex > -1) {
        // 이미 동일한 메뉴와 옵션 조합이 장바구니에 있는 경우 수량 누적
        const updatedCart = [...prevCart];
        const existingItem = updatedCart[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          totalPrice: singleItemPrice * newQuantity,
        };
        return updatedCart;
      } else {
        // 새로운 조합인 경우 추가
        const newItem: CartItem = {
          cartItemId,
          menuId: menu.id,
          menuName: menu.name,
          basePrice: menu.basePrice,
          imageUrl: menu.imageUrl,
          selectedOptions,
          quantity,
          totalPrice: singleItemPrice * quantity,
        };
        return [...prevCart, newItem];
      }
    });
  };

  // 장바구니 수량 수정
  const updateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.cartItemId === cartItemId) {
          const optionsPrice = item.selectedOptions.reduce((sum, opt) => sum + opt.additionalPrice, 0);
          const singleItemPrice = item.basePrice + optionsPrice;
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: singleItemPrice * newQuantity,
          };
        }
        return item;
      })
    );
  };

  // 장바구니 아이템 삭제
  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  // 장바구니 비우기
  const clearCart = () => {
    setCart([]);
  };

  // 장바구니 총합 계산
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  // 주문서 작성 및 결제 시뮬레이션
  const createOrder = async (paymentMethod: string): Promise<Order> => {
    // 네트워크 딜레이 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 200));

    console.log("Mock Payment Completed via:", paymentMethod);

    // 주문 접수 대기번호: 103부터 순차 증가 또는 랜덤 생성
    const randomSuffix = Math.floor(Math.random() * 90) + 10; // 10 ~ 99
    const pickupNumber = "103";
    const orderId = `A103-${randomSuffix}${Math.floor(Math.random() * 9000 + 1000)}`;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newOrder: Order = {
      orderId,
      items: [...cart],
      totalPrice: cartTotal,
      status: "PENDING",
      createdAt: formattedDate,
      pickupNumber,
      waitingCount: 2,
      waitingTime: 5,
    };

    setOrders((prevOrders) => [...prevOrders, newOrder]);
    setCurrentOrder(newOrder);
    setLatestOrderId(orderId);
    // 주문 완료 후 장바구니 비우기
    setCart([]);

    // 주문 생성 알림 자동 추가
    addNotification(
      "ORDER_CREATED",
      "주문 접수 완료",
      `${pickupNumber}번 주문이 접수되었습니다.`,
      orderId
    );

    return newOrder;
  };

  // 특정 주문 정보 조회
  const getOrderById = (orderId: string): Order | null => {
    const found = orders.find((o) => o.orderId === orderId);
    if (found) return found;
    if (currentOrder && currentOrder.orderId === orderId) return currentOrder;
    return null;
  };

  // 주문 상태 업데이트 (시연용 자동 상태 전환을 위한 컨트롤러)
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const update = (prevOrders: Order[]) =>
      prevOrders.map((o) => {
        if (o.orderId === orderId) {
          let count = o.waitingCount;
          let time = o.waitingTime;
          if (status === "READY" || status === "COMPLETED") {
            count = 0;
            time = 0;
          }
          return { ...o, status, waitingCount: count, waitingTime: time };
        }
        return o;
      });

    setOrders(update);
    if (currentOrder && currentOrder.orderId === orderId) {
      setCurrentOrder((prev) => {
        if (!prev) return null;
        let count = prev.waitingCount;
        let time = prev.waitingTime;
        if (status === "READY" || status === "COMPLETED") {
          count = 0;
          time = 0;
        }
        return { ...prev, status, waitingCount: count, waitingTime: time };
      });
    }
  };

  return (
    <UserDataContext.Provider
      value={{
        cart,
        orders,
        currentOrder,
        latestOrderId,
        notifications,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        createOrder,
        getOrderById,
        updateOrderStatus,
        cartTotal,
        addNotification,
        markAsRead,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
