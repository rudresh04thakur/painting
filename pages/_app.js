import "@/styles/globals.css";
import "rc-slider/assets/index.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import GlobalLoader from "@/components/GlobalLoader";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <GlobalLoader />
      <Toaster position="top-center" reverseOrder={false} />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
