import { ShoppingCart, User, LogOut, Package } from 'lucide-react'
import Container from '../ui/Container'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import SearchInput from '../search/searchInput'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { useCartCount } from '../cart/useCartCount'
import { ResumePaymentBanner } from '../payment/UnfinishedPayment'
import { usePendingPayment } from '../payment/useUnfinishedPayment'
import { useState } from 'react'
import QuickCartPreview from '../cart/CartPreview'

export default function Header() {
  const { logout, isAuthenticated, isAuthLoading } = useAuth()
  const { pendingPayment, remainingTime } = usePendingPayment()
  const location = useLocation()
  const navigate = useNavigate()
  const count = useCartCount();
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (!location.hash) return

    const id = location.hash.replace('#', '')
    const element = document.getElementById(id)

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [location])

  const handleClickUser = () => {
    navigate(isAuthenticated ? '/account' : '/login')
  }

  const handleClickCart = () => {
    navigate('/cart')
  }

  const handleLogout = async () => {
    try {
      await logout()

      toast.success('Logged out successfully', {
        description: 'See you again soon!',
      })

      // go to home and fully refresh app state
      window.location.href = '/'
    } catch (error) {
      toast.error('Logout failed. Please try again.')
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white backdrop-blur">
      <Container className="flex items-center justify-between gap-4 py-4">
        <div className="text-2xl font-black tracking-tight">
          <img
            src="/src/assets/logo.png"
            alt="logo"
            className="h-20 w-auto object-contain"
          />
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-700 md:flex">
          <Link to="/#shop" className="hover:text-black">
            Shop
          </Link>
          <Link to="/#featured" className="hover:text-black">
            Featured
          </Link>
          <Link to="/#brands" className="hover:text-black">
            Brands
          </Link>
        </nav>

        <div className="hidden flex-1 md:flex md:max-w-md">
          <SearchInput />
        </div>



        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClickUser}
            className="rounded-full border border-zinc-300 p-2 hover:bg-zinc-50"
          >
            <User className="h-5 w-5" />
          </button>

          {/* <button
            type="button"
            onClick={handleClickCart}
            className="relative rounded-full border border-zinc-300 p-2 hover:bg-zinc-50"
          >
            <ShoppingCart className="h-5 w-5" />

            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </button> */}

          <div
            className="relative"
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
          >
            <button
              type="button"
              onClick={handleClickCart}
              className="relative rounded-full border border-zinc-300 p-2 hover:bg-zinc-50"
            >
              <ShoppingCart className="h-5 w-5" />

               {count > 0 && (
              <span className="absolute -right-1 -top-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
            </button>

            {showPreview && <QuickCartPreview />}
          </div>

          {isAuthenticated && !isAuthLoading && (
            <>

              <Link
                to="/orders"
                className="rounded-full border border-zinc-300 p-2 text-zinc-600 transition-colors hover:border-green-200"
                title="My orders"
              >
                <Package className="h-5 w-5" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-zinc-300 p-2 text-zinc-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>


            </>

          )}
        </div>
      </Container>

      {pendingPayment && (
        <div className="border-t border-zinc-100 py-3">
          <Container className="pb-4">
            <ResumePaymentBanner
              orderId={pendingPayment.orderId}
              remainingTime={remainingTime ?? undefined}
            />
          </Container>
        </div>
      )}
    </header>
  )
}