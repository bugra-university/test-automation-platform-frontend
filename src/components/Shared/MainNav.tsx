import { Search, Filter, Eye } from "lucide-react"
import { Input } from "../ui/input"

export function MainNav() {
  return (
    <div className="w-full bg-[#f6f6f6]">
      <div className="flex h-14 items-center">
        <div className="flex items-center px-6 h-full">
          <span className="text-xl font-semibold text-[#5f6368]">Test Platform</span>
        </div>        <div className="flex-1 flex items-center px-4 gap-2 pt-2">          <div className="w-[650px]">
            <div className="relative flex">              <div className="relative flex-1">
                <Input                  placeholder="Search in tests..."
                  className="pl-4 pr-24 bg-[#eeeeee] rounded-l-[24px] rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0 border-r-0 h-11"
                />
              </div>              <div className="flex h-11 border border-l-0 rounded-r-[24px] bg-[#eeeeee]"><div className="flex items-center px-2">
                  <button
                    type="button"
                    aria-label="Filter tests"
                    title="Filter tests"
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Filter className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    aria-label="View mode"
                    title="View mode"
                    className="h-full px-6 rounded-[24px] bg-white hover:bg-blue-700 hover:text-white transition-colors flex items-center"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center px-4 gap-4 h-full">
          <button className="text-sm text-[#5f6368] hover:text-[#202124]">Help</button>
          <button className="text-sm text-[#5f6368] hover:text-[#202124]">Settings</button>
        </div>
      </div>
    </div>
  )
}
