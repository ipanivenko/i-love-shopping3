import type { HomeBrand, HomeCategory} from '../types/home'
import { FRONT } from '../api/config'

export const homeCategories: HomeCategory[] = [
  {
    id: 'men',
    title: 'Men',
    subtitle: 'Running, training, lifestyle',
    image: 'https://cdn.mos.cms.futurecdn.net/KLJc2mBTPjopkmhQX94nf9.jpg?q=80&w=1200&auto=format&fit=crop',
    href: `${FRONT}/products?gender=MEN`,
  },
  {
    id: 'women',
    title: 'Women',
    subtitle: 'Fresh arrivals and everyday picks',
    image: 'https://runningshoesforsupination.com/wp-content/uploads/2023/01/wens-running-shoes.jpg?q=80&w=1200&auto=format&fit=crop',
    href: `${FRONT}/products?gender=WOMEN`,
  },
  {
    id: 'kids',
    title: 'Kids',
    subtitle: 'Built for play and school days',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=1200&auto=format&fit=crop',
    href: `${FRONT}/products?gender=KIDS`,
  },
]

export const homeBrands: HomeBrand[] = [
  {
    id: "nike",
    name: "Nike",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    href: `${FRONT}/products?brand=nike`,
  },
  {
    id: "adidas",
    name: "Adidas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    href: `${FRONT}/products?brand=adidas`,
  },
  {
    id: "asics",
    name: "Asics",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Asics_Logo.svg",
    href: `${FRONT}/products?brand=asics`,
  },
  {
    id: "puma",
    name: "Puma",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/da/Puma_complete_logo.svg/1920px-Puma_complete_logo.svg.png",
    href: `${FRONT}/products?brand=puma`,
  },
]