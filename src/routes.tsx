import { createBrowserRouter } from "react-router";
import RootLayout from "@/app/root-layout";
import RouteError from "@/app/route-error";
import NotFoundPage from "@/app/not-found";
import HomePage from "@/pages/home";
import DashboardPage from "@/pages/dashboard";
import HowItWorksPage from "@/pages/how-it-works";
import PoliciesPage, { policiesLoader } from "@/pages/policies";
import NewPolicyPage from "@/pages/new-policy";
import PolicyDetailPage, { policyLoader } from "@/pages/policy-detail";

const errorElement = <RouteError />;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement,
    children: [
      { index: true, element: <HomePage />, errorElement },
      { path: "dashboard", element: <DashboardPage />, errorElement },
      { path: "how-it-works", element: <HowItWorksPage />, errorElement },
      { path: "policies", element: <PoliciesPage />, loader: policiesLoader, errorElement },
      { path: "policies/new", element: <NewPolicyPage />, errorElement },
      { path: "policy/:policyId", element: <PolicyDetailPage />, loader: policyLoader, errorElement },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
