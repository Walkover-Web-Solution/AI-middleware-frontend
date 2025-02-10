export const metadata = {
    title: "faq",
    description: "Find answers for all your questions relates to AI Middleware / Gtwy.ai right here",
};



export default function RootLayout({ children }) {
    return (

        <html lang="en" data-theme="light">

            <body suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
