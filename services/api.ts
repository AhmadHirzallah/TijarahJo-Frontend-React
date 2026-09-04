/**
 * API Service Layer for TijarahJo
 *
 * This service provides a clean interface for all backend API calls.
 * Replace the mock data with actual API endpoints when backend is ready.
 */

import {
  LoginRequest,
  SignUpRequest,
  AuthResponse,
  CreatePostRequest,
  UpdatePostRequest,
  UpdatePostStatusRequest,
  PostResponse,
  PostsListResponse,
  ApiResponse,
  SearchRequest,
  CategoriesResponse,
} from "../types/api";
import { Product } from "../types";
import { normalizeUserRole } from "../utils/roleUtils";

// ============================================================================
// Configuration
// ============================================================================

// Vite uses import.meta.env instead of process.env
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5033/api";

// Mock mode disabled - using real backend API only
// const MOCK_MODE = false; // Removed mock mode completely

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem("tijarahjo_token");

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    // Check if response has content
    const text = await response.text();

    // If response is empty, return appropriate response
    if (!text || text.trim().length === 0) {
      if (response.ok) {
        return { success: true, data: null as any };
      } else {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: response.statusText || "An error occurred",
            details: null,
          },
        };
      }
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      // If not JSON, check if it's a plain text error message
      // Backend sometimes returns plain text errors (especially 500 errors)
      if (!response.ok && text) {
        // Return the plain text as the error message
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: text.trim(),
            details: { rawResponse: text },
          },
        };
      }

      // If response is OK but not JSON, that's unexpected
      if (response.ok) {
        // Try to return as success with text data
        return {
          success: true,
          data: text as any,
        };
      }

      // If not JSON and not OK, return error
      return {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: text ? text.substring(0, 100) : "Invalid JSON response from server",
          details: { rawResponse: text },
        },
      };
    }

    if (!response.ok) {
      // For BadRequest (400), the error details are in the response body
      // ASP.NET Core returns AuthResponse with Message property
      const errorMessage =
        data.message ||
        data.Message ||
        data.error?.message ||
        data.error?.Message ||
        response.statusText ||
        "An error occurred";

      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: errorMessage,
          details: data,
        },
      };
    }

    return { success: true, data };
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: {
            code: "TIMEOUT",
            message:
              "Request timed out. Please check if the backend is running on http://localhost:5033",
          },
        };
      }
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("ERR_CONNECTION_REFUSED") ||
        error.message.includes("NetworkError")
      ) {
        return {
          success: false,
          error: {
            code: "CONNECTION_REFUSED",
            message:
              "Cannot connect to backend. Please make sure the backend is running on http://localhost:5033. Start it with: cd TijarahJo-Backend/TijarahJoDBAPI && dotnet run",
          },
        };
      }
    }

    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Network error. Please check if the backend is running.",
      },
    };
  }
}

// ============================================================================
// Authentication API
// ============================================================================

export const authApi = {
  /**
   * Login user with username/email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    // Real API call - map frontend format to backend format
    const response = await apiRequest<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        Login: credentials.usernameOrEmail, // Backend expects "Login" not "usernameOrEmail"
        Password: credentials.password,
      }),
    });

    if (response.success && response.data) {
      // Map backend response to frontend format
      const backendResponse = response.data;

      // Check if backend returned an error in the data (AuthResponse with Success: false)
      // This can happen with 401 Unauthorized or 400 BadRequest where backend returns 200 OK but Success: false
      if (backendResponse.Success === false) {
        const errorMessage =
          backendResponse.Message || "Login failed. Please try again.";
        return {
          success: false,
          message: errorMessage,
          error: {
            code: "LOGIN_FAILED",
            message: errorMessage,
          },
        } as any;
      }

      // If Success is true (or not explicitly false) and Token exists, proceed
      if (backendResponse.Success !== false && backendResponse.Token) {
        localStorage.setItem("tijarahjo_token", backendResponse.Token);

        // Transform backend UserResponseDTO to frontend User format
        if (backendResponse.User) {
          const user = backendResponse.User;
          const transformedUser = {
            id: (user.Id || user.id || "").toString(),
            firstName: user.FirstName || user.firstName || "",
            lastName: user.LastName || user.lastName || "",
            username: user.Username || user.username || "",
            email: user.Email || user.email || "",
            phone: user.Phone || user.phone || "",
            city: user.City || user.city || "",
            area: user.Area || user.area || "",
            bio: user.Bio || user.bio || "",
            avatar: user.Avatar || user.avatar || undefined,
            role: normalizeUserRole(
              user.Role || user.role || backendResponse.Role
            ),
            joinedDate: user.JoinedDate
              ? new Date(user.JoinedDate).toISOString()
              : user.joinedDate
              ? new Date(user.joinedDate).toISOString()
              : "",
            createdAt: user.JoinedDate
              ? new Date(user.JoinedDate).toISOString()
              : user.joinedDate
              ? new Date(user.joinedDate).toISOString()
              : "",
            updatedAt: "",
          };
          return {
            success: true,
            token: backendResponse.Token,
            user: transformedUser,
          } as any;
        } else {
          // Return success with token, user data will be fetched separately
          return {
            success: true,
            token: backendResponse.Token,
            message: backendResponse.Message || "Login successful",
          } as any;
        }
      }

      // If we reach here, something is wrong with the response
      return {
        success: false,
        message: backendResponse.Message || "Login failed. Invalid response from server.",
        error: {
          code: "INVALID_RESPONSE",
          message: "Invalid response structure from server",
        },
      } as any;
    }

    // If we get here, response.success is false or response.data is missing
    // Extract error message from response
    let errorMessage = "Login failed. Please try again.";

    // When backend returns error, check multiple places for the error message
    if (!response.success) {
      // Check response.error.details (AuthResponse object from backend)
      if (response.error && response.error.details) {
        const details = response.error.details as any;
        if (details.Message) {
          errorMessage = details.Message;
        } else if (details.message) {
          errorMessage = details.message;
        } else if (details.Success === false && details.Message) {
          errorMessage = details.Message;
        }
      }

      // If no message in details, use the error message from apiRequest
      if (
        errorMessage === "Login failed. Please try again." &&
        response.error &&
        response.error.message
      ) {
        errorMessage = response.error.message;
      }

      // Connection errors
      if (response.error && response.error.code === "CONNECTION_REFUSED") {
        errorMessage =
          "Cannot connect to backend. Please make sure the backend is running on http://localhost:5033";
      }
    } else if (response.success && response.data) {
      // Check if data contains error (backend returned 200 OK but Success: false)
      const data = response.data as any;
      if (data.Success === false && data.Message) {
        errorMessage = data.Message;
      }
    }

    return {
      success: false,
      message: errorMessage,
      error: {
        code: "LOGIN_FAILED",
        message: errorMessage,
      },
    } as any;
  },

  /**
   * Sign up new user
   */
  signup: async (userData: SignUpRequest): Promise<AuthResponse> => {
    // Real API call - map frontend format to backend format
    const response = await apiRequest<any>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        Username: userData.username,
        Email: userData.email,
        Password: userData.password,
        FirstName: userData.firstName,
        LastName: userData.lastName || "",
        Phone: userData.phone || null,
        City: userData.city || null,
        Area: userData.area || null,
      }),
    });

    if (response.success && response.data) {
      // Map backend response to frontend format
      const backendResponse = response.data;

      // Check if backend returned an error in the data (AuthResponse with Success: false)
      // This can happen if backend returns 201 Created but with Success: false in body
      if (backendResponse.Success === false) {
        const errorMessage =
          backendResponse.Message || "Registration failed. Please try again.";
        return {
          success: false,
          message: errorMessage,
          error: {
            code: "SIGNUP_FAILED",
            message: errorMessage,
          },
        } as any;
      }

      // If Success is true (or not explicitly false) and Token exists, proceed
      if (backendResponse.Success !== false && backendResponse.Token) {
        localStorage.setItem("tijarahjo_token", backendResponse.Token);

        // Transform backend UserResponseDTO to frontend User format
        if (backendResponse.User) {
          const user = backendResponse.User;
          return {
            success: true,
            token: backendResponse.Token,
            user: {
              id: (user.Id || user.id || "").toString(),
              firstName: user.FirstName || user.firstName || "",
              lastName: user.LastName || user.lastName || "",
              username: user.Username || user.username || "",
              email: user.Email || user.email || "",
              phone: user.Phone || user.phone || "",
              city: user.City || user.city || "",
              area: user.Area || user.area || "",
              bio: user.Bio || user.bio || "",
              avatar: user.Avatar || user.avatar || undefined,
              role: normalizeUserRole(
                user.Role || user.role || backendResponse.Role
              ),
              joinedDate: user.JoinedDate
                ? new Date(user.JoinedDate).toISOString()
                : user.joinedDate
                ? new Date(user.joinedDate).toISOString()
                : "",
              createdAt: user.JoinedDate
                ? new Date(user.JoinedDate).toISOString()
                : user.joinedDate
                ? new Date(user.joinedDate).toISOString()
                : "",
              updatedAt: "",
            },
          } as any;
        } else {
          // Token exists but no user object - return success with token
          return {
            success: true,
            token: backendResponse.Token,
            message: backendResponse.Message || "Registration successful",
          } as any;
        }
      }

      // If we reach here, something is wrong with the response
      return {
        success: false,
        message: backendResponse.Message || "Registration failed. Invalid response from server.",
        error: {
          code: "INVALID_RESPONSE",
          message: "Invalid response structure from server",
        },
      } as any;
    }

    // Extract error message from response
    let errorMessage = "Registration failed. Please try again.";

    // When backend returns error, check multiple places for the error message
    if (!response.success) {
      // Check response.error.details (AuthResponse object from backend)
      if (response.error && response.error.details) {
        const details = response.error.details as any;
        if (details.Message) {
          errorMessage = details.Message;
        } else if (details.message) {
          errorMessage = details.message;
        } else if (details.Success === false && details.Message) {
          errorMessage = details.Message;
        }
      }

      // If no message in details, use the error message from apiRequest
      if (
        errorMessage === "Registration failed. Please try again." &&
        response.error &&
        response.error.message
      ) {
        const errorStr = response.error.message;

        // Check for unique constraint violations in the error message
        if (
          errorStr.includes("UNIQUE KEY constraint") ||
          errorStr.includes("UQ_TbUsers")
        ) {
          if (
            errorStr.includes("UQ_TbUsers_Username") ||
            errorStr.includes("Username")
          ) {
            errorMessage =
              "An account with this username already exists. Please choose a different username.";
          } else if (
            errorStr.includes("UQ_TbUsers_E") ||
            errorStr.includes("UQ_TbUsers_Email") ||
            errorStr.includes("Email")
          ) {
            errorMessage =
              "An account with this email address already exists. Please use a different email or try logging in.";
          } else {
            errorMessage =
              "An account with this information already exists. Please check your details and try again.";
          }
        } else {
          errorMessage = errorStr;
        }
      }
      // Connection errors
      if (response.error && response.error.code === "CONNECTION_REFUSED") {
        errorMessage =
          "Cannot connect to backend. Please make sure the backend is running on http://localhost:5033";
      }
    }

    return {
      success: false,
      message: errorMessage,
      error: {
        code: "SIGNUP_FAILED",
        message: errorMessage,
      },
    } as any;
  },

  /**
   * Register new user (alias for signup, legacy compatibility)
   */
  register: async (
    email: string,
    password: string,
    name: string,
    username?: string,
    phone?: string,
    city?: string,
    area?: string
  ): Promise<any> => {
    // Split name into first and last name
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || nameParts[0] || "";

    const userData: any = {
      email: email.trim(),
      password: password,
      firstName: firstName,
      lastName: lastName,
      username: username || email.split("@")[0],
      phone: phone || "",
      city: city || "Amman",
      area: area || "",
    };

    // Use signup function
    const result = await authApi.signup(userData);

    if (result.success) {
      return { success: true, data: result };
    }

    return {
      success: false,
      error: result.message,
    };
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // Client-side logout must still complete if the API is unavailable.
    }
    localStorage.removeItem("tijarahjo_token");
    localStorage.removeItem("tijarahjo_auth");
    localStorage.removeItem("tijarahjo_user");
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async () => {
    return await apiRequest("/auth/me", { method: "GET" });
  },
};

// ============================================================================
// Helper Functions: Transform Backend Models to Frontend Types
// ============================================================================

/**
 * Helper function to fetch and cache categories and users for enriching posts
 */
let categoriesCache: Record<number, string> | null = null;
let usersCache: Record<number, string> | null = null;

/**
 * Clear caches - call this when data might have changed (e.g., after creating a post)
 */
export function clearCaches() {
  categoriesCache = null;
  usersCache = null;
}

async function enrichPostsWithCategoryAndSeller(posts: any[]): Promise<any[]> {
  // Listing responses already contain these display fields. The reference-data
  // calls below fill them in for the smaller create/get-by-id responses.
  if (categoriesCache === null) {
    categoriesCache = {};
    const categoriesResponse = await apiRequest<any[]>("/categories", {
      method: "GET",
    });
    const categories = categoriesResponse.success
      ? categoriesResponse.data || []
      : [];
    categories.forEach((category: any) => {
      const categoryId = category.CategoryID || category.categoryID;
      const categoryName = category.CategoryName || category.categoryName;
      if (categoryId && categoryName) categoriesCache![categoryId] = categoryName;
    });
  }

  if (usersCache === null) usersCache = {};
  const missingUserIds = [
    ...new Set(
      posts
        .filter(
          (post) =>
            !post.SellerFullName &&
            !post.Username &&
            !post.Seller &&
            post.UserID != null &&
            !usersCache![post.UserID]
        )
        .map((post) => Number(post.UserID))
        .filter((id) => Number.isInteger(id) && id > 0)
    ),
  ];

  await Promise.all(
    missingUserIds.map(async (userId) => {
      const userResponse = await apiRequest<any>(`/users/${userId}`, {
        method: "GET",
      });
      if (!userResponse.success || !userResponse.data) return;

      const user = userResponse.data;
      const displayName =
        user.Username ||
        [user.FirstName, user.LastName].filter(Boolean).join(" ") ||
        `User ${userId}`;
      usersCache![userId] = displayName;
    })
  );

  // Enrich posts with category and seller names
  return posts.map((post: any) => {
    const categoryId = post.CategoryID || post.categoryID;
    const userId = post.UserID || post.userID;

    // Convert userId to both formats for lookup
    const userIdNum = userId !== null && userId !== undefined
      ? (typeof userId === 'string' ? parseInt(userId, 10) : userId)
      : null;
    const userIdStr = userIdNum !== null ? userIdNum.toString() : null;

    // Try to find user in cache with flexible matching
    let sellerName =
      post.SellerFullName ||
      post.Username ||
      post.Seller ||
      "Unknown";
    if (userIdNum !== null && !isNaN(userIdNum)) {
      sellerName =
        usersCache![userIdNum] ||
        usersCache![userIdStr || ""] ||
        sellerName;
    }

    return {
      ...post,
      Category:
        post.CategoryName ||
        post.Category ||
        categoriesCache![categoryId] ||
        "Unknown",
      Seller: sellerName,
    };
  });
}

interface PostImageRecord {
  PostImageID?: number;
  PostImageURL?: string;
  IsDeleted?: boolean;
}

function imageUrlsFromPayload(payload: any): string[] {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.Images)
    ? payload.Images
    : [];

  return records
    .filter((image: PostImageRecord) => !image.IsDeleted)
    .map((image: PostImageRecord) => image.PostImageURL || "")
    .filter((url: string) => url.trim().length > 0);
}

async function fetchPostImages(postId: string | number): Promise<PostImageRecord[]> {
  const response = await apiRequest<any>(`/posts/${postId}/images`, {
    method: "GET",
  });

  if (!response.success || !response.data) return [];

  const records = Array.isArray(response.data)
    ? response.data
    : response.data.Images;
  return Array.isArray(records)
    ? records.filter((image: PostImageRecord) => !image.IsDeleted)
    : [];
}

async function createPostImage(postId: string | number, imageUrl: string) {
  const isBase64Image = imageUrl.startsWith("data:image/");
  return apiRequest<any>(
    `/posts/${postId}/images${isBase64Image ? "/upload-base64" : ""}`,
    {
      method: "POST",
      body: JSON.stringify(
        isBase64Image
          ? { ImageData: imageUrl }
          : { PostImageURL: imageUrl }
      ),
    }
  );
}

/**
 * Transform backend PostModel to frontend Product type
 */
function transformPostModelToProduct(
  postModel: any,
  images: string[] = [],
  fallbackIndex?: number
): Product {
  const embeddedImages = imageUrlsFromPayload(postModel.Images);
  const primaryImage =
    postModel.PrimaryImageUrl || postModel.PostImageURL || "";
  const postImages =
    images.length > 0
      ? images
      : embeddedImages.length > 0
      ? embeddedImages
      : [primaryImage].filter(Boolean);

  // Ensure we always have a unique ID - use fallback index if needed
  const postId = postModel.PostID?.toString() || postModel.id;
  const uniqueId =
    postId ||
    (fallbackIndex !== undefined
      ? `post-${fallbackIndex}`
      : `post-${Date.now()}-${Math.random()}`);

  const name = postModel.PostTitle ?? postModel.name ?? "";
  const description = postModel.PostDescription ?? postModel.description ?? "";

  return {
    id: uniqueId,
    name: name,
    price: postModel.Price ?? postModel.price ?? 0,
    location: postModel.City ?? postModel.Location ?? "Jordan",
    area: postModel.Area ?? postModel.area,
    seller: postModel.Seller ?? postModel.seller ?? "Unknown",
    sellerId:
      postModel.UserID?.toString() ??
      postModel.UserId?.toString() ??
      postModel.sellerId ??
      "",
    category: postModel.Category ?? postModel.category ?? "Unknown",
    categoryId:
      postModel.CategoryID?.toString() ??
      postModel.CategoryId?.toString() ??
      postModel.categoryId ??
      "",
    image: postImages[0] ?? "",
    images: postImages,
    phone: postModel.OwnerPhone ?? postModel.Phone ?? postModel.phone,
    description: description,
    createdAt: postModel.CreatedAt
      ? new Date(postModel.CreatedAt).toISOString()
      : postModel.createdAt
      ? new Date(postModel.createdAt).toISOString()
      : undefined,
    views: postModel.Views ?? postModel.views ?? 0,
    status: postModel.IsDeleted
      ? "DELETED"
      : postModel.Status === 0
      ? "DRAFT"
      : postModel.Status === 1
      ? "PENDING"
      : postModel.Status === 2
      ? "ACTIVE"
      : postModel.Status === 3
      ? "SOLD"
      : postModel.Status === 4
      ? "EXPIRED"
      : postModel.Status === 5
      ? "REJECTED"
      : postModel.Status === 6
      ? "REMOVED"
      : "DRAFT",
  };
}

/**
 * Transform backend CategoryModel to frontend Category type (from api.ts)
 */
function transformCategoryModelToCategory(
  categoryModel: any,
  fallbackIndex?: number
): import("../types/api").Category {
  const categoryId = categoryModel.CategoryID?.toString() || categoryModel.id;
  const uniqueId =
    categoryId ||
    (fallbackIndex !== undefined
      ? `category-${fallbackIndex}`
      : `category-${Date.now()}-${Math.random()}`);

  return {
    id: uniqueId,
    name: categoryModel.CategoryName || categoryModel.name || "",
    nameAr: categoryModel.CategoryName || categoryModel.name || "", // Use same as name for now
    icon: categoryModel.Icon || categoryModel.icon || "",
    color: categoryModel.Color || categoryModel.color || "#0A4ABF",
    image: categoryModel.Image || categoryModel.image || "",
    postCount: 0, // Will be calculated separately if needed
  };
}

// ============================================================================
// Posts/Products API
// ============================================================================

export const postsApi = {
  /**
   * Get all posts with optional filters and pagination
   */
  getPosts: async (params?: SearchRequest): Promise<PostsListResponse> => {
    const pageNumber = params?.page || 1;
    const rowsPerPage = Math.min(params?.limit || 100, 100);
    const query = new URLSearchParams({
      PageNumber: pageNumber.toString(),
      RowsPerPage: rowsPerPage.toString(),
      IncludeDeleted: "false",
    });

    if (params?.category && /^\d+$/.test(params.category)) {
      query.set("CategoryID", params.category);
    }

    const response = await apiRequest<any>(
      `/posts/paginated?${query.toString()}`,
      { method: "GET" }
    );

    if (!response.success && response.error.code !== "HTTP_404") {
      return {
        success: false,
        posts: [],
        pagination: {
          currentPage: pageNumber,
          totalPages: 0,
          totalPosts: 0,
          postsPerPage: rowsPerPage,
        },
        error: {
          message: response.error.message,
          code: response.error.code,
        },
      };
    }

    const publicItems =
      response.success && Array.isArray(response.data?.Items)
        ? response.data.Items
        : [];
    let items = publicItems;

    // The marketplace feed remains public-only, while the shared collection
    // also carries the signed-in user's drafts/pending posts for their profile.
    if (!params && localStorage.getItem("tijarahjo_token")) {
      const ownResponse = await apiRequest<any>(
        "/posts/my?PageNumber=1&RowsPerPage=100&IncludeDeleted=false",
        { method: "GET" }
      );
      const ownItems =
        ownResponse.success && Array.isArray(ownResponse.data?.Items)
          ? ownResponse.data.Items
          : [];
      const byId = new Map<string, any>();
      [...publicItems, ...ownItems].forEach((post) => {
        if (post.PostID != null) byId.set(post.PostID.toString(), post);
      });
      items = [...byId.values()];
    }

    const enrichedPosts = await enrichPostsWithCategoryAndSeller(items);
    const posts = enrichedPosts.map((post: any, index: number) =>
      transformPostModelToProduct(post, [], index)
    );

    return {
      success: true,
      posts,
      pagination: {
        currentPage:
          response.success && response.data?.PageNumber
            ? response.data.PageNumber
            : pageNumber,
        totalPages:
          response.success && response.data?.TotalPages
            ? response.data.TotalPages
            : 0,
        totalPosts:
          response.success && response.data?.TotalCount != null
            ? response.data.TotalCount
            : publicItems.length,
        postsPerPage:
          response.success && response.data?.RowsPerPage
            ? response.data.RowsPerPage
            : rowsPerPage,
      },
    };
  },

  /**
   * Get single post by ID
   */
  getPost: async (id: string): Promise<Product | null> => {
    const response = await apiRequest<any>(`/posts/${id}`, {
      method: "GET",
    });

    if (response.success && response.data) {
      const postImages = imageUrlsFromPayload(await fetchPostImages(id));

      // Enrich post with category and seller names before transforming
      const enrichedPost = await enrichPostsWithCategoryAndSeller([response.data]);
      const enrichedPostData = enrichedPost[0] || response.data;

      return transformPostModelToProduct(enrichedPostData, postImages);
    }

    return null;
  },

  /**
   * Create new post
   */
  createPost: async (postData: CreatePostRequest): Promise<PostResponse> => {
    // Ownership comes from the authenticated token on the backend.
    if (!localStorage.getItem("tijarahjo_token")) {
      const errorMsg =
        "Cannot create post: User not authenticated. Please log in first.";
      return {
        success: false,
        message: errorMsg,
        error: {
          code: "UNAUTHORIZED",
          message: errorMsg,
        },
      } as any;
    }

    // Find category ID by name
    const categoriesResponse = await apiRequest<any[]>(
      "/categories",
      { method: "GET" }
    );
    const categories = categoriesResponse.success
      ? categoriesResponse.data || []
      : [];
    const category = categories.find(
      (cat: any) =>
        cat.CategoryName?.toLowerCase() ===
        (postData.category || "").toLowerCase()
    );
    const categoryId =
      category?.CategoryID || parseInt(postData.category || "1") || 1;

    // Map frontend format to backend PostModel format
    const backendPost = {
      CategoryID: categoryId,
      PostTitle: postData.title,
      PostDescription: postData.description || "",
      Price: postData.price,
      City: postData.city || "Jordan",
      Area: postData.area || null,
    };

    const response = await apiRequest<any>("/posts", {
      method: "POST",
      body: JSON.stringify(backendPost),
    });

    if (response.success && response.data) {
      const postId = response.data.PostID || response.data.postID;

      // Create post images
      const savedImageUrls: string[] = [];
      if (postData.images && postData.images.length > 0) {
        const imagePromises = postData.images.map(async (imageUrl) => {
          if (!imageUrl || imageUrl.trim() === "") {
            return null;
          }

          try {
            const imageResponse = await createPostImage(postId, imageUrl);

            if (imageResponse.success && imageResponse.data) {
              return imageUrl;
            }
            return null;
          } catch (error) {
            console.error("[createPost] Error creating image:", error);
            return null;
          }
        });

        const imageResults = await Promise.all(imagePromises);
        savedImageUrls.push(
          ...imageResults.filter((url): url is string => url !== null)
        );
      }

      // A completed listing enters moderation; only moderators can grant the
      // public Active state (status 2).
      const submitResponse = await apiRequest<any>(`/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify({
          ...backendPost,
          Status: 1,
        }),
      });
      const persistedPost =
        submitResponse.success && submitResponse.data
          ? submitResponse.data
          : response.data;

      // Enrich post with category and seller names before transforming
      const enrichedPost = await enrichPostsWithCategoryAndSeller([persistedPost]);
      const enrichedPostData = enrichedPost[0] || persistedPost;

      // Preserve location and area from postData (not stored in backend yet)
      enrichedPostData.Location = postData.city || "Jordan";
      enrichedPostData.Area = postData.area || null;

      const product = transformPostModelToProduct(
        enrichedPostData,
        savedImageUrls.length > 0 ? savedImageUrls : postData.images || []
      );
      return {
        success: true,
        post: product,
      };
    }

    let errorMessage = "Failed to create post";
    if (!response.success) {
      if ("error" in response) {
        errorMessage = response.error?.message || "Failed to create post";
      }
    }
    return {
      success: false,
      message: errorMessage,
    };
  },

  /**
   * Update existing post
   */
  updatePost: async (postData: UpdatePostRequest): Promise<PostResponse> => {
    // Get current post to preserve fields
    const currentPostResponse = await apiRequest<any>(
      `/posts/${postData.id}`,
      { method: "GET" }
    );
    if (!currentPostResponse.success || !currentPostResponse.data) {
      return { success: false, message: "Post not found" };
    }

    const currentPost = currentPostResponse.data;

    // Find category ID if category name provided
    let categoryId = currentPost.CategoryID;
    if (postData.category) {
      const categoriesResponse = await apiRequest<any[]>(
        "/categories",
        { method: "GET" }
      );
      const categories = categoriesResponse.success
        ? categoriesResponse.data || []
        : [];
      const category = categories.find(
        (cat: any) =>
          cat.CategoryName?.toLowerCase() ===
          (postData.category || "").toLowerCase()
      );
      if (category) categoryId = category.CategoryID;
    }

    // Only editable fields are sent. Ownership and lifecycle metadata are
    // derived or preserved by the authenticated backend.
    const backendPost = {
      CategoryID: categoryId,
      PostTitle: postData.title || currentPost.PostTitle || "",
      PostDescription: postData.description || currentPost.PostDescription || "",
      Price: postData.price !== undefined ? postData.price : (currentPost.Price || 0),
      Status: currentPost.Status !== undefined ? currentPost.Status : 0,
      City: postData.city || currentPost.City || "Jordan",
      Area: postData.area || currentPost.Area || null,
    };

    const response = await apiRequest<any>(`/posts/${postData.id}`, {
      method: "PUT",
      body: JSON.stringify(backendPost),
    });

    if (response.success && response.data) {
      // Update images if provided
      if (postData.images) {
        const currentImages = await fetchPostImages(postData.id);
        const requestedImages = postData.images.filter(
          (url) => url.trim().length > 0
        );

        for (const image of currentImages) {
          if (
            image.PostImageID &&
            image.PostImageURL &&
            !requestedImages.includes(image.PostImageURL)
          ) {
            await apiRequest(
              `/posts/${postData.id}/images/${image.PostImageID}`,
              {
                method: "DELETE",
              }
            );
          }
        }

        const existingUrls = new Set(
          currentImages.map((image) => image.PostImageURL).filter(Boolean)
        );
        for (const imageUrl of requestedImages) {
          if (existingUrls.has(imageUrl)) continue;

          const imageResponse = await createPostImage(postData.id, imageUrl);
          if (!imageResponse.success) {
            return {
              success: false,
              message: imageResponse.error.message || "Failed to update post images",
            };
          }
        }
      }

      const product = transformPostModelToProduct(
        response.data,
        postData.images || []
      );
      return {
        success: true,
        post: product,
      };
    }

    return {
      success: false,
      message: (response as any).error?.message || "Failed to update post",
    };
  },

  /**
   * Update post status (ACTIVE, SOLD, DELETED)
   */
  updatePostStatus: async (
    data: UpdatePostStatusRequest
  ): Promise<PostResponse> => {
    if (data.status === "DELETED") {
      const result = await postsApi.deletePost(data.id);
      return {
        success: result.success,
        message: result.error,
      };
    }

    const current = await apiRequest<any>(`/posts/${data.id}`, {
      method: "GET",
    });
    if (!current.success || !current.data) {
      return { success: false, message: "Post not found" };
    }

    // Re-listing requires moderation again; owners may mark a listing sold but
    // cannot directly grant themselves Active status.
    const status = data.status === "SOLD" ? 3 : 1;
    const response = await apiRequest<any>(`/posts/${data.id}`, {
      method: "PUT",
      body: JSON.stringify({
        CategoryID: current.data.CategoryID,
        PostTitle: current.data.PostTitle,
        PostDescription: current.data.PostDescription,
        Price: current.data.Price,
        Status: status,
        City: current.data.City,
        Area: current.data.Area,
      }),
    });

    if (response.success && response.data) {
      const product = transformPostModelToProduct(response.data);
      return {
        success: true,
        post: product,
      };
    }

    return {
      success: false,
      message:
        (response as any).error?.message || "Failed to update post status",
    };
  },

  /**
   * Delete post
   */
  deletePost: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiRequest<any>(`/posts/${id}`, {
        method: "DELETE",
      });

      if (response.success) {
        return { success: true };
      }

      return {
        success: false,
        error: response.error.message || "Failed to delete post",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while deleting the post";
      console.error("[deletePost] Exception caught:", error);
      console.error("[deletePost] Error details:", errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Get posts by user ID
   */
  getUserPosts: async (userId: string): Promise<Product[]> => {
    const response = await apiRequest<any>(`/posts/user/${userId}`, {
      method: "GET",
    });

    if (response.success && response.data) {
      const items = Array.isArray(response.data.Items)
        ? response.data.Items
        : [];
      const enrichedPosts = await enrichPostsWithCategoryAndSeller(items);
      return enrichedPosts.map((post: any, index: number) =>
        transformPostModelToProduct(post, [], index)
      );
    }

    return [];
  },

  /**
   * Get posts by category
   */
  getPostsByCategory: async (
    category: string,
    page: number = 1
  ): Promise<PostsListResponse> => {
    // Find category ID by name or use as ID
    let categoryId = parseInt(category);
    if (isNaN(categoryId)) {
      const categoriesResponse = await apiRequest<any[]>(
        "/categories",
        { method: "GET" }
      );
      const categories = categoriesResponse.success
        ? categoriesResponse.data || []
        : [];
      const cat = categories.find(
        (c: any) => c.CategoryName?.toLowerCase() === category.toLowerCase()
      );
      if (cat) categoryId = cat.CategoryID;
      else
        return {
          success: false,
          posts: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalPosts: 0,
            postsPerPage: 20,
          },
        };
    }

    return postsApi.getPosts({
      category: categoryId.toString(),
      page,
      limit: 20,
    });
  },

  /**
   * Track post view (analytics)
   */
  trackView: async (postId: string): Promise<void> => {
    await apiRequest(`/posts/${postId}/views`, { method: "POST" });
  },
};

// ============================================================================
// Categories API
// ============================================================================

export const categoriesApi = {
  /**
   * Get all categories
   */
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await apiRequest<any[]>("/categories", {
      method: "GET",
    });

    if (response.success && response.data && Array.isArray(response.data)) {
      const categories = response.data.map((cat: any, index: number) =>
        transformCategoryModelToCategory(cat, index)
      );
      return {
        success: true,
        categories,
      };
    }

    return { success: false, categories: [] };
  },
};

// ============================================================================
// Users API
// ============================================================================

export const usersApi = {
  /**
   * Get user profile by ID
   */
  getUser: async (userId: string) => {
    const response = await apiRequest<any>(`/users/${userId}`, {
      method: "GET",
    });

    if (response.success && response.data) {
      const user = response.data;
      return {
        id: (user.Id || user.id || userId).toString(),
        Username: user.Username || user.username || "",
        FirstName: user.FirstName || user.firstName || "",
        LastName: user.LastName || user.lastName || "",
        firstName: user.FirstName || user.firstName || "",
        lastName: user.LastName || user.lastName || "",
        username: user.Username || user.username || "",
        phone: user.Phone || user.phone || "",
        city: user.City || user.city || "",
        area: user.Area || user.area || "",
        bio: user.Bio || user.bio || "",
        avatar: user.Avatar || user.avatar || undefined,
        joinedDate: user.JoinedDate || user.joinedDate || "",
        name: `${user.FirstName || user.firstName || ""} ${
          user.LastName || user.lastName || ""
        }`.trim(),
      };
    }

    return null;
  },

  /**
   * Update user profile
   */
  updateUser: async (userId: string, userData: any) => {
    const payload = { ...userData };
    if (
      typeof payload.Avatar === "string" &&
      payload.Avatar.startsWith("data:image/")
    ) {
      const imageResponse = await apiRequest<any>(
        `/users/${userId}/images/upload-base64`,
        {
          method: "POST",
          body: JSON.stringify({ ImageData: payload.Avatar }),
        }
      );

      if (!imageResponse.success || !imageResponse.data?.Image?.ImageURL) {
        const message = imageResponse.success
          ? "Profile image upload failed"
          : imageResponse.error.message;
        throw new Error(message);
      }

      payload.Avatar = imageResponse.data.Image.ImageURL;
    }

    const response = await apiRequest(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (response.success) {
      const data = (response as { success: true; data: any }).data;
      return data;
    } else {
      const errorResponse = response as { success: false; error: any };
      const errorMessage =
        errorResponse.error?.message || "Failed to update user";
      console.error("[updateUser] Failed:", errorMessage);
      throw new Error(errorMessage);
    }
  },
};

// ============================================================================
// Export all APIs
// ============================================================================

export const api = {
  auth: authApi,
  posts: postsApi,
  categories: categoriesApi,
  users: usersApi,
};

export default api;
