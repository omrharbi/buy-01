import { environment } from '../../../environments/environment.development';
const base = environment.apiBase;

export const API = {
  base,

  auth: {
    register: `${base}/auth/register`,
    login: `${base}/auth/login`,
  },

  users: {
    me: `${base}/me`,
  },

  products: {
    list: `${base}/products/list`,
    byId: (id: string) => `${base}/products/view/${id}`,
    mine: `${base}/products/my`,
    create: `${base}/products/create`,
  },

  media: {
    upload: `${base}/media/images/upload`,
    byId: (id: string) => `${base}/media/images/${id}`,
    mine: `${base}/media/images/me`,
  },
} as const;

/** The limits the Media service enforces. The UI states them and checks them first. */
export const MEDIA_RULES = {
  maxBytes: 2 * 1024 * 1024,
  maxFilesPerProduct: 6,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  accept: 'image/jpeg,image/png,image/webp',
  hint: 'JPEG, PNG or WebP · max 2 MB each · up to 6 images',
} as const;
