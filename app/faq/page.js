"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const FAQPage = () => {
    const pathname = usePathname();

    const sidebarLinks = [
        {
            title: "How use Gtwy Ai",
            href: "/faq/how-to-use-gtwy-ai",
        },
        {
            title: "Addvance Parameter Guide",
            href: "/faq/guide",
        },
        {
            title: "JSON Format Guide",
            href: "/faq/jsonformatdoc",
        },
        {
            title: "Create JWT Token Chatbot",
            href: "/faq/create-jwt-for-chatbot",
        },
        
    ];

    // Only show sidebar if on FAQ page
    if (!pathname.startsWith('/faq')) {
        return null;
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4">
                <div className="mb-6 border-b border-gray-700 pb-4">
                    <h1 className="text-2xl font-bold text-white mb-2">GTWY AI</h1>
                    <h2 className="text-lg font-semibold text-gray-300">FAQ Sections</h2>
                </div>
                <nav>
                    <ul className="space-y-2">
                        {sidebarLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`block px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${pathname === link.href ? "bg-gray-700" : ""
                                        }`}
                                >
                                    {link.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default FAQPage;
