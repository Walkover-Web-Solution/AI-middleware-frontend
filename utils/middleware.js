// import { session } from "./utils/session";
// import { NextRequest, NextResponse } from "next/server";

// const protectedRoutes = ["/"  ] ;


// export default function middleware (req) {
//     const pathname = req.nextUrl.pathname; 
//     const isProtectedRoute  = protectedRoutes.some(route => pathname.includes(route));
     
//     if (!session &&  isProtectedRoute ) {
//         const absoluteURL = new URL("/login", req.nextUrl.origin);
//         return NextResponse.redirect(absoluteURL.toString());
//     }
// }

// // import { session } from "./utils/session";
// // import { NextRequest, NextResponse } from "next/server";

// // const protectedRoutes = ["/"];

// // export default function middleware(req) {
// //     console.log(req.nextUrl.pathname, "log");
// //     const paths = req.nextUrl.pathname.split("/").filter(Boolean); // Split the path and remove any empty strings
// //     console.log("paths", paths);
// //     const isProtectedRoute = paths.some(path => protectedRoutes.includes(path)); // Check if any part of the path is a protected route
// //     console.log("isProtectedRoute", isProtectedRoute);
// //     if (!session && isProtectedRoute) {
// //         console.log("inside if", req.nextUrl.pathname);
// //         const absoluteURL = new URL("/login", req.nextUrl.origin);
// //         console.log(absoluteURL, "absoluteURL");
// //         return NextResponse.redirect(absoluteURL.toString());
// //     }
// // }


// // import { session } from "./utils/session";
// // import { NextRequest, NextResponse } from "next/server";

// // const protectedRoutes = ["history"];


// // export default function middleware (req) {
// //     console.log(req.nextUrl.pathname, "log");
// //     const paths =  req.nextUrl.pathname.split("/");
// //     console.log( "oaths", paths);
// //     console.log("protectedRoutes.includes(paths[0])",protectedRoutes.includes(paths[5])) 
// //     if (!session && protectedRoutes.includes(paths[5]))  {
        
// //         console.log("inside ifff",req.nextUrl.pathname);
// //         const absoluteURL = new URL("/login", req.nextUrl.origin);
// //         console.log(absoluteURL, "absoluteURL");
// //         return NextResponse.redirect(absoluteURL.toString());
// //     }
// // }



