import { Link } from 'react-router-dom'
import Container from '../ui/Container'

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-zinc-200 bg-white">
      <Container className="grid gap-3 py-4 md:grid-cols-4">
        <div>
          <img
            src="/src/assets/logo.png"
            alt="MoveOn logo"
            className="h-6 w-auto object-contain"
          />

          <p className="mt-2 text-sm text-zinc-600">
            Top sports footwear from trusted brands, built for every step.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900">Company</h4>

          <ul className="mt-2 space-y-1 text-sm text-zinc-600">
            <li>
              <Link
                to="/about"
                className="transition hover:text-zinc-900"
              >
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900">Support</h4>

          <ul className="mt-2 space-y-1 text-sm text-zinc-600">
            <li>
              <Link
                to="/contact"
                className="transition hover:text-zinc-900"
              >
                Contact / Support
              </Link>
            </li>

            <li>
              <Link
                to="/faq"
                className="transition hover:text-zinc-900"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900">Legal</h4>

          <ul className="mt-2 space-y-1 text-sm text-zinc-600">
            <li>
              <Link
                to="/terms"
                className="transition hover:text-zinc-900"
              >
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-zinc-200">
        <Container className="py-2 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} MoveOn. All rights reserved.
        </Container>
      </div>
    </footer>
  )
}