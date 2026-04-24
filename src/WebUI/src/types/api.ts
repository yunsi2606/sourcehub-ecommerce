export interface ServiceProjectDto {
  id: string;
  orderItemId: string | null;
  orderItemAddonId: string | null;
  serviceName: string;
  status: 'Pending' | 'InProgress' | 'InReview' | 'Completed' | 'Cancelled';
  customerNote: string | null;
  adminNote: string | null;
  startedAt: string | null;
  completedAt: string | null;
  deadlineAt: string | null;
  createdAt: string;
}

export interface ProductSummary {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  price: number;
  salePrice: number | null;
  productType: 'SourceCode' | 'StandaloneService';
  billingCycle: 'OneTime' | 'Monthly' | 'Yearly' | null;
  categoryName: string;
  tags: string[];
  thumbnailUrl: string | null;
  averageRating: number;
  totalSales: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface ProductListResponse {
  items: ProductSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  categoryId: string;
  files: ProductFile[];
  addons: ProductAddon[];
  requiresLicense: boolean;
  demoUrl: string | null;
  techStack: string | null;
}

export interface ProductFile {
  id: string;
  fileType: 'Image' | 'Video' | 'SourceCodeArchive';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  sortOrder: number;
  isPreview: boolean;
}

export interface ProductAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice?: number | null;
  productType: 'SourceCode' | 'StandaloneService';
  billingCycle?: 'OneTime' | 'Monthly' | 'Yearly' | null;
  categoryId: string;
  requiresLicense: boolean;
  demoUrl?: string | null;
  techStack?: string | null;
  tagIds: string[];
  thumbnailUrl?: string | null;
}

export interface CreateOrderRequest {
  items: CheckoutItem[];
  notes?: string;
}

export interface CheckoutItem {
  productId: string;
  quantity: number;
  selectedAddonIds?: string[];
}

export interface OrderSummary {
  id: string;
  status: string;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  userId: string;
  notes: string | null;
  items: OrderItem[];
  payments: Payment[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productThumbnail: string | null;
  priceAtPurchase: number;
  quantity: number;
  addons: OrderItemAddon[];
}

export interface OrderItemAddon {
  productAddonId: string;
  addonName: string;
  priceAtPurchase: number;
}

export interface Payment {
  id: string;
  paymentGateway: string;
  transactionId: string | null;
  amount: number;
  status: string;
  paidAt: string | null;
}

export interface DownloadUrlResponse {
  presignedUrl: string;
  fileName: string;
  fileSizeBytes: number;
  expiresAt: string;
}

export interface WishlistItem {
  productId: string;
  title: string;
  slug: string;
  price: number;
  salePrice: number | null;
  thumbnail: string | null;
  category: string;
  addedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface NotificationResponse {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  redirectUrl: string | null;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

// Blog

export interface BlogCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

export interface PostMediaDto {
  id: string;
  mediaType: 'Image' | 'Video' | 'File';
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
}

export interface PostSummaryDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  status: 'Draft' | 'Published' | 'Archived';
  authorName: string;
  authorAvatarUrl: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  tags: string[];
  viewCount: number;
  readTimeMinutes: number;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface PostDetailDto extends PostSummaryDto {
  contentJson: string;
  blogCategoryId: string | null;
  media: PostMediaDto[];
  updatedAt: string;
}

export interface PostListResponse {
  items: PostSummaryDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreatePostRequest {
  title: string;
  excerpt: string;
  contentJson: string;
  coverImageUrl?: string | null;
  blogCategoryId?: string | null;
  tagIds: string[];
  status: 'Draft' | 'Published' | 'Archived';
  isFeatured: boolean;
}

export interface BlogCategoryRequest {
  name: string;
  description?: string | null;
}
