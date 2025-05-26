import "@/styles/globals.css";

import { type Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import NextTopLoader from "nextjs-toploader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SessionProvider from "@/providers/SessionProvider";
import { ThemeProvider } from "@/providers/ThemeContext";
import { auth } from "@/server/auth";
import { ModalProvider } from "@/components/ui/animated-modal";

export const metadata: Metadata = {
  title: "WHS APP",
  description: "WHS APP",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="en" className={`font-mont`}>
      <body>
        <ThemeProvider>
          <TRPCReactProvider>
            <SessionProvider session={session}>
              <ModalProvider>
                <NextTopLoader color="#cc0000" showSpinner={false} />
                <ToastContainer
                  position="top-right"
                  autoClose={2000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  progressClassName={"bg-blue-600"}
                  closeOnClick
                  theme="dark"
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
                <div className="h-full w-screen overflow-hidden">
                  {children}
                </div>
              </ModalProvider>
            </SessionProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
