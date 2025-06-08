import { StellarWallet } from '@/components/stellar-wallet'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-6 bg-background border-b">
      <div className="flex items-center">
        <div className="w-10 h-10">
          <img src="/images/dob-logo.png" alt="DOB Protocol" className="w-full h-full" />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <StellarWallet />
      </div>
    </header>
  )
}
