import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function PublicForm() {
  const { formId } = useParams<{ formId: string }>();
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitterInfo, setSubmitterInfo] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useQuery(api.forms.getForm, { formId: formId as Id<"forms"> });
  const submitForm = useMutation(api.forms.submitForm);

  const handleFieldChange = (fieldId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form) return;

    // Validate required fields
    const missingFields = form.fields
      .filter(field => field.required && !responses[field.id])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await submitForm({
        formId: formId as Id<"forms">,
        responses,
        submitterEmail: submitterInfo.email || undefined,
        submitterName: submitterInfo.name || undefined,
      });
      
      toast.success("Form submitted successfully!");
      setResponses({});
      setSubmitterInfo({ name: "", email: "" });
    } catch (error) {
      toast.error("Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-500">This form may have been removed or is no longer active.</p>
        </div>
      </div>
    );
  }

  if (!form.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Form Inactive</h1>
          <p className="text-gray-500">This form is currently not accepting submissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Submitter Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={submitterInfo.name}
                  onChange={(e) => setSubmitterInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  value={submitterInfo.email}
                  onChange={(e) => setSubmitterInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Form Fields */}
            {form.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === "text" && (
                  <input
                    type="text"
                    value={responses[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}

                {field.type === "textarea" && (
                  <textarea
                    value={responses[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}

                {field.type === "select" && (
                  <select
                    value={responses[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required={field.required}
                  >
                    <option value="">Select an option...</option>
                    {field.options?.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                )}

                {field.type === "radio" && (
                  <div className="space-y-2">
                    {field.options?.map((option, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="radio"
                          name={field.id}
                          value={option}
                          checked={responses[field.id] === option}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className="mr-2 text-gray-900 focus:ring-gray-900"
                          required={field.required}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {field.type === "checkbox" && (
                  <div className="space-y-2">
                    {field.options?.map((option, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          value={option}
                          checked={(responses[field.id] || []).includes(option)}
                          onChange={(e) => {
                            const currentValues = responses[field.id] || [];
                            const newValues = e.target.checked
                              ? [...currentValues, option]
                              : currentValues.filter((v: string) => v !== option);
                            handleFieldChange(field.id, newValues);
                          }}
                          className="mr-2 text-gray-900 focus:ring-gray-900"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {field.type === "file" && (
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFieldChange(field.id, file.name);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
            >
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
