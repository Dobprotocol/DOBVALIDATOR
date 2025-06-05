import { Bell, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center">
        <div className="w-10 h-10 mr-4">
          <img src="/images/dob-logo.png" alt="DOB Logo" className="w-full h-full" />
        </div>
        <h1 className="text-xl font-light text-[#6366F1]">My pools</h1>
      </div>

      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search address..."
            className="w-full py-2 px-4 pl-10 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-full bg-[#6366F1]/10 border-[#6366F1]/20 text-[#6366F1]"
        >
          <span className="text-sm">Create Pool</span>
          <span className="text-lg">+</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Bell size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Clock size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500">
          <User size={20} />
        </Button>
      </div>
    </header>
  )
}
