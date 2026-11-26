export interface ProductCategoryResponse {
  id: number;
  name: string;
}

export interface ProductCategoryCreateRequest {
  name: string;
}

export interface ProductCategoryUpdateRequest {
  name: string;
}

export interface ProductSummaryResponse {
  id: number;
  name: string;
  description?: string;
  price: string;
  image: string;
  productCategory: string;
  isAvailable: boolean;
}

export interface ProductDetailsResponse {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  productCategory: string;
  isAvailable: boolean;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  image: string;
  price: number;
  productCategoryId: number;
  isAvailable: boolean;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  productCategoryId?: number;
  isAvailable?: boolean;
}
