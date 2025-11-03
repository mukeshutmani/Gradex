"use client"

interface PDFViewerProps {
  fileUrl: string
}

export function PDFViewer({ fileUrl }: PDFViewerProps) {
  // Use browser's native PDF rendering
  // This works reliably with Cloudinary URLs and allows scrolling through all pages
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
      <iframe
        src={fileUrl}
        className="w-full h-[700px] bg-white"
        title="PDF Viewer"
        type="application/pdf"
      />
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-300">
        <p className="text-xs text-gray-600 text-center">
          Scroll to view all pages • Use browser controls to zoom and navigate
        </p>
      </div>
    </div>
  )
}
