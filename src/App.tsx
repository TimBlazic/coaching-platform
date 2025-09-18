import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import Dashboard from "./app/dashboard/page";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import FormBuilder from "./app/forms/page";
import FormSubmissions from "./app/forms/submissions/page";
import PublicForm from "./app/public-form/page";
import ExerciseLibrary from "./app/exercises/page";
import WorkoutBuilder from "./app/workouts/page";
import MealLibrary from "./app/meals/page";
import MealPlanBuilder from "./app/meal-plans/page";
import ClientsOverview from "./app/clients/page";
import ClientDetail from "./app/clients/[clientId]/page";
import PublicPageBuilder from "./app/public-page/page";
import PublicPage from "./app/coach/[slug]/page";
import PricingPlans from "./app/pricing-plans/page";
import { useState } from "react";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Public routes */}
          <Route path="/form/:formId" element={<PublicForm />} />
          <Route path="/coach/:slug" element={<PublicPage />} />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <>
                <Authenticated>
                  <MainLayout />
                </Authenticated>

                <Unauthenticated>
                  <div className="min-h-screen flex items-center justify-center bg-background p-8">
                    <div className="w-full max-w-md mx-auto">
                      <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-primary-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                          CoachHub
                        </h1>
                        <p className="text-muted-foreground">
                          Your all-in-one coaching platform
                        </p>
                      </div>
                      <div className="card p-6">
                        <SignInForm />
                      </div>
                    </div>
                  </div>
                </Unauthenticated>
              </>
            }
          />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Clients", href: "/clients", icon: UsersIcon },
    { name: "Forms", href: "/forms", icon: DocumentTextIcon },
    { name: "Exercises", href: "/exercises", icon: LightningBoltIcon },
    { name: "Workouts", href: "/workouts", icon: FireIcon },
    { name: "Meals", href: "/meals", icon: CakeIcon },
    { name: "Meal Plans", href: "/meal-plans", icon: ClipboardListIcon },
    { name: "Pricing Plans", href: "/pricing-plans", icon: CurrencyDollarIcon },
    { name: "Public Page", href: "/public-page", icon: GlobeAltIcon },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? "" : "hidden"}`}
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-background border-r">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-background hover:bg-accent transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <XIcon className="h-6 w-6 text-foreground" />
            </button>
          </div>
          <SidebarContent navigation={navigation} location={location} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} location={location} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-background border-b px-4 py-3">
            <button
              className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground font-medium">
                {loggedInUser?.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/forms" element={<FormBuilder />} />
              <Route path="/forms/submissions" element={<FormSubmissions />} />
              <Route path="/exercises" element={<ExerciseLibrary />} />
              <Route path="/workouts" element={<WorkoutBuilder />} />
              <Route path="/meals" element={<MealLibrary />} />
              <Route path="/meal-plans" element={<MealPlanBuilder />} />
              <Route path="/clients" element={<ClientsOverview />} />
              <Route path="/clients/:clientId" element={<ClientDetail />} />
              <Route path="/pricing-plans" element={<PricingPlans />} />
              <Route path="/public-page" element={<PublicPageBuilder />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  navigation,
  location,
}: {
  navigation: any[];
  location: any;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  return (
    <div className="flex flex-col flex-grow bg-background border-r pt-6 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-6 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h2 className="ml-3 text-xl font-semibold text-foreground">CoachHub</h2>
      </div>

      <div className="mt-2 flex-grow flex flex-col">
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-4 w-4 transition-colors ${
                    isActive
                      ? "text-accent-foreground"
                      : "text-muted-foreground group-hover:text-accent-foreground"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="flex-shrink-0 flex border-t p-4 mt-4">
          <div className="flex items-center w-full">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {loggedInUser?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {loggedInUser?.email}
              </p>
              <p className="text-xs text-muted-foreground">Coach</p>
            </div>
            <div className="ml-2">
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function HomeIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function UsersIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
      />
    </svg>
  );
}

function DocumentTextIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function LightningBoltIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

function FireIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
      />
    </svg>
  );
}

function CakeIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A2.704 2.704 0 003 15.546V12c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v3.546zM7 4V2c0-.55.45-1 1-1s1 .45 1 1v2M17 4V2c0-.55.45-1 1-1s1 .45 1 1v2"
      />
    </svg>
  );
}

function ClipboardListIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );
}

function CurrencyDollarIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
      />
    </svg>
  );
}

function GlobeAltIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  );
}

function MenuIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function XIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
