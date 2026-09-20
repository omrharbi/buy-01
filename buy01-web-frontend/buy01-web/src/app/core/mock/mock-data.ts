import { Product } from '../models/product.model';
import { User } from '../models/user.model';

/** A flat coloured tile as a data URL, so the seeded catalog has pictures with no network. */
function tile(background: string, mark: string, shape: 'mug' | 'runner' | 'board' | 'lamp'): string {
  const art = {
    mug: `<rect x="112" y="92" width="120" height="120" rx="12" fill="${mark}"/><path d="M232 124h22a26 26 0 0 1 0 52h-22z" fill="none" stroke="${mark}" stroke-width="12"/>`,
    runner: `<rect x="72" y="72" width="216" height="156" rx="12" fill="${mark}"/><rect x="72" y="120" width="216" height="14" fill="${background}"/><rect x="72" y="166" width="216" height="14" fill="${background}"/>`,
    board: `<path d="M84 150a66 66 0 0 1 66-66h100a66 66 0 0 1 0 132H150a66 66 0 0 1-66-66z" fill="${mark}"/><circle cx="268" cy="150" r="14" fill="${background}"/>`,
    lamp: `<path d="M180 76h40l52 86H128z" fill="${mark}"/><rect x="192" y="162" width="16" height="70" fill="${mark}"/><rect x="152" y="232" width="96" height="16" rx="8" fill="${mark}"/>`,
  }[shape];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${background}"/>${art}</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const SEED_USERS: Array<User & { password: string }> = [
  {
    id: 'seller-atelier-nord',
    name: 'atelier-nord',
    email: 'seller@buy01.test',
    role: 'SELLER',
    avatarUrl: null,
    password: 'password123',
  },
  {
    id: 'seller-maison-bleue',
    name: 'maison-bleue',
    email: 'maison@buy01.test',
    role: 'SELLER',
    avatarUrl: null,
    password: 'password123',
  },
  {
    id: 'client-sofia',
    name: 'Sofia',
    email: 'client@buy01.test',
    role: 'CLIENT',
    avatarUrl: null,
    password: 'password123',
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'p-mug',
    name: 'Hand-thrown stoneware mug',
    description: 'Wheel-thrown, glazed in a matte oatmeal. Dishwasher safe. Holds 300 ml.',
    price: 240,
    quantity: 12,
    sellerId: 'seller-atelier-nord',
    sellerName: 'atelier-nord',
    imageUrls: [tile('#d7ebe6', '#0a6a5c', 'mug')],
    createdAt: '2026-08-02T09:12:00Z',
  },
  {
    id: 'p-runner',
    name: 'Indigo-dyed linen table runner, 180 cm',
    description: 'Hand-dyed with natural indigo, hemmed by hand. Each piece differs slightly.',
    price: 480,
    quantity: 4,
    sellerId: 'seller-maison-bleue',
    sellerName: 'maison-bleue',
    imageUrls: [tile('#f7e7cd', '#8f5200', 'runner')],
    createdAt: '2026-08-14T15:40:00Z',
  },
  {
    id: 'p-board',
    name: 'Olive-wood serving board',
    description: 'Cut from a single piece of olive wood, finished with food-safe oil.',
    price: 150,
    quantity: 0,
    sellerId: 'seller-atelier-nord',
    sellerName: 'atelier-nord',
    imageUrls: [],
    createdAt: '2026-08-21T11:05:00Z',
  },
  {
    id: 'p-lamp',
    name: 'Paper cone table lamp',
    description: 'Folded paper shade on an ash base. Takes a standard E27 bulb.',
    price: 690,
    quantity: 7,
    sellerId: 'seller-maison-bleue',
    sellerName: 'maison-bleue',
    imageUrls: [tile('#ebe8e2', '#565d59', 'lamp')],
    createdAt: '2026-09-01T08:30:00Z',
  },
  {
    id: 'p-bowl',
    name: 'Speckled serving bowl, 24 cm',
    description: 'Stoneware with a speckled white glaze. Oven and dishwasher safe.',
    price: 320,
    quantity: 3,
    sellerId: 'seller-atelier-nord',
    sellerName: 'atelier-nord',
    imageUrls: [tile('#d7ebe6', '#075146', 'board')],
    createdAt: '2026-09-09T17:22:00Z',
  },
  {
    id: 'p-throw',
    name: 'Wool throw, charcoal',
    description: 'Lambswool, woven in a small mill. 130 × 180 cm, fringed ends.',
    price: 890,
    quantity: 2,
    sellerId: 'seller-maison-bleue',
    sellerName: 'maison-bleue',
    imageUrls: [tile('#ebe8e2', '#161a19', 'runner')],
    createdAt: '2026-09-15T10:02:00Z',
  },
];
