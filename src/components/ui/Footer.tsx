
import ThemeSwitch from "../ThemeSwitch"

export default function Footer() {
  return (
    <footer id="footer" className="mt-10">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-4">
        <div className="border-t border-gray-200 pt-6 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm leading-5 text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Mind&apos;s Site. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <ThemeSwitch />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
