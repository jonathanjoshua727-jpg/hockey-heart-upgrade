import { useState } from "react";
import { getPageContent, savePageContent, logActivity, type PageContent } from "@/lib/contentStore";
import { Save, ExternalLink } from "lucide-react";
import { Link } from "wouter";

const PAGES = [
  { id: "about", label: "About Us", route: "/about" },
  { id: "mission", label: "Mission", route: "/mission" },
  { id: "vision", label: "Vision", route: "/vision" },
  { id: "impact", label: "Impact", route: "/impact" },
  { id: "privacy", label: "Privacy Policy", route: "/privacy" },
  { id: "terms", label: "Terms of Use", route: "/terms" },
];

export function PagesSection() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [content, setContent] = useState<PageContent | null>(null);
  const [saved, setSaved] = useState(false);

  function selectPage(id: string) {
    const existing = getPageContent(id);
    const page = PAGES.find((p) => p.id === id)!;
    setContent(
      existing ?? {
        id,
        title: page.label,
        content: "",
        updatedAt: new Date().toISOString(),
      }
    );
    setSelectedPage(id);
    setSaved(false);
  }

  function handleSave() {
    if (!content) return;
    savePageContent({ ...content, updatedAt: new Date().toISOString() });
    logActivity("EDIT", "Pages", `Updated page: "${content.title}"`);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pages</h2>
        <p className="text-gray-500 text-sm mt-1">Add or override content for static pages. Leave blank to use the default design.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Note:</strong> Content entered here overrides the default page text. The existing page layouts and branding are preserved. Leave empty to keep the default design.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page list */}
        <div className="space-y-2">
          {PAGES.map((page) => {
            const existing = getPageContent(page.id);
            return (
              <button
                key={page.id}
                onClick={() => selectPage(page.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors text-sm text-left ${
                  selectedPage === page.id
                    ? "border-[#0a1f44] bg-[#0a1f44]/5 text-[#0a1f44]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div>
                  <p className="font-medium">{page.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{page.route}</p>
                </div>
                <div className="flex items-center gap-2">
                  {existing?.content && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Custom</span>
                  )}
                  <Link href={page.route} target="_blank" className="p-1 rounded text-gray-400 hover:text-[#0a1f44]" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </button>
            );
          })}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          {!selectedPage ? (
            <div className="h-full bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-sm p-12">
              Select a page to edit its content
            </div>
          ) : content ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{content.title}</h3>
                <Link href={PAGES.find((p) => p.id === selectedPage)?.route ?? "#"} target="_blank" className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#0a1f44] transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> View live
                </Link>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Page Title (browser tab)</label>
                <input value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Custom Content Override (HTML supported)</label>
                <p className="text-xs text-gray-400">Enter HTML content to replace the default page body. Leave empty to keep the default design.</p>
                <textarea
                  value={content.content}
                  onChange={(e) => setContent({ ...content, content: e.target.value })}
                  rows={16}
                  placeholder={`<section>\n  <h1>Page Title</h1>\n  <p>Your content here...</p>\n</section>`}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44] resize-y"
                />
              </div>

              {content.updatedAt && (
                <p className="text-xs text-gray-400">
                  Last updated: {new Date(content.updatedAt).toLocaleString()}
                </p>
              )}

              <div className="flex items-center gap-4">
                <button onClick={handleSave} className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors">
                  <Save className="w-4 h-4" /> Save Page
                </button>
                {saved && <span className="text-green-600 text-sm font-medium">✓ Saved</span>}
                {content.content && (
                  <button
                    onClick={() => { setContent({ ...content, content: "" }); setSaved(false); }}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Clear override
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
