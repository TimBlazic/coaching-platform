import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ExerciseLibrary() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    muscleGroups: [""],
    equipment: [""],
    instructions: [""],
    cues: [""],
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
  });

  const exercises = useQuery(api.exercises.getCoachExercises) || [];
  const createExercise = useMutation(api.exercises.createExercise);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Please fill in name and description");
      return;
    }

    const validMuscleGroups = formData.muscleGroups.filter((mg) => mg.trim());
    const validEquipment = formData.equipment.filter((eq) => eq.trim());
    const validInstructions = formData.instructions.filter((inst) =>
      inst.trim()
    );
    const validCues = formData.cues.filter((cue) => cue.trim());

    if (validMuscleGroups.length === 0) {
      toast.error("Please add at least one muscle group");
      return;
    }

    try {
      await createExercise({
        name: formData.name,
        description: formData.description,
        muscleGroups: validMuscleGroups,
        equipment: validEquipment,
        instructions: validInstructions,
        cues: validCues,
        difficulty: formData.difficulty,
      });

      toast.success("Exercise created successfully!");
      setFormData({
        name: "",
        description: "",
        muscleGroups: [""],
        equipment: [""],
        instructions: [""],
        cues: [""],
        difficulty: "beginner",
      });
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Failed to create exercise");
    }
  };

  const addArrayItem = (field: keyof typeof formData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ""],
    }));
  };

  const updateArrayItem = (
    field: keyof typeof formData,
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleViewDetails = (exercise: any) => {
    setSelectedExercise(exercise);
    setShowDetailsDialog(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Exercises</h1>
          <p className="text-muted-foreground">
            Create and manage your exercise database
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          {showCreateForm ? "Cancel" : "Add Exercise"}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6">Create New Exercise</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Barbell Squat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      difficulty: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Brief description of the exercise"
              />
            </div>

            {/* Muscle Groups */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Muscle Groups *
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem("muscleGroups")}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  + Add Muscle Group
                </button>
              </div>
              {formData.muscleGroups.map((group, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={group}
                    onChange={(e) =>
                      updateArrayItem("muscleGroups", index, e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g., Quadriceps"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("muscleGroups", index)}
                    className="px-3 py-2 text-gray-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Equipment */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Equipment
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem("equipment")}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  + Add Equipment
                </button>
              </div>
              {formData.equipment.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) =>
                      updateArrayItem("equipment", index, e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g., Barbell"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("equipment", index)}
                    className="px-3 py-2 text-gray-400 hover:text-red-600"
                  >
                    Remove
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
                  onClick={() => addArrayItem("instructions")}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  + Add Step
                </button>
              </div>
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) =>
                      updateArrayItem("instructions", index, e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder={`Step ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("instructions", index)}
                    className="px-3 py-2 text-gray-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Coaching Cues */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Coaching Cues
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem("cues")}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  + Add Cue
                </button>
              </div>
              {formData.cues.map((cue, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={cue}
                    onChange={(e) =>
                      updateArrayItem("cues", index, e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g., Keep your chest up"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("cues", index)}
                    className="px-3 py-2 text-gray-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create Exercise
            </button>
          </form>
        </div>
      )}

      {/* Exercises Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Exercise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Muscle Groups
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Equipment
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
              {exercises.map((exercise) => (
                <tr
                  key={exercise._id}
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
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {exercise.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {exercise.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(exercise.difficulty)}`}
                    >
                      {exercise.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {exercise.muscleGroups.slice(0, 2).map((group, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                        >
                          {group}
                        </span>
                      ))}
                      {exercise.muscleGroups.length > 2 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          +{exercise.muscleGroups.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {exercise.equipment.slice(0, 2).map((item, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                      {exercise.equipment.length > 2 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          +{exercise.equipment.length - 2}
                        </span>
                      )}
                      {exercise.equipment.length === 0 && (
                        <span className="text-sm text-muted-foreground">
                          Bodyweight
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {new Date(exercise._creationTime).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(exercise)}
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

      {exercises.length === 0 && !showCreateForm && (
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <p className="text-muted-foreground mb-4">
              No exercises created yet
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Your First Exercise
            </button>
          </div>
        </div>
      )}

      {/* Exercise Details Dialog */}
      {showDetailsDialog && selectedExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedExercise.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(selectedExercise.difficulty)}`}
                  >
                    {selectedExercise.difficulty}
                  </span>
                  {" • "}
                  {selectedExercise.muscleGroups.length} muscle groups
                  {" • "}
                  {selectedExercise.equipment.length} equipment items
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
                <div className="card p-4">
                  <h3 className="text-sm font-medium text-foreground mb-2">
                    Description
                  </h3>
                  <p className="text-foreground">
                    {selectedExercise.description}
                  </p>
                </div>

                {/* Muscle Groups */}
                <div className="card p-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Muscle Groups
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.muscleGroups.map(
                      (group: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                        >
                          {group}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Equipment */}
                {selectedExercise.equipment.length > 0 && (
                  <div className="card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">
                      Equipment
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.equipment.map(
                        (item: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                          >
                            {item}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {selectedExercise.instructions.length > 0 && (
                  <div className="card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">
                      Instructions
                    </h3>
                    <ol className="space-y-2">
                      {selectedExercise.instructions.map(
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

                {/* Coaching Cues */}
                {selectedExercise.cues.length > 0 && (
                  <div className="card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">
                      Coaching Cues
                    </h3>
                    <ul className="space-y-2">
                      {selectedExercise.cues.map(
                        (cue: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mr-3 mt-2"></span>
                            <span className="text-foreground">{cue}</span>
                          </li>
                        )
                      )}
                    </ul>
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
