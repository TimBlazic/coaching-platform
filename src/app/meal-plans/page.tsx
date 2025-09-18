import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

type MealPlanMeal = {
  mealId: Id<"meals">;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servings: number;
};

export default function MealPlanBuilder() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    meals: [] as MealPlanMeal[],
    isTemplate: true,
  });

  const meals = useQuery(api.meals.getCoachMeals) || [];
  const mealPlans = useQuery(api.meals.getCoachMealPlans) || [];
  const createMealPlan = useMutation(api.meals.createMealPlan);

  const calculateTotalMacros = () => {
    let totalMacros = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    formData.meals.forEach((planMeal) => {
      const meal = meals.find((m) => m._id === planMeal.mealId);
      if (meal) {
        totalMacros.calories += meal.macros.calories * planMeal.servings;
        totalMacros.protein += meal.macros.protein * planMeal.servings;
        totalMacros.carbs += meal.macros.carbs * planMeal.servings;
        totalMacros.fat += meal.macros.fat * planMeal.servings;
      }
    });

    return totalMacros;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a meal plan name");
      return;
    }

    if (formData.meals.length === 0) {
      toast.error("Please add at least one meal");
      return;
    }

    try {
      const totalMacros = calculateTotalMacros();

      await createMealPlan({
        name: formData.name,
        description: formData.description || undefined,
        meals: formData.meals,
        totalMacros,
        isTemplate: formData.isTemplate,
      });

      toast.success("Meal plan created successfully!");
      setFormData({
        name: "",
        description: "",
        meals: [],
        isTemplate: true,
      });
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Failed to create meal plan");
    }
  };

  const addMeal = () => {
    if (meals.length === 0) {
      toast.error("Please create some meals first");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      meals: [
        ...prev.meals,
        {
          mealId: meals[0]._id,
          mealType: "breakfast",
          servings: 1,
        },
      ],
    }));
  };

  const updateMeal = (index: number, updates: Partial<MealPlanMeal>) => {
    setFormData((prev) => ({
      ...prev,
      meals: prev.meals.map((meal, i) =>
        i === index ? { ...meal, ...updates } : meal
      ),
    }));
  };

  const removeMeal = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index),
    }));
  };

  const totalMacros = calculateTotalMacros();

  const handleViewDetails = (mealPlan: any) => {
    setSelectedMealPlan(mealPlan);
    setShowDetailsDialog(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Meal Plans
          </h1>
          <p className="text-muted-foreground">
            Create daily meal plans and nutrition templates
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          {showCreateForm ? "Cancel" : "Create Meal Plan"}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Create New Meal Plan</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Plan Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., High Protein Day"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the meal plan"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isTemplate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isTemplate: e.target.checked,
                  }))
                }
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Save as template</label>
            </div>

            {/* Total Macros Preview */}
            {formData.meals.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Total Daily Nutrition
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(totalMacros.calories)}
                    </p>
                    <p className="text-xs text-gray-600">Calories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(totalMacros.protein)}g
                    </p>
                    <p className="text-xs text-gray-600">Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {Math.round(totalMacros.carbs)}g
                    </p>
                    <p className="text-xs text-gray-600">Carbs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {Math.round(totalMacros.fat)}g
                    </p>
                    <p className="text-xs text-gray-600">Fat</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Meals
                </label>
                <button
                  type="button"
                  onClick={addMeal}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                >
                  Add Meal
                </button>
              </div>

              <div className="space-y-4">
                {formData.meals.map((meal, index) => {
                  const mealData = meals.find((m) => m._id === meal.mealId);
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-900">
                          Meal {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMeal(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Meal
                          </label>
                          <select
                            value={meal.mealId}
                            onChange={(e) =>
                              updateMeal(index, {
                                mealId: e.target.value as Id<"meals">,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {meals.map((m) => (
                              <option key={m._id} value={m._id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Meal Type
                          </label>
                          <select
                            value={meal.mealType}
                            onChange={(e) =>
                              updateMeal(index, {
                                mealType: e.target.value as any,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snack">Snack</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Servings
                          </label>
                          <input
                            type="number"
                            value={meal.servings}
                            onChange={(e) =>
                              updateMeal(index, {
                                servings: parseFloat(e.target.value) || 1,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0.5"
                            step="0.5"
                          />
                        </div>
                      </div>

                      {mealData && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">
                              {mealData.name}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              {meal.mealType}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div className="text-center">
                              <p className="font-semibold">
                                {Math.round(
                                  mealData.macros.calories * meal.servings
                                )}
                              </p>
                              <p className="text-gray-600">cal</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold">
                                {Math.round(
                                  mealData.macros.protein * meal.servings
                                )}
                                g
                              </p>
                              <p className="text-gray-600">protein</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold">
                                {Math.round(
                                  mealData.macros.carbs * meal.servings
                                )}
                                g
                              </p>
                              <p className="text-gray-600">carbs</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold">
                                {Math.round(
                                  mealData.macros.fat * meal.servings
                                )}
                                g
                              </p>
                              <p className="text-gray-600">fat</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Meal Plan
            </button>
          </form>
        </div>
      )}

      {/* Meal Plans Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Meal Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Calories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Macros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Meals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mealPlans.map((plan) => (
                <tr
                  key={plan._id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-primary-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {plan.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {plan.description || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        plan.isTemplate
                          ? "bg-blue-100 text-blue-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {plan.isTemplate ? "Template" : "Custom"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      {Math.round(plan.totalMacros.calories)} cal
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-muted-foreground">
                      <div>P: {Math.round(plan.totalMacros.protein)}g</div>
                      <div>C: {Math.round(plan.totalMacros.carbs)}g</div>
                      <div>F: {Math.round(plan.totalMacros.fat)}g</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">
                      {plan.meals.length} meals
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {new Date(plan._creationTime).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(plan)}
                      className="btn-outline text-xs px-3 py-1"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mealPlans.length === 0 && !showCreateForm && (
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <p className="text-muted-foreground mb-4">
              No meal plans created yet
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Your First Meal Plan
            </button>
          </div>
        </div>
      )}

      {/* Meal Plan Details Dialog */}
      {showDetailsDialog && selectedMealPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedMealPlan.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedMealPlan.isTemplate
                    ? "Template"
                    : "Custom Meal Plan"}{" "}
                  • {selectedMealPlan.meals.length} meals
                  {" • "}
                  {Math.round(selectedMealPlan.totalMacros.calories)} calories
                </p>
              </div>
              <button
                onClick={() => setShowDetailsDialog(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Description */}
                {selectedMealPlan.description && (
                  <div className="card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-2">
                      Description
                    </h3>
                    <p className="text-foreground">
                      {selectedMealPlan.description}
                    </p>
                  </div>
                )}

                {/* Total Macros */}
                <div className="card p-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Total Nutritional Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(selectedMealPlan.totalMacros.calories)}
                      </p>
                      <p className="text-xs text-muted-foreground">Calories</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(selectedMealPlan.totalMacros.protein)}g
                      </p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {Math.round(selectedMealPlan.totalMacros.carbs)}g
                      </p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {Math.round(selectedMealPlan.totalMacros.fat)}g
                      </p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                  </div>
                </div>

                {/* Meals */}
                <div className="card p-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Meals
                  </h3>
                  <div className="space-y-4">
                    {selectedMealPlan.meals.map((meal: any, index: number) => {
                      const mealData = meals.find((m) => m._id === meal.mealId);
                      return (
                        <div
                          key={index}
                          className="border border-border rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-sm font-medium text-foreground">
                              Meal {index + 1}
                            </h4>
                            <span className="text-xs text-muted-foreground capitalize">
                              {meal.mealType}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Meal:
                              </span>
                              <p className="font-medium text-foreground">
                                {mealData?.name || "Unknown Meal"}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Servings:
                              </span>
                              <p className="font-medium text-foreground">
                                {meal.servings}
                              </p>
                            </div>
                          </div>

                          {mealData && (
                            <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                              <div className="text-center p-2 bg-blue-50 rounded">
                                <p className="font-semibold text-blue-600">
                                  {Math.round(
                                    mealData.macros.calories * meal.servings
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  cal
                                </p>
                              </div>
                              <div className="text-center p-2 bg-green-50 rounded">
                                <p className="font-semibold text-green-600">
                                  {Math.round(
                                    mealData.macros.protein * meal.servings
                                  )}
                                  g
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  protein
                                </p>
                              </div>
                              <div className="text-center p-2 bg-yellow-50 rounded">
                                <p className="font-semibold text-yellow-600">
                                  {Math.round(
                                    mealData.macros.carbs * meal.servings
                                  )}
                                  g
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  carbs
                                </p>
                              </div>
                              <div className="text-center p-2 bg-red-50 rounded">
                                <p className="font-semibold text-red-600">
                                  {Math.round(
                                    mealData.macros.fat * meal.servings
                                  )}
                                  g
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  fat
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
