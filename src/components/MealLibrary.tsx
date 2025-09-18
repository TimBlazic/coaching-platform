import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

type Ingredient = {
  name: string;
  amount: string;
  unit: string;
};

export function MealLibrary() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ingredients: [{ name: "", amount: "", unit: "" }] as Ingredient[],
    instructions: [""],
    macros: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
    prepTime: 0,
    cookTime: 0,
    servings: 1,
  });

  const meals = useQuery(api.meals.getCoachMeals) || [];
  const createMeal = useMutation(api.meals.createMeal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a meal name");
      return;
    }

    const validIngredients = formData.ingredients.filter(
      (ing) => ing.name.trim() && ing.amount.trim() && ing.unit.trim()
    );

    if (validIngredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }

    const validInstructions = formData.instructions.filter((inst) =>
      inst.trim()
    );

    if (validInstructions.length === 0) {
      toast.error("Please add at least one instruction");
      return;
    }

    try {
      await createMeal({
        name: formData.name,
        description: formData.description || undefined,
        ingredients: validIngredients,
        instructions: validInstructions,
        macros: formData.macros,
        prepTime: formData.prepTime || undefined,
        cookTime: formData.cookTime || undefined,
        servings: formData.servings,
      });

      toast.success("Meal created successfully!");
      setFormData({
        name: "",
        description: "",
        ingredients: [{ name: "", amount: "", unit: "" }],
        instructions: [""],
        macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        prepTime: 0,
        cookTime: 0,
        servings: 1,
      });
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Failed to create meal");
    }
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", amount: "", unit: "" }],
    }));
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? value : inst
      ),
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const handleViewDetails = (meal: any) => {
    setSelectedMeal(meal);
    setShowDetailsDialog(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Meals</h1>
          <p className="text-muted-foreground">
            Create and manage your recipe database
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          {showCreateForm ? "Cancel" : "Create Meal"}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Create New Meal</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Grilled Chicken Salad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings
                </label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      servings: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
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
                placeholder="Brief description of the meal"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      prepTime: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cook Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.cookTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cookTime: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Macros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Nutrition (per serving)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={formData.macros.calories}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        macros: {
                          ...prev.macros,
                          calories: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={formData.macros.protein}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        macros: {
                          ...prev.macros,
                          protein: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={formData.macros.carbs}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        macros: {
                          ...prev.macros,
                          carbs: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={formData.macros.fat}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        macros: {
                          ...prev.macros,
                          fat: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Ingredients
                </label>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Ingredient
                </button>
              </div>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) =>
                      updateIngredient(index, "name", e.target.value)
                    }
                    className="col-span-6 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Ingredient name"
                  />
                  <input
                    type="text"
                    value={ingredient.amount}
                    onChange={(e) =>
                      updateIngredient(index, "amount", e.target.value)
                    }
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Amount"
                  />
                  <input
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) =>
                      updateIngredient(index, "unit", e.target.value)
                    }
                    className="col-span-3 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Unit"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="col-span-1 px-2 py-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Instructions
                </label>
                <button
                  type="button"
                  onClick={addInstruction}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Step
                </button>
              </div>
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <span className="px-2 py-2 bg-gray-100 rounded text-sm font-medium">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder={`Step ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Meal
            </button>
          </form>
        </div>
      )}

      {/* Meals Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Meal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Calories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Macros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Servings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Time
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
              {meals.map((meal) => (
                <tr
                  key={meal._id}
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
                          {meal.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {meal.description || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      {meal.macros.calories} cal
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-muted-foreground">
                      <div>P: {meal.macros.protein}g</div>
                      <div>C: {meal.macros.carbs}g</div>
                      <div>F: {meal.macros.fat}g</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">
                      {meal.servings} serving{meal.servings !== 1 ? "s" : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {meal.prepTime || meal.cookTime ? (
                        <>
                          {meal.prepTime ? `${meal.prepTime}m prep` : ""}
                          {meal.prepTime && meal.cookTime ? " + " : ""}
                          {meal.cookTime ? `${meal.cookTime}m cook` : ""}
                        </>
                      ) : (
                        "Not set"
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {new Date(meal._creationTime).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(meal)}
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

      {meals.length === 0 && !showCreateForm && (
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
            <p className="text-muted-foreground mb-4">No meals created yet</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Your First Meal
            </button>
          </div>
        </div>
      )}

      {/* Meal Details Dialog */}
      {showDetailsDialog && selectedMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedMeal.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedMeal.macros.calories} calories •{" "}
                  {selectedMeal.servings} serving
                  {selectedMeal.servings !== 1 ? "s" : ""}
                  {(selectedMeal.prepTime || selectedMeal.cookTime) && (
                    <>
                      {" • "}
                      {selectedMeal.prepTime
                        ? `${selectedMeal.prepTime}m prep`
                        : ""}
                      {selectedMeal.prepTime && selectedMeal.cookTime
                        ? " + "
                        : ""}
                      {selectedMeal.cookTime
                        ? `${selectedMeal.cookTime}m cook`
                        : ""}
                    </>
                  )}
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
                {selectedMeal.description && (
                  <div className="card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-2">
                      Description
                    </h3>
                    <p className="text-foreground">
                      {selectedMeal.description}
                    </p>
                  </div>
                )}

                {/* Macros */}
                <div className="card p-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Nutritional Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedMeal.macros.calories}
                      </p>
                      <p className="text-xs text-muted-foreground">Calories</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {selectedMeal.macros.protein}g
                      </p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedMeal.macros.carbs}g
                      </p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {selectedMeal.macros.fat}g
                      </p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="card p-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Ingredients
                  </h3>
                  <ul className="space-y-2">
                    {selectedMeal.ingredients.map(
                      (ingredient: any, index: number) => (
                        <li
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-border last:border-b-0"
                        >
                          <span className="text-foreground">
                            {ingredient.amount} {ingredient.unit}{" "}
                            {ingredient.name}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Instructions */}
                {selectedMeal.instructions.length > 0 && (
                  <div className="card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">
                      Instructions
                    </h3>
                    <ol className="space-y-3">
                      {selectedMeal.instructions.map(
                        (instruction: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-medium text-primary-foreground mr-3 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-foreground">
                              {instruction}
                            </span>
                          </li>
                        )
                      )}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
