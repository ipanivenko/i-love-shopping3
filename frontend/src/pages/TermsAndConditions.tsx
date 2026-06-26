import Container from '../components/ui/Container'
import { BackToShoppingButton } from '../components/ui/BackToShopping'

export default function TermsPage() {
  return (
    <main className="bg-white">
      <BackToShoppingButton label="Continue shopping" />
      <Container className="max-w-4xl py-10">
        <h1 className="text-3xl font-bold text-zinc-950">
          Terms & Conditions
        </h1>

        <p className="mt-4 text-zinc-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700">
          <section>
            <h2 className="text-xl font-semibold text-zinc-950">
              1. Educational Project Disclaimer
            </h2>

            <p className="mt-2">
              MoveOn is an educational and portfolio project developed for
              learning purposes. The website was created to demonstrate skills
              in modern web development, including e-commerce functionality,
              authentication, product management, and payment workflows.
            </p>

            <p className="mt-2">
              MoveOn is not intended to operate as a commercial business, and
              no guarantees are made regarding the availability, accuracy, or
              completeness of its content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950">
              2. Use of the Website
            </h2>

            <p className="mt-2">
              By accessing this website, you agree to use it responsibly and
              only for lawful purposes. Users must not attempt to disrupt,
              damage, or gain unauthorized access to any part of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950">
              3. Intellectual Property
            </h2>

            <p className="mt-2">
              Unless otherwise stated, the content, design, source code, and
              materials presented on this website are provided solely for
              educational and demonstration purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950">
              4. Privacy Policy
            </h2>

            <p className="mt-2">
              This project may collect information voluntarily provided by
              users, such as names, email addresses, or account credentials,
              solely to demonstrate application features.
            </p>

            <p className="mt-2">
              Information submitted through the platform is not sold, rented,
              or shared with third parties except where required for the
              operation of the demonstrated functionality.
            </p>

            <p className="mt-2">
              Users should avoid providing sensitive personal information, as
              this website is intended as a learning project rather than a
              production service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950">
              5. Cookies and Local Storage
            </h2>

            <p className="mt-2">
              The application may use cookies or browser storage to support
              features such as authentication, user sessions, and improving the
              overall user experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950">
              6. Limitation of Liability
            </h2>

            <p className="mt-2">
              The creators of MoveOn shall not be held liable for any direct,
              indirect, incidental, or consequential damages arising from the
              use of this educational project.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950">
              7. Changes to These Terms
            </h2>

            <p className="mt-2">
              These Terms & Conditions may be updated periodically to reflect
              improvements or changes to the project. Continued use of the
              website constitutes acceptance of any updates.
            </p>
          </section>
        </div>
      </Container>
    </main>
  )
}