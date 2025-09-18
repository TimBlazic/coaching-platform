import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function ClientsOverview() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    goals: [""],
    notes: "",
    monthlyRate: 0,
  });

  const clients = useQuery(api.clients.getCoachClients) || [];
  const createClient = useMutation(api.clients.createClient);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in name and email");
      return;
    }

    const validGoals = formData.goals.filter((g) => g.trim());

    try {
      await createClient({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        goals: validGoals,
        notes: formData.notes || undefined,
        monthlyRate: formData.monthlyRate || undefined,
      });

      toast.success("Client created successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        goals: [""],
        notes: "",
        monthlyRate: 0,
      });
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Failed to create client");
    }
  };

  const addGoal = () => {
    setFormData((prev) => ({
      ...prev,
      goals: [...prev.goals, ""],
    }));
  };

  const updateGoal = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.map((goal, i) => (i === index ? value : goal)),
    }));
  };

  const removeGoal = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Clients</h1>
          <p className="text-muted-foreground">Manage your coaching clients</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          {showCreateForm ? "Cancel" : "Add Client"}
        </button>
      </div>

      {showCreateForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6 text-foreground">
            Add New Client
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="input"
                  placeholder="Client's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="input"
                  placeholder="client@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="input"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Monthly Rate ($)
                </label>
                <input
                  type="number"
                  value={formData.monthlyRate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      monthlyRate: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="input"
                  placeholder="199"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-foreground">
                  Goals
                </label>
                <button
                  type="button"
                  onClick={addGoal}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  + Add Goal
                </button>
              </div>
              {formData.goals.map((goal, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => updateGoal(index, e.target.value)}
                    className="input flex-1"
                    placeholder={`Goal ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeGoal(index)}
                    className="btn-outline text-destructive hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className="input min-h-[80px] resize-none"
                placeholder="Any additional notes about the client"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Add Client
            </button>
          </form>
        </div>
      )}

      {/* Clients Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Monthly Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Goals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Since
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((client) => (
                <tr
                  key={client._id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/clients/${client._id}`)
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-primary-foreground">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {client.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {client.email}
                    </div>
                    {client.phone && (
                      <div className="text-sm text-muted-foreground">
                        {client.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(client.paymentStatus)}`}
                    >
                      {client.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      ${client.monthlyRate || 0}/month
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {client.goals.slice(0, 2).map((goal, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                        >
                          {goal}
                        </span>
                      ))}
                      {client.goals.length > 2 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          +{client.goals.length - 2}
                        </span>
                      )}
                      {client.goals.length === 0 && (
                        <span className="text-sm text-muted-foreground">
                          No goals
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {new Date(client.startDate).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {clients.length === 0 && !showCreateForm && (
        <div className="card">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <p className="text-muted-foreground mb-4">No clients yet</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Add Your First Client
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
