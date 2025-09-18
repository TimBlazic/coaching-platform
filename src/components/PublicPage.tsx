import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function PublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = useQuery(api.publicPages.getPublicPageBySlug, { 
    slug: slug || "" 
  });

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600">This coaching page may have been removed or is no longer active.</p>
        </div>
      </div>
    );
  }

  const themeStyles = {
    modern: "bg-gradient-to-br from-blue-50 to-indigo-100",
    classic: "bg-gray-50",
    minimal: "bg-white"
  };

  const primaryColorStyle = { color: page.primaryColor };
  const primaryBgStyle = { backgroundColor: page.primaryColor };

  return (
    <div className={`min-h-screen ${themeStyles[page.theme as keyof typeof themeStyles] || themeStyles.modern}`}>
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {page.heroTitle}
          </h1>
          {page.heroSubtitle && (
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              {page.heroSubtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${page.contactEmail}`}
              className="px-8 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              style={primaryBgStyle}
            >
              Get Started Today
            </a>
            <a
              href="#about"
              className="px-8 py-4 border-2 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              style={{ borderColor: page.primaryColor, ...primaryColorStyle }}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      {page.aboutText && (
        <section id="about" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
                About Your Coach
              </h2>
              <div className="prose prose-lg mx-auto text-gray-600">
                {page.aboutText.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={primaryBgStyle}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Training</h3>
              <p className="text-gray-600">
                Customized workout plans designed specifically for your goals and fitness level.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={primaryBgStyle}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Nutrition Coaching</h3>
              <p className="text-gray-600">
                Personalized meal plans and nutrition guidance to fuel your transformation.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={primaryBgStyle}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Progress Tracking</h3>
              <p className="text-gray-600">
                Regular check-ins and progress monitoring to keep you on track to your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {page.testimonials.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              What Clients Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {page.testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Take the first step towards your fitness goals today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`mailto:${page.contactEmail}`}
                className="px-8 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                style={primaryBgStyle}
              >
                Contact Me
              </a>
              <a
                href={`mailto:${page.contactEmail}?subject=Free Consultation Request`}
                className="px-8 py-4 border-2 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                style={{ borderColor: page.primaryColor, ...primaryColorStyle }}
              >
                Free Consultation
              </a>
            </div>
            <p className="text-gray-500 mt-6">
              Email: {page.contactEmail}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-2">{page.title}</h3>
          <p className="text-gray-400">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
