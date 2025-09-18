import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

type WorkoutExercise = {
  exerciseId: Id<"exercises">;
  sets: number;
  reps: string;
  weight: string;
  restTime: string;
  notes: string;
};

export function WorkoutBuilder() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    exercises: [] as WorkoutExercise[],
    estimatedDuration: 0,
    isTemplate: true,
  });

  const exercises = useQuery(api.exercises.getCoachExercises) || [];
  const workouts = useQuery(api.exercises.getCoachWorkouts) || [];
  const createWorkout = useMutation(api.exercises.createWorkout);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a workout name");
      return;
    }

    if (formData.exercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    try {
      await createWorkout({
        name: formData.name,
        description: formData.description || undefined,
        exercises: formData.exercises,
        estimatedDuration: formData.estimatedDuration || undefined,
        isTemplate: formData.isTemplate,
      });

      toast.success("Workout created successfully!");
      setFormData({
        name: "",
        description: "",
        exercises: [],
        estimatedDuration: 0,
        isTemplate: true,
      });
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Failed to create workout");
    }
  };

  const addExercise = () => {
    if (exercises.length === 0) {
      toast.error("Please create some exercises first");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exerciseId: exercises[0]._id,
          sets: 3,
          reps: "10",
          weight: "",
          restTime: "60s",
          notes: "",
        },
      ],
    }));
  };

  const updateExercise = (index: number, updates: Partial<WorkoutExercise>) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { ...ex, ...updates } : ex
      ),
    }));
  };

  const removeExercise = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const handleViewDetails = (workout: any) => {
    setSelectedWorkout(workout);
    setShowDetailsDialog(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Workouts</h1>
          <p className="text-muted-foreground">
            Create workout templates and routines
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          {showCreateForm ? "Cancel" : "Create Workout"}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Create New Workout</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Upper Body Strength"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimatedDuration: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="60"
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
                placeholder="Brief description of the workout"
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

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Exercises
                </label>
                <button
                  type="button"
                  onClick={addExercise}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                >
                  Add Exercise
                </button>
              </div>

              <div className="space-y-4">
                {formData.exercises.map((exercise, index) => {
                  const exerciseData = exercises.find(
                    (e) => e._id === exercise.exerciseId
                  );
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-900">
                          Exercise {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Exercise
                          </label>
                          <select
                            value={exercise.exerciseId}
                            onChange={(e) =>
                              updateExercise(index, {
                                exerciseId: e.target.value as Id<"exercises">,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {exercises.map((ex) => (
                              <option key={ex._id} value={ex._id}>
                                {ex.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Sets
                          </label>
                          <input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) =>
                              updateExercise(index, {
                                sets: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="1"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Reps
                          </label>
                          <input
                            type="text"
                            value={exercise.reps}
                            onChange={(e) =>
                              updateExercise(index, { reps: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="8-12"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Weight
                          </label>
                          <input
                            type="text"
                            value={exercise.weight}
                            onChange={(e) =>
                              updateExercise(index, { weight: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="135lbs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Rest
                          </label>
                          <input
                            type="text"
                            value={exercise.restTime}
                            onChange={(e) =>
                              updateExercise(index, {
                                restTime: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="60s"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs text-gray-600 mb-1">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={exercise.notes}
                          onChange={(e) =>
                            updateExercise(index, { notes: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Exercise-specific notes"
                        />
                      </div>

                      {exerciseData && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">
                            {exerciseData.name}
                          </span>{" "}
                          - {exerciseData.muscleGroups.join(", ")}
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
              Create Workout
            </button>
          </form>
        </div>
      )}

      {/* Workouts Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Workout
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Exercises
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
              {workouts.map((workout) => (
                <tr
                  key={workout._id}
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
                          {workout.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {workout.description || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        workout.isTemplate
                          ? "bg-blue-100 text-blue-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {workout.isTemplate ? "Template" : "Custom"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">
                      {workout.estimatedDuration
                        ? `${workout.estimatedDuration} min`
                        : "Not set"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">
                      {workout.exercises.length} exercises
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {new Date(workout._creationTime).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(workout)}
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

      {workouts.length === 0 && !showCreateForm && (
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
              No workouts created yet
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Your First Workout
            </button>
          </div>
        </div>
      )}

      {/* Workout Details Dialog */}
      {showDetailsDialog && selectedWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedWorkout.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedWorkout.isTemplate ? "Template" : "Custom Workout"} •{" "}
                  {selectedWorkout.exercises.length} exercises
                  {selectedWorkout.estimatedDuration &&
                    ` • ${selectedWorkout.estimatedDuration} min`}
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
              {selectedWorkout.description && (
                <div className="card p-4 mb-6">
                  <h3 className="text-sm font-medium text-foreground mb-2">
                    Description
                  </h3>
                  <p className="text-foreground">
                    {selectedWorkout.description}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Exercises
                </h3>
                {selectedWorkout.exercises.map(
                  (exercise: any, index: number) => {
                    const exerciseData = exercises.find(
                      (e) => e._id === exercise.exerciseId
                    );
                    return (
                      <div key={index} className="card p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-sm font-medium text-foreground">
                            Exercise {index + 1}
                          </h4>
                          {exerciseData && (
                            <span className="text-xs text-muted-foreground">
                              {exerciseData.muscleGroups.join(", ")}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Exercise:
                            </span>
                            <p className="font-medium text-foreground">
                              {exerciseData?.name || "Unknown Exercise"}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sets:</span>
                            <p className="font-medium text-foreground">
                              {exercise.sets}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reps:</span>
                            <p className="font-medium text-foreground">
                              {exercise.reps}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Weight:
                            </span>
                            <p className="font-medium text-foreground">
                              {exercise.weight || "Bodyweight"}
                            </p>
                          </div>
                        </div>

                        {(exercise.restTime || exercise.notes) && (
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {exercise.restTime && (
                              <div>
                                <span className="text-muted-foreground">
                                  Rest:
                                </span>
                                <p className="font-medium text-foreground">
                                  {exercise.restTime}
                                </p>
                              </div>
                            )}
                            {exercise.notes && (
                              <div>
                                <span className="text-muted-foreground">
                                  Notes:
                                </span>
                                <p className="font-medium text-foreground">
                                  {exercise.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
