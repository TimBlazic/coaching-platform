import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [progressData, setProgressData] = useState({
    weight: 0,
    bodyFat: 0,
    measurements: {
      chest: 0,
      waist: 0,
      hips: 0,
      arms: 0,
      thighs: 0,
    },
    notes: "",
    mood: 5,
    energy: 5,
  });

  const client = useQuery(api.clients.getClient, { 
    clientId: clientId as Id<"clients"> 
  });
  const progress = useQuery(api.clients.getClientProgress, { 
    clientId: clientId as Id<"clients"> 
  }) || [];
  const workouts = useQuery(api.exercises.getCoachWorkouts) || [];
  const mealPlans = useQuery(api.meals.getCoachMealPlans) || [];
  const pricingPlans = useQuery(api.pricingPlans.getCoachPricingPlans) || [];
  
  const updateClient = useMutation(api.clients.updateClient);
  const addProgress = useMutation(api.clients.addClientProgress);

  if (!client) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Client Not Found</h1>
          <p className="text-gray-600">This client may have been removed or you don't have access.</p>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = async (status: string) => {
    try {
      await updateClient({
        clientId: clientId as Id<"clients">,
        status: status as any,
      });
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handlePaymentStatusUpdate = async (paymentStatus: string) => {
    try {
      await updateClient({
        clientId: clientId as Id<"clients">,
        paymentStatus: paymentStatus as any,
      });
      toast.success("Payment status updated successfully");
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

  const handleWorkoutAssignment = async (workoutId: string) => {
    try {
      await updateClient({
        clientId: clientId as Id<"clients">,
        currentWorkoutSplit: workoutId ? workoutId as Id<"workoutSplits"> : undefined,
      });
      toast.success("Workout assigned successfully");
    } catch (error) {
      toast.error("Failed to assign workout");
    }
  };

  const handleMealPlanAssignment = async (mealPlanId: string) => {
    try {
      await updateClient({
        clientId: clientId as Id<"clients">,
        currentMealPlan: mealPlanId ? mealPlanId as Id<"mealPlans"> : undefined,
      });
      toast.success("Meal plan assigned successfully");
    } catch (error) {
      toast.error("Failed to assign meal plan");
    }
  };

  const handlePricingPlanAssignment = async (pricingPlanId: string) => {
    try {
      await updateClient({
        clientId: clientId as Id<"clients">,
        currentPricingPlan: pricingPlanId ? pricingPlanId as Id<"pricingPlans"> : undefined,
      });
      toast.success("Pricing plan assigned successfully");
    } catch (error) {
      toast.error("Failed to assign pricing plan");
    }
  };

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addProgress({
        clientId: clientId as Id<"clients">,
        weight: progressData.weight || undefined,
        bodyFat: progressData.bodyFat || undefined,
        measurements: progressData.measurements,
        photos: [],
        notes: progressData.notes || undefined,
        mood: progressData.mood,
        energy: progressData.energy,
      });
      
      toast.success("Progress added successfully!");
      setProgressData({
        weight: 0,
        bodyFat: 0,
        measurements: { chest: 0, waist: 0, hips: 0, arms: 0, thighs: 0 },
        notes: "",
        mood: 5,
        energy: 5,
      });
      setShowProgressForm(false);
    } catch (error) {
      toast.error("Failed to add progress");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const currentPricingPlan = pricingPlans.find(p => p._id === client.currentPricingPlan);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{client.name}</h1>
            <p className="text-gray-600">{client.email}</p>
            {client.phone && <p className="text-gray-600">{client.phone}</p>}
          </div>
          <div className="text-right">
            <div className="flex gap-2 mb-2">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(client.status)}`}>
                {client.status}
              </span>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusColor(client.paymentStatus)}`}>
                {client.paymentStatus}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Client since {new Date(client.startDate).toLocaleDateString()}
            </p>
            <p className="text-lg font-semibold text-gray-900">
              ${client.monthlyRate || 0}/month
            </p>
          </div>
        </div>

        {client.goals.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Goals</h3>
            <div className="flex flex-wrap gap-2">
              {client.goals.map((goal, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}

        {client.notes && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
            <p className="text-gray-600">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
          <select
            value={client.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Status</h3>
          <select
            value={client.paymentStatus}
            onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Contact</h3>
          <div className="space-y-2">
            <a
              href={`mailto:${client.email}`}
              className="block text-sm text-blue-600 hover:text-blue-800"
            >
              Send Email
            </a>
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="block text-sm text-blue-600 hover:text-blue-800"
              >
                Call Client
              </a>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Progress</h3>
          <button
            onClick={() => setShowProgressForm(true)}
            className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Add Progress
          </button>
        </div>
      </div>

      {/* Progress Form Modal */}
      {showProgressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Progress Entry</h2>
              <button
                onClick={() => setShowProgressForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProgressSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={progressData.weight}
                    onChange={(e) => setProgressData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Body Fat (%)
                  </label>
                  <input
                    type="number"
                    value={progressData.bodyFat}
                    onChange={(e) => setProgressData(prev => ({ ...prev, bodyFat: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Measurements (inches)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(progressData.measurements).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-600 mb-1 capitalize">{key}</label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setProgressData(prev => ({
                          ...prev,
                          measurements: { ...prev.measurements, [key]: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="0.1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mood (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={progressData.mood}
                    onChange={(e) => setProgressData(prev => ({ ...prev, mood: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">{progressData.mood}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Energy (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={progressData.energy}
                    onChange={(e) => setProgressData(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">{progressData.energy}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={progressData.notes}
                  onChange={(e) => setProgressData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional notes about progress"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Add Progress
                </button>
                <button
                  type="button"
                  onClick={() => setShowProgressForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview" },
              { id: "progress", label: `Progress (${progress.length})` },
              { id: "programs", label: "Programs" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Latest Progress</h3>
                  {progress.length > 0 ? (
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {progress[0].weight ? `${progress[0].weight} lbs` : "No weight"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(progress[0].date).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No progress recorded</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Workout</h3>
                  <p className="text-green-600 font-medium">
                    {client.currentWorkoutSplit ? "Assigned" : "Not assigned"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Plan</h3>
                  <p className="text-purple-600 font-medium">
                    {currentPricingPlan ? currentPricingPlan.name : "No plan assigned"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "progress" && (
            <div className="space-y-4">
              {progress.map((entry) => (
                <div key={entry._id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">
                      {new Date(entry.date).toLocaleDateString()}
                    </h3>
                    <div className="flex gap-4 text-sm">
                      {entry.mood && (
                        <span className="text-gray-600">Mood: {entry.mood}/10</span>
                      )}
                      {entry.energy && (
                        <span className="text-gray-600">Energy: {entry.energy}/10</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    {entry.weight && (
                      <div>
                        <p className="text-sm text-gray-600">Weight</p>
                        <p className="font-semibold">{entry.weight} lbs</p>
                      </div>
                    )}
                    {entry.bodyFat && (
                      <div>
                        <p className="text-sm text-gray-600">Body Fat</p>
                        <p className="font-semibold">{entry.bodyFat}%</p>
                      </div>
                    )}
                  </div>

                  {entry.measurements && (
                    <div className="grid grid-cols-5 gap-4 mb-3">
                      {Object.entries(entry.measurements).map(([key, value]) => (
                        value ? (
                          <div key={key}>
                            <p className="text-sm text-gray-600 capitalize">{key}</p>
                            <p className="font-semibold">{value}"</p>
                          </div>
                        ) : null
                      ))}
                    </div>
                  )}

                  {entry.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="text-gray-900">{entry.notes}</p>
                    </div>
                  )}
                </div>
              ))}

              {progress.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No progress entries yet</p>
                  <button
                    onClick={() => setShowProgressForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Add First Progress Entry
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "programs" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Programs</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Workout Program</h4>
                    <select 
                      value={client.currentWorkoutSplit || ""}
                      onChange={(e) => handleWorkoutAssignment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a workout...</option>
                      {workouts.map(workout => (
                        <option key={workout._id} value={workout._id}>
                          {workout.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Meal Plan</h4>
                    <select 
                      value={client.currentMealPlan || ""}
                      onChange={(e) => handleMealPlanAssignment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a meal plan...</option>
                      {mealPlans.map(plan => (
                        <option key={plan._id} value={plan._id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Pricing Plan</h4>
                    <select 
                      value={client.currentPricingPlan || ""}
                      onChange={(e) => handlePricingPlanAssignment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a pricing plan...</option>
                      {pricingPlans.map(plan => (
                        <option key={plan._id} value={plan._id}>
                          {plan.name} - ${plan.price}/{plan.billingPeriod}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
