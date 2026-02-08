"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface PDFViewerProps {
  fileUrl: string
}

function getPageImageUrl(fileUrl: string, page: number): string {
  // Convert Cloudinary PDF URL to per-page JPG
  // Handles both /image/upload/ and legacy /raw/upload/ URLs
  let url = fileUrl

  if (url.includes("/raw/upload/")) {
    url = url.replace("/raw/upload/", `/image/upload/pg_${page},w_1200/`)
  } else {
    url = url.replace("/image/upload/", `/image/upload/pg_${page},w_1200/`)
  }

  // Replace .pdf extension with .jpg, or add .jpg if no extension
  if (/\.pdf$/i.test(url)) {
    url = url.replace(/\.pdf$/i, ".jpg")
  } else if (!/\.\w+$/.test(url)) {
    url = url + ".jpg"
  }

  return url
}

export function PDFViewer({ fileUrl }: PDFViewerProps) {
  const [pages, setPages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Discover pages by trying to load them one by one
    async function discoverPages() {
      const discoveredPages: string[] = []

      for (let page = 1; page <= 20; page++) {
        const pageUrl = getPageImageUrl(fileUrl, page)
        try {
          const response = await fetch(pageUrl, { method: "HEAD" })
          if (response.ok) {
            discoveredPages.push(pageUrl)
          } else {
            break // No more pages
          }
        } catch {
          break
        }
      }

      setPages(discoveredPages.length > 0 ? discoveredPages : [])
      setLoading(false)
    }

    discoverPages()
  }, [fileUrl])

  if (loading) {
    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 p-12 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin mb-3" />
        <p className="text-sm text-gray-600">Loading PDF pages...</p>
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 p-8 text-center">
        <p className="text-gray-600">Unable to preview this PDF.</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 hover:text-violet-700 text-sm mt-2 inline-block"
        >
          Try opening directly
        </a>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
      <div className="max-h-[700px] overflow-y-auto bg-gray-200 space-y-2 p-2">
        {pages.map((pageUrl, index) => (
          <img
            key={index}
            src={pageUrl}
            alt={`Page ${index + 1}`}
            className="w-full bg-white shadow-sm rounded"
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-300">
        <p className="text-xs text-gray-600 text-center">
          {pages.length} page{pages.length !== 1 ? "s" : ""} • Scroll to view all pages
        </p>
      </div>
    </div>
  )
}
