import Link from "next/link"
import { ClipboardCheck, MapPin, ExternalLink, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-3">
              <ClipboardCheck className="h-6 w-6 text-blue-400" />
              <span className="ml-2 text-lg font-bold text-white">Gradex</span>
            </div>
            <p className="text-sm mb-3 text-gray-400">
              AI-powered assignment grading platform helping teachers automate evaluation processes for educational institutions across Pakistan.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                <span>Hyderabad, Sindh, Pakistan</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-2">Follow Us</p>
                <div className="flex space-x-3">
                  <Link href="https://instagram.com/gradex.pk" className="text-gray-400 hover:text-pink-400 transition-colors cursor-pointer">
                    <Instagram className="h-5 w-5" />
                  </Link>
                  <Link href="https://linkedin.com/company/gradex" className="text-gray-400 hover:text-blue-400 transition-colors cursor-pointer">
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link href="https://discord.gg/gradex" className="text-gray-400 hover:text-indigo-400 transition-colors cursor-pointer">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.246.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.311-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.311-.946 2.38-2.157 2.38z"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-blue-400 transition-colors cursor-pointer">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-blue-400 transition-colors cursor-pointer">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-400 transition-colors cursor-pointer">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-blue-400 transition-colors cursor-pointer">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-blue-400 transition-colors cursor-pointer">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors cursor-pointer">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/data-protection" className="hover:text-blue-400 transition-colors cursor-pointer">
                  Data Protection
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="hover:text-blue-400 transition-colors cursor-pointer">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Team Section */}
        <div className="border-t border-gray-700 mt-6 pt-6">
          <div className="text-center mb-4">
            <h3 className="text-white font-semibold mb-2">Gradex Team</h3>
            <p className="text-sm text-gray-400">
              Passionate educators and technologists working to revolutionize academic assessment in Pakistan
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="text-gray-400 mb-2 md:mb-0">
              © {currentYear} Gradex. All rights reserved under Pakistani Copyright Law.
            </div>
            <div className="text-gray-400 text-xs text-center md:text-right">
              <p>
                Protected under the Copyright Ordinance 1962 of Pakistan.
                Data processing compliant with Pakistan Data Protection regulations.
              </p>
              <p className="mt-1">
                Educational technology platform registered in Pakistan.
                <Link href="/legal-notice" className="text-blue-400 hover:text-blue-300 ml-1 cursor-pointer">
                  Legal Notice <ExternalLink className="inline h-3 w-3" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}