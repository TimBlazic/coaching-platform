import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function PublicPageBuilder() {
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    theme: "modern",
    primaryColor: "#3B82F6",
    heroTitle: "",
    heroSubtitle: "",
    aboutText: "",
    testimonials: [{ name: "", text: "", image: undefined }],
    contactEmail: "",
  });

  const publicPage = useQuery(api.publicPages.getCoachPublicPage);
  const createOrUpdatePublicPage = useMutation(
    api.publicPages.createOrUpdatePublicPage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slug.trim() || !formData.title.trim()) {
      toast.error("Please enter slug and title");
      return;
    }

    if (!formData.heroTitle.trim() || !formData.contactEmail.trim()) {
      toast.error("Please enter hero title and contact email");
      return;
    }

    try {
      await createOrUpdatePublicPage({
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        title: formData.title,
        theme: formData.theme,
        primaryColor: formData.primaryColor,
        heroTitle: formData.heroTitle,
        heroSubtitle: formData.heroSubtitle,
        aboutText: formData.aboutText,
        testimonials: formData.testimonials.filter(
          (t) => t.name.trim() && t.text.trim()
        ),
        contactEmail: formData.contactEmail,
        isActive: true,
      });

      toast.success("Public page created successfully!");
      setFormData({
        slug: "",
        title: "",
        theme: "modern",
        primaryColor: "#3B82F6",
        heroTitle: "",
        heroSubtitle: "",
        aboutText: "",
        testimonials: [{ name: "", text: "", image: undefined }],
        contactEmail: "",
      });
    } catch (error: any) {
      if (error.message.includes("Slug already taken")) {
        toast.error(
          "This URL slug is already taken. Please choose a different one."
        );
      } else {
        toast.error("Failed to create public page");
      }
    }
  };

  const addTestimonial = () => {
    setFormData((prev) => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        { name: "", text: "", image: undefined },
      ],
    }));
  };

  const updateTestimonial = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((testimonial, i) =>
        i === index ? { ...testimonial, [field]: value } : testimonial
      ),
    }));
  };

  const removeTestimonial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Public Page Builder
          </h1>
          <p className="text-muted-foreground">
            Create your professional coaching landing page
          </p>
        </div>
        {publicPage && (
          <a
            href={`/coach/${publicPage.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline flex items-center gap-2"
          >
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            View Public Page
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-6 text-foreground">
            Create Public Page
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  URL Slug *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                    /coach/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 border border-border rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    placeholder="your-name"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This will be your public URL: /coach/
                  {formData.slug || "your-name"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Page Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="John Doe - Personal Trainer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Theme
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, theme: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      primaryColor: e.target.value,
                    }))
                  }
                  className="w-full h-10 border border-border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Hero Title *
              </label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    heroTitle: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="Transform Your Body, Transform Your Life"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Hero Subtitle
              </label>
              <input
                type="text"
                value={formData.heroSubtitle}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    heroSubtitle: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="Professional personal training and nutrition coaching"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                About Text
              </label>
              <textarea
                value={formData.aboutText}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    aboutText: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="Tell potential clients about your experience, qualifications, and approach to fitness..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactEmail: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="coach@example.com"
              />
            </div>

            {/* Testimonials */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-foreground">
                  Testimonials
                </label>
                <button
                  type="button"
                  onClick={addTestimonial}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  + Add Testimonial
                </button>
              </div>
              {formData.testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-4 mb-3"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-foreground">
                      Testimonial {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTestimonial(index)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={testimonial.name}
                      onChange={(e) =>
                        updateTestimonial(index, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground"
                      placeholder="Client name"
                    />
                    <textarea
                      value={testimonial.text}
                      onChange={(e) =>
                        updateTestimonial(index, "text", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground"
                      placeholder="Testimonial text"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="btn-primary w-full">
              Create Public Page
            </button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-6 text-foreground">
            Live Preview
          </h2>

          <div className="border border-border rounded-lg overflow-hidden">
            <div
              className="p-8 text-center"
              style={{ backgroundColor: formData.primaryColor }}
            >
              <h1 className="text-3xl font-bold text-white mb-4">
                {formData.heroTitle || "Your Hero Title"}
              </h1>
              <p className="text-white/90 text-lg mb-6">
                {formData.heroSubtitle || "Your hero subtitle will appear here"}
              </p>
              <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Get Started
              </button>
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
              <p className="text-muted-foreground mb-6">
                {formData.aboutText ||
                  "Your about text will appear here. Tell potential clients about your experience, qualifications, and approach to fitness."}
              </p>

              {formData.testimonials.filter(
                (t) => t.name.trim() && t.text.trim()
              ).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Testimonials
                  </h3>
                  <div className="space-y-4">
                    {formData.testimonials
                      .filter((t) => t.name.trim() && t.text.trim())
                      .map((testimonial, index) => (
                        <div
                          key={index}
                          className="border border-border rounded-lg p-4"
                        >
                          <p className="text-foreground mb-2">
                            "{testimonial.text}"
                          </p>
                          <p className="text-sm text-muted-foreground">
                            - {testimonial.name}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Contact
                </h3>
                <p className="text-muted-foreground">
                  {formData.contactEmail || "your-email@example.com"}
                </p>
              </div>
            </div>
          </div>

          {publicPage && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-foreground">
                  {publicPage.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    publicPage.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {publicPage.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Public URL: {window.location.origin}/coach/{publicPage.slug}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
