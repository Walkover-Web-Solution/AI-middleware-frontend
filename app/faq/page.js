"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const FAQPage = () => {
  const pathname = usePathname();
  
  const sidebarLinks = [
    {
      title: "Guide",
      href: "/faq/guide",
    },
    {
      title: "JSON Format",
      href: "/faq/jsonformatdoc",
    },
    {
      title: "Create JWT Token",
      href: "/faq/create-jwt-for-chatbot",
    },
  ];

  // Check if current path is a FAQ subpage
  const isFAQSubpage = pathname.startsWith('/faq/') && pathname !== '/faq';

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">FAQ Sections</h2>
        <nav>
          <ul className="space-y-2">
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                    pathname === link.href ? "bg-gray-700" : ""
                  }`}
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content - Only show if not on a FAQ subpage */}
      {!isFAQSubpage && (
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">
            Explore our documentation and guides to get answers to your questions
            about GTWY AI and its features.
          </p>
          <div className="space-y-4">
            <p className="text-gray-600">
              Select a section from the sidebar to view detailed information and
              guides.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQPage;
