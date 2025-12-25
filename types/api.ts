
export enum UserStatus {
  Active = 0,
  Inactive = 1,
  Banned = 2,
  Suspended = 3
}

export enum PostStatus {
  Draft = 0,
  PendingReview = 1,
  Active = 2,
  Sold = 3,
  Expired = 4,
  Rejected = 5,
  Removed = 6,
  Deleted = 7
}

export enum RoleID {
  Admin = 1,
  User = 2,
  Moderator = 3
}

export interface PhoneNumber {
  phoneID: number;
  userID: number;
  phoneNumber: string;
  isPrimary: boolean;
  createdAt: string;
  isDeleted: boolean;
}

export interface User {
  userID: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string | null;
  joinDate: string;
  status: UserStatus;
  roleID: RoleID;
  isDeleted: boolean;
  fullName: string;
  primaryPhone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
  role: string;
}

export interface Category {
  categoryID: number;
  categoryName: string;
  createdAt: string;
  isDeleted: boolean;
}

export interface Post {
  postID: number;
  userID: number;
  categoryID: number;
  postTitle: string;
  postDescription: string;
  price: number;
  status: PostStatus;
  createdAt: string;
  isDeleted: boolean;
}

export interface PostDetails extends Post {
  ownerUserID: number;
  ownerUsername: string;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerFullName: string;
  roleID: RoleID;
  roleName: string;
  categoryName: string;
  reviews: Review[];
  images: PostImage[];
  reviewCount: number;
  averageRating: number;
  imageCount: number;
  primaryImageUrl: string;
}

export interface PostImage {
  postImageID: number;
  postID: number;
  postImageURL: string;
  uploadedAt: string;
  isDeleted?: boolean;
}

export interface UserImage {
  userImageID: number;
  userID: number;
  imageURL: string;
  uploadedAt: string;
  isDeleted: boolean;
}

export interface Review {
  reviewID: number;
  postID: number;
  userID: number;
  rating: number;
  reviewText: string;
  createdAt: string;
  isDeleted: boolean;
  reviewerUsername?: string;
  reviewerFullName?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  rowsPerPage: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminDashboardStats {
  generatedAt: string;
  totalUsers: number;
  activeUsers: number;
  deletedUsers: number;
  totalPosts: number;
  activePosts: number;
  deletedPosts: number;
  draftPosts: number;
  pendingReviewPosts: number;
  publishedPosts: number;
  totalCategories: number;
  totalRoles: number;
}
