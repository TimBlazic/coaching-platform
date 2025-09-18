import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Dashboard() {
  const clients = useQuery(api.clients.getCoachClients) || [];
  const forms = useQuery(api.forms.getCoachForms) || [];
  const exercises = useQuery(api.exercises.getCoachExercises) || [];
  const meals = useQuery(api.meals.getCoachMeals) || [];

  const activeClients = clients.filter((c) => c.status === "active");
  const paidClients = clients.filter((c) => c.paymentStatus === "paid");
  const totalRevenue = paidClients.reduce(
    (sum, client) => sum + (client.monthlyRate || 0),
    0
  );

  const stats = [
    {
      name: "Total Clients",
      value: clients.length,
      icon: UsersIcon,
    },
    {
      name: "Active Clients",
      value: activeClients.length,
      icon: CheckCircleIcon,
    },
    {
      name: "Monthly Revenue",
      value: `$${totalRevenue}`,
      icon: CurrencyDollarIcon,
    },
    {
      name: "Forms Created",
      value: forms.length,
      icon: DocumentTextIcon,
    },
  ];

  const recentClients = clients
    .sort((a, b) => b.startDate - a.startDate)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your coaching business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center">
              <div className="bg-muted rounded-lg p-3">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Clients */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Clients
          </h2>
          <div className="space-y-3">
            {recentClients.map((client) => (
              <div
                key={client._id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">{client.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {client.email}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      client.status === "active"
                        ? "bg-green-100 text-green-800"
                        : client.status === "paused"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {client.status}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${client.monthlyRate || 0}/month
                  </p>
                </div>
              </div>
            ))}
            {recentClients.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No clients yet
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a
              href="/clients"
              className="flex items-center p-3 bg-muted rounded-lg hover:bg-accent transition-colors"
            >
              <UsersIcon className="h-5 w-5 text-muted-foreground mr-3" />
              <span className="font-medium text-foreground">
                Manage Clients
              </span>
            </a>
            <a
              href="/forms"
              className="flex items-center p-3 bg-muted rounded-lg hover:bg-accent transition-colors"
            >
              <DocumentTextIcon className="h-5 w-5 text-muted-foreground mr-3" />
              <span className="font-medium text-foreground">Create Form</span>
            </a>
            <a
              href="/exercises"
              className="flex items-center p-3 bg-muted rounded-lg hover:bg-accent transition-colors"
            >
              <LightningBoltIcon className="h-5 w-5 text-muted-foreground mr-3" />
              <span className="font-medium text-foreground">Add Exercise</span>
            </a>
            <a
              href="/meals"
              className="flex items-center p-3 bg-muted rounded-lg hover:bg-accent transition-colors"
            >
              <CakeIcon className="h-5 w-5 text-muted-foreground mr-3" />
              <span className="font-medium text-foreground">Create Meal</span>
            </a>
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-foreground mb-2">
            Exercise Library
          </h3>
          <p className="text-3xl font-bold text-foreground">
            {exercises.length}
          </p>
          <p className="text-sm text-muted-foreground">exercises created</p>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-foreground mb-2">
            Meal Library
          </h3>
          <p className="text-3xl font-bold text-foreground">{meals.length}</p>
          <p className="text-sm text-muted-foreground">meals created</p>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-foreground mb-2">
            Forms
          </h3>
          <p className="text-3xl font-bold text-foreground">{forms.length}</p>
          <p className="text-sm text-muted-foreground">forms created</p>
        </div>
      </div>
    </div>
  );
}

// Icons
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

function CheckCircleIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
