import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

type FormField = {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "file";
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
};

export default function FormBuilder() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const forms = useQuery(api.forms.getCoachForms) || [];
  const createForm = useMutation(api.forms.createForm);

  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: "",
      required: false,
      options: type === "select" || type === "radio" ? [""] : undefined,
      placeholder: "",
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const addOption = (fieldId: string) => {
    setFields(
      fields.map((field) =>
        field.id === fieldId && field.options
          ? { ...field, options: [...field.options, ""] }
          : field
      )
    );
  };

  const updateOption = (
    fieldId: string,
    optionIndex: number,
    value: string
  ) => {
    setFields(
      fields.map((field) =>
        field.id === fieldId && field.options
          ? {
              ...field,
              options: field.options.map((opt, idx) =>
                idx === optionIndex ? value : opt
              ),
            }
          : field
      )
    );
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFields(
      fields.map((field) =>
        field.id === fieldId && field.options
          ? {
              ...field,
              options: field.options.filter((_, idx) => idx !== optionIndex),
            }
          : field
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a form title");
      return;
    }

    if (fields.length === 0) {
      toast.error("Please add at least one field");
      return;
    }

    const invalidFields = fields.filter((field) => !field.label.trim());
    if (invalidFields.length > 0) {
      toast.error("Please fill in all field labels");
      return;
    }

    try {
      setIsCreating(true);
      await createForm({
        title,
        description: description || undefined,
        fields: fields.map((field) => ({
          ...field,
          options: field.options?.filter((opt) => opt.trim()) || undefined,
        })),
      });

      toast.success("Form created successfully!");
      setTitle("");
      setDescription("");
      setFields([]);
      setShowCreateDialog(false);
    } catch (error) {
      toast.error("Failed to create form");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Forms</h1>
          <p className="text-muted-foreground">
            Create forms for lead capture and client check-ins
          </p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="btn-primary"
        >
          Create Form
        </button>
      </div>

      {/* Forms Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Form
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fields
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
              {forms.map((form) => (
                <tr
                  key={form._id}
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {form.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {form.description || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        form.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">
                      {form.fields.length} fields
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {new Date(form._creationTime).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          window.open(`/form/${form._id}`, "_blank")
                        }
                        className="btn-outline text-xs px-3 py-1"
                      >
                        Preview
                      </button>
                      <a
                        href={`/forms/${form._id}/submissions`}
                        className="btn-secondary text-xs px-3 py-1"
                      >
                        Submissions
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {forms.length === 0 && (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-muted-foreground mb-4">No forms created yet</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="btn-primary"
            >
              Create Your First Form
            </button>
          </div>
        </div>
      )}

      {/* Create Form Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-7xl w-full h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  Create New Form
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Build your form with live preview
                </p>
              </div>
              <button
                onClick={() => setShowCreateDialog(false)}
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

            <div className="flex flex-1 min-h-0">
              {/* Form Builder */}
              <div className="flex-1 p-8 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Form Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input h-12"
                      placeholder="e.g., Lead Capture Form"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="input min-h-[100px] resize-none"
                      placeholder="Optional description for your form"
                    />
                  </div>

                  {/* Field Types */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-4">
                      Add Fields
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { type: "text", label: "Text Input", icon: "📝" },
                        { type: "textarea", label: "Textarea", icon: "📄" },
                        { type: "select", label: "Dropdown", icon: "📋" },
                        { type: "radio", label: "Radio", icon: "🔘" },
                        { type: "checkbox", label: "Checkbox", icon: "☑️" },
                        { type: "file", label: "File Upload", icon: "📎" },
                      ].map(({ type, label, icon }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => addField(type as FormField["type"])}
                          className="btn-outline text-sm flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors h-12 px-4"
                        >
                          <span>{icon}</span>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    {fields.map((field, index) => (
                      <div key={field.id} className="card p-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-medium text-foreground">
                            Field {index + 1} ({field.type})
                          </span>
                          <button
                            type="button"
                            onClick={() => removeField(field.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                              Label *
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) =>
                                updateField(field.id, { label: e.target.value })
                              }
                              className="input text-sm h-10"
                              placeholder="Field label"
                            />
                          </div>

                          {(field.type === "text" ||
                            field.type === "textarea") && (
                            <div>
                              <label className="block text-sm text-muted-foreground mb-2">
                                Placeholder
                              </label>
                              <input
                                type="text"
                                value={field.placeholder || ""}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    placeholder: e.target.value,
                                  })
                                }
                                className="input text-sm h-10"
                                placeholder="Placeholder text"
                              />
                            </div>
                          )}

                          {(field.type === "select" ||
                            field.type === "radio") && (
                            <div>
                              <label className="block text-sm text-muted-foreground mb-2">
                                Options
                              </label>
                              {field.options?.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="flex gap-3 mb-3"
                                >
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) =>
                                      updateOption(
                                        field.id,
                                        optionIndex,
                                        e.target.value
                                      )
                                    }
                                    className="input text-sm flex-1 h-10"
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeOption(field.id, optionIndex)
                                    }
                                    className="btn-outline text-destructive hover:text-destructive h-10 px-3"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addOption(field.id)}
                                className="text-sm text-primary hover:text-primary/80 mt-2"
                              >
                                + Add Option
                              </button>
                            </div>
                          )}

                          <div className="flex items-center pt-2">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) =>
                                updateField(field.id, {
                                  required: e.target.checked,
                                })
                              }
                              className="mr-3"
                            />
                            <label className="text-sm text-muted-foreground">
                              Required field
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-6 border-t">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 h-12"
                    >
                      {isCreating ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Create Form
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateDialog(false)}
                      className="btn-secondary px-6 h-12"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Preview */}
              <div className="w-96 bg-muted/30 p-8 overflow-y-auto border-l flex-shrink-0">
                <div className="sticky top-0 bg-muted/30 pb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Live Preview
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    See how your form will look to users
                  </p>
                </div>
                <div className="card p-8 bg-background">
                  <h4 className="text-xl font-semibold text-foreground mb-2">
                    {title || "Form Title"}
                  </h4>
                  {description && (
                    <p className="text-sm text-muted-foreground mb-6">
                      {description}
                    </p>
                  )}

                  <div className="space-y-6">
                    {fields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {field.label || "Field Label"}{" "}
                          {field.required && (
                            <span className="text-destructive">*</span>
                          )}
                        </label>

                        {field.type === "text" && (
                          <input
                            type="text"
                            placeholder={field.placeholder || "Enter text..."}
                            className="input h-12"
                            disabled
                          />
                        )}

                        {field.type === "textarea" && (
                          <textarea
                            placeholder={field.placeholder || "Enter text..."}
                            className="input min-h-[100px] resize-none"
                            disabled
                          />
                        )}

                        {field.type === "select" && (
                          <select className="input h-12" disabled>
                            <option>Select an option...</option>
                            {field.options
                              ?.filter((opt) => opt.trim())
                              .map((option, index) => (
                                <option key={index}>{option}</option>
                              ))}
                          </select>
                        )}

                        {field.type === "radio" && (
                          <div className="space-y-3">
                            {field.options
                              ?.filter((opt) => opt.trim())
                              .map((option, index) => (
                                <label
                                  key={index}
                                  className="flex items-center"
                                >
                                  <input
                                    type="radio"
                                    name={field.id}
                                    className="mr-3"
                                    disabled
                                  />
                                  <span className="text-sm text-foreground">
                                    {option}
                                  </span>
                                </label>
                              ))}
                          </div>
                        )}

                        {field.type === "checkbox" && (
                          <div className="flex items-center">
                            <input type="checkbox" className="mr-3" disabled />
                            <span className="text-sm text-foreground">
                              Checkbox option
                            </span>
                          </div>
                        )}

                        {field.type === "file" && (
                          <input type="file" className="input h-12" disabled />
                        )}
                      </div>
                    ))}

                    {fields.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Add fields to see preview
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-4 border-t bg-muted/30">
              <div className="text-xs text-muted-foreground">
                {fields.length} field{fields.length !== 1 ? "s" : ""} added
              </div>
              <div className="text-xs text-muted-foreground">
                Live preview updates automatically
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
