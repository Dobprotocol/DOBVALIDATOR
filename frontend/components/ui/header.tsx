import { StellarWallet } from '@/components/stellar-wallet'
import Image from 'next/image'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-6 bg-gray-50 border-b">
      <div className="flex items-center">
        <Image
          src="/images/dob-logo.png"
          alt="DOB Protocol"
          width={120}
          height={40}
          className="h-8 w-auto"
          priority
        />
      </div>

      <div className="flex items-center justify-end">
        <StellarWallet />
      </div>
    </header>
  )
}
