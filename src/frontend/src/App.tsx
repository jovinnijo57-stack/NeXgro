import { createActor } from "@/backend";
import Layout from "@/components/Layout";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import IntroVideo from "@/pages/IntroVideo";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VerifyEmail from "@/pages/VerifyEmail";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
// ─── Lazy page imports ───────────────────────────────────────────────────────
import { Suspense, lazy, useEffect, useState } from "react";
import { requestForToken, onMessageListener } from "@/lib/firebase";
import { toast } from "sonner";

const Home = lazy(() => import("@/pages/Home"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const OrderDetail = lazy(() => import("@/pages/OrderDetail"));
const Profile = lazy(() => import("@/pages/Profile"));
const Search = lazy(() => import("@/pages/Search"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const LocationSetup = lazy(() => import("@/pages/LocationSetup"));
const BundlesPage = lazy(() => import("@/pages/BundlesPage"));
const BundleDetail = lazy(() => import("@/pages/BundleDetail"));
const WalletPage = lazy(() => import("@/pages/WalletPage"));
const RecipesPage = lazy(() => import("@/pages/Recipes"));
const SubscriptionsPage = lazy(() => import("@/pages/SubscriptionsPage"));
const ComparisonPage = lazy(() => import("@/pages/ComparisonPage"));
const SmartPantryPage = lazy(() => import("@/pages/SmartPantry"));
const SharedWishlistPage = lazy(() => import("@/pages/SharedWishlistPage"));
const ReferralsPage = lazy(() => import("@/pages/ReferralsPage"));
const OrderTrackingPage = lazy(() => import("@/pages/OrderTrackingPage"));
const MealPlannerPage = lazy(() => import("@/pages/MealPlannerPage"));
const AIShopperPage = lazy(() => import("@/pages/AIShopper"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProductsPage = lazy(() => import("@/pages/admin/AdminProductsPage"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminAnalyticsPage = lazy(
  () => import("@/pages/admin/AdminAnalyticsPage"),
);
const AdminPromotionsPage = lazy(
  () => import("@/pages/admin/AdminPromotionsPage"),
);
const AdminBundlesPage = lazy(() => import("@/pages/admin/AdminBundlesPage"));
const AdminCollectionsPage = lazy(
  () => import("@/pages/admin/AdminCollectionsPage"),
);
const AdminWalletPage = lazy(() => import("@/pages/admin/AdminWalletPage"));
const AdminChatPage = lazy(() => import("@/pages/admin/AdminChatPage"));
const AdminLocationsPage = lazy(
  () => import("@/pages/admin/AdminLocationsPage"),
);
const AdminCouponsPage = lazy(() => import("@/pages/admin/AdminCouponsPage"));
const AdminFlashDealsPage = lazy(
  () => import("@/pages/admin/AdminFlashDealsPage"),
);
const AdminReviewsPage = lazy(() => import("@/pages/admin/AdminReviewsPage"));
const AdminBannersPage = lazy(() => import("@/pages/admin/AdminBannersPage"));
const AdminRecipesPage = lazy(() => import("@/pages/admin/AdminRecipesPage"));
const AdminSubscriptionsPage = lazy(
  () => import("@/pages/admin/AdminSubscriptionsPage"),
);
const BannedPage = lazy(() => import("@/pages/Banned"));
const BannedSupportPage = lazy(() => import("@/pages/BannedSupport"));

// ─── Auth guard component ────────────────────────────────────────────────────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = localStorage.getItem("isLoggedIn") === "true" || !!identity;
  const currentUserEmail = localStorage.getItem("currentUserEmail");
  const bannedEmails = JSON.parse(localStorage.getItem("nexgro_banned_users") || "[]");
  const isDeviceRestricted = localStorage.getItem("nexgro_device_restricted") === "true";

  if ((currentUserEmail && bannedEmails.includes(currentUserEmail.toLowerCase())) || isDeviceRestricted) {
    window.location.href = "/banned";
    return null;
  }
  
  if (!isAuthenticated) {
    window.location.href = "/register";
    return null;
  }

  const hasLocation = localStorage.getItem("nexgro_user_location");
  const isLocationPage = window.location.pathname === "/location-setup";
  const isAdminPage = window.location.pathname.startsWith("/admin");

  const isAdmin = currentUserEmail?.toLowerCase() === "admin@nexgro.com";
  
  if (!hasLocation && !isLocationPage && !isAdminPage && !isAdmin) {
    window.location.href = "/location-setup";
    return null;
  }

  return <>{children}</>;
}

// ─── Admin guard component ────────────────────────────────────────────────────

function AdminGuard({ children }: { children: React.ReactNode }) {
  // Allow access to the admin path for authentication within the dashboard
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// ─── Root route ───────────────────────────────────────────────────────────────
const rootRoute = createRootRoute();

const introRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IntroVideo,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
});

const bannedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/banned",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <BannedPage />
    </Suspense>
  ),
});

const bannedSupportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/banned-support",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <BannedSupportPage />
    </Suspense>
  ),
});

// ─── Verify Email Route ───────────────────────────────────────────────────────

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-email",
  component: VerifyEmail,
});

const locationSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/location-setup",
  component: () => (
    <AuthGuard>
      <Suspense fallback={<PageLoader />}>
        <LocationSetup />
      </Suspense>
    </AuthGuard>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Home />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const categoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/categories/$categoryId",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <CategoryPage />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products/$productId",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <ProductDetail />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Cart />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const aiShopperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-shopper",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <AIShopperPage />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Checkout />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <OrdersPage />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const orderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders/$orderId",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <OrderDetail />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const orderTrackingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders/$orderId/track",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <OrderTrackingPage />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Profile />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Search />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const wishlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wishlist",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Wishlist />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const bundlesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bundles",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <BundlesPage />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const bundleDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bundles/$bundleId",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <BundleDetail />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <WalletPage />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const recipesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recipes",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <RecipesPage />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const subscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subscriptions",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <SubscriptionsPage />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const smartPantryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/smart-pantry",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <SmartPantryPage />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});
const comparisonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products/compare",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <ComparisonPage />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const sharedWishlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shared-wishlist/$token",
  component: () => (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <SharedWishlistPage />
      </Suspense>
    </Layout>
  ),
});

const referralsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/referrals",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <ReferralsPage />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const mealPlannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/meal-planner",
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <MealPlannerPage />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

// ─── Admin routes ─────────────────────────────────────────────────────────────

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminDashboard />
      </Suspense>
    </AdminGuard>
  ),
});

const adminProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/products",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminProductsPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/orders",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminOrdersPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/users",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminUsersPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/analytics",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminAnalyticsPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminPromotionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/promotions",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminPromotionsPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminBundlesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/bundles",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminBundlesPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminCollectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/collections",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminCollectionsPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminWalletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/wallet",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminWalletPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/chat",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminChatPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminLocationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/locations",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminLocationsPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminCouponsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/coupons",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminCouponsPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminFlashDealsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/flash-deals",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminFlashDealsPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminReviewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/reviews",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminReviewsPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminBannersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/banners",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminBannersPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminRecipesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/recipes",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminRecipesPage />
      </Suspense>
    </AdminGuard>
  ),
});

const adminSubscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-nexgro-secret-2024/subscriptions",
  component: () => (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminSubscriptionsPage />
      </Suspense>
    </AdminGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  introRoute,
  loginRoute,
  registerRoute,
  verifyEmailRoute,
  bannedRoute,
  bannedSupportRoute,
  aiShopperRoute,
  recipesRoute,
  subscriptionsRoute,
  locationSetupRoute,
  homeRoute,
  categoryRoute,
  comparisonRoute,
  sharedWishlistRoute,
  productRoute,
  cartRoute,
  checkoutRoute,
  ordersRoute,
  orderDetailRoute,
  orderTrackingRoute,
  profileRoute,
  searchRoute,
  wishlistRoute,
  bundlesRoute,
  bundleDetailRoute,
  walletRoute,
  referralsRoute,
  mealPlannerRoute,
  smartPantryRoute,
  adminRoute,
  adminProductsRoute,
  adminOrdersRoute,
  adminUsersRoute,
  adminAnalyticsRoute,
  adminPromotionsRoute,
  adminBundlesRoute,
  adminCollectionsRoute,
  adminWalletRoute,
  adminChatRoute,
  adminLocationsRoute,
  adminCouponsRoute,
  adminFlashDealsRoute,
  adminReviewsRoute,
  adminBannersRoute,
  adminRecipesRoute,
  adminSubscriptionsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  useEffect(() => {
    // Smart Subscription Auto-Add Logic (Simulated for Monday)
    const checkSubscription = () => {
      const activePlan = localStorage.getItem("nexgro_active_subscription");
      const lastAddDate = localStorage.getItem("nexgro_subscription_last_added");
      const today = new Date();
      const isMonday = today.getDay() === 1;
      const todayDateStr = today.toISOString().split("T")[0];

      if (activePlan === "Weekly Essentials" && isMonday && lastAddDate !== todayDateStr) {
        const cart = JSON.parse(localStorage.getItem("nexgro_cart_v1") || "[]");
        const essentials = [
          { productId: "p4", qty: 1 }, // Milk
          { productId: "p6", qty: 1 }, // Bread
          { productId: "p10", qty: 1 } // Eggs
        ];
        
        let updated = [...cart];
        essentials.forEach(item => {
          const existing = updated.find(i => i.productId === item.productId);
          if (existing) {
            existing.qty += item.qty;
          } else {
            updated.push(item);
          }
        });

        localStorage.setItem("nexgro_cart_v1", JSON.stringify(updated));
        localStorage.setItem("nexgro_subscription_last_added", todayDateStr);
        window.dispatchEvent(new Event("storage"));
      }
    };

    checkSubscription();
  }, []);

  useEffect(() => {
    console.log("🔔 App mounted: Initializing notifications...");
    // Request FCM token on mount
    const setupNotifications = async () => {
      const token = await requestForToken();
      if (token) {
        console.log("✅ FCM Token retrieved successfully");
      } else {
        console.log("❌ FCM Token could not be retrieved (Check config/permissions)");
      }
    };

    setupNotifications();

    // Listen for foreground messages
    onMessageListener().then((payload: any) => {
      if (payload?.notification) {
        toast.info(`${payload.notification.title}: ${payload.notification.body}`, {
          duration: 5000,
          position: "top-center"
        });
      }
    });
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ComparisonProvider>
          <RouterProvider router={router} />
        </ComparisonProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
