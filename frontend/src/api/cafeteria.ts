import { api } from "./client";
import type { Category, LoginResponse, Order, Product, User } from "../types";

// ---------- FormData helpers ----------
function filePart(uri: string, field: string, name = "face.jpg") {
  const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
  const mime =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return { name: field, uri, type: mime, fileName: `${name}.${ext}` };
}

// ---------- Autenticación / Usuarios ----------
export async function loginWithFace(photoUri: string): Promise<LoginResponse> {
  const form = new FormData();
  form.append("face_image", filePart(photoUri, "face_image", "login") as any);
  const { data } = await api.post<LoginResponse>("/auth/login", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function registerUser(params: {
  fullName: string;
  email: string;
  role: string;
  photoUri: string;
}): Promise<User> {
  const form = new FormData();
  form.append("full_name", params.fullName);
  form.append("email", params.email);
  form.append("role", params.role);
  form.append(
    "face_image",
    filePart(params.photoUri, "face_image", "register") as any
  );
  const { data } = await api.post<User>("/users", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users");
  return data;
}

// ---------- Categorías ----------
export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/categories");
  return data;
}

export async function createCategory(payload: {
  name: string;
  description?: string;
}): Promise<Category> {
  const { data } = await api.post<Category>("/categories", payload);
  return data;
}

export async function updateCategory(
  id: number,
  payload: { name?: string; description?: string }
): Promise<Category> {
  const { data } = await api.put<Category>(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}

// ---------- Productos ----------
export async function getProducts(includeInactive = false): Promise<Product[]> {
  const { data } = await api.get<Product[]>("/products", {
    params: includeInactive ? { include_inactive: true } : undefined,
  });
  return data;
}

export async function createProduct(payload: {
  name: string;
  description?: string;
  price: number;
  category_id: number;
}): Promise<Product> {
  const { data } = await api.post<Product>("/products", payload);
  return data;
}

export async function updateProduct(
  id: number,
  payload: Partial<{
    name: string;
    description: string;
    price: number;
    category_id: number;
    is_active: boolean;
  }>
): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}

// ---------- Órdenes ----------
export async function createOrder(payload: {
  user_id: number;
  items: { product_id: number; quantity: number }[];
}): Promise<Order> {
  const { data } = await api.post<Order>("/orders", payload);
  return data;
}

export async function getOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>("/orders");
  return data;
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  const { data } = await api.get<Order[]>(`/orders/user/${userId}`);
  return data;
}

export async function getOrder(id: number): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id: number, status: string): Promise<Order> {
  const { data } = await api.put<Order>(`/orders/${id}/status`, { status });
  return data;
}
