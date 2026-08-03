import type { Category, Product } from "../types";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type MainTabsParamList = {
  Menu: undefined;
  MisPedidos: undefined;
  Admin: undefined;
};

export type OrdersStackParamList = {
  OrderHistory: undefined;
  OrderDetail: { orderId: number };
};

export type AdminStackParamList = {
  AdminHome: undefined;
  AdminCategories: undefined;
  CategoryForm: { category?: Category };
  AdminProducts: undefined;
  ProductForm: { product?: Product };
  AdminOrders: undefined;
  AdminUsers: undefined;
};
