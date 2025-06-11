import Image from "next/image"

export function Header() {
  return (
    <header className="flex items-center gap-4 p-4 md:p-6 bg-white/80 dark:bg-background/80 shadow-sm rounded-xl mb-4">
      <div className="flex-shrink-0">
        <Image
          src="/leetcode-analytics-logo.svg"
          alt="LeetCode Analytics Logo"
          width={56}
          height={56}
          className="drop-shadow-md rounded"
          priority
        />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          LeetCode Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-300 text-lg mt-1">
          Track and analyze company-wise LeetCode problems
        </p>
      </div>
    </header>
  )
} 