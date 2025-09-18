import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function FormSubmissions() {
  const { formId } = useParams<{ formId: string }>();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);

  const form = useQuery(api.forms.getForm, { formId: formId as Id<"forms"> });
  const submissions =
    useQuery(api.forms.getFormSubmissions, {
      formId: formId as Id<"forms">,
    }) || [];
  const updateStatus = useMutation(api.forms.updateSubmissionStatus);

  const handleStatusUpdate = async (
    submissionId: Id<"formSubmissions">,
    status: string
  ) => {
    try {
      await updateStatus({
        submissionId,
        status: status as any,
      });
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleViewResponses = (submission: any) => {
    setSelectedSubmission(submission);
    setShowResponseDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "converted":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!form) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Form Not Found
            </h1>
            <p className="text-muted-foreground">
              This form may have been removed or you don't have access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Form Submissions
        </h1>
        <p className="text-muted-foreground">
          Submissions for: <strong>{form.title}</strong>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {submissions.length} total submissions
        </p>
      </div>

      {/* Submissions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Submitter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.map((submission) => (
                <tr
                  key={submission._id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-primary-foreground">
                          {(submission.submitterName || "A")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {submission.submitterName || "Anonymous"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {submission.submitterEmail || "No email"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}
                      >
                        {submission.status}
                      </span>
                      <select
                        value={submission.status}
                        onChange={(e) =>
                          handleStatusUpdate(submission._id, e.target.value)
                        }
                        className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {new Date(submission._creationTime).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(submission._creationTime).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewResponses(submission)}
                      className="btn-outline text-xs px-3 py-1"
                    >
                      View Responses
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {submissions.length === 0 && (
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
            <p className="text-muted-foreground mb-4">No submissions yet</p>
            <p className="text-sm text-muted-foreground">
              Share your form URL to start receiving submissions: <br />
              <code className="bg-muted px-2 py-1 rounded text-xs mt-2 inline-block">
                {window.location.origin}/form/{formId}
              </code>
            </p>
          </div>
        </div>
      )}

      {/* Response Dialog */}
      {showResponseDialog && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Form Responses
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedSubmission.submitterName || "Anonymous"} •{" "}
                  {new Date(selectedSubmission._creationTime).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setShowResponseDialog(false)}
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
                {form.fields.map((field) => {
                  const response = (selectedSubmission.responses as any)[
                    field.id
                  ];
                  if (!response) return null;

                  return (
                    <div key={field.id} className="card p-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">
                        {field.label}
                      </h4>
                      <div className="text-foreground">
                        {Array.isArray(response) ? (
                          <ul className="list-disc list-inside space-y-1">
                            {response.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="whitespace-pre-wrap">{response}</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {selectedSubmission.notes && (
                  <div className="card p-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Coach Notes
                    </h4>
                    <p className="text-foreground whitespace-pre-wrap">
                      {selectedSubmission.notes}
                    </p>
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
