import Layout from '@/components/Layout';
import CTAButton from '@/components/CTAButton';
import Image from 'next/image';

export default function AmazonCourses() {
  const courses = [
    {
      id: 1,
      title: "Amazon FBA Complete Mastery Course",
      description: "Learn everything you need to know about Amazon FBA from product research to scaling your business. Complete step-by-step guide for beginners to advanced sellers.",
      duration: "8 weeks",
      level: "Beginner to Advanced",
      price: "$497",
      originalPrice: "$697",
      features: [
        "Product research and validation strategies",
        "Supplier sourcing and negotiation",
        "Amazon listing optimization",
        "PPC advertising mastery",
        "Inventory management",
        "Brand building and protection",
        "Advanced scaling techniques",
        "Live Q&A sessions"
      ],
      popular: true
    },
    {
      id: 2,
      title: "Amazon PPC Advertising Masterclass",
      description: "Master Amazon advertising with proven PPC strategies. Learn to optimize campaigns, reduce ACOS, and maximize profits with data-driven advertising techniques.",
      duration: "4 weeks",
      level: "Intermediate",
      price: "$297",
      originalPrice: "$397",
      features: [
        "Campaign structure and setup",
        "Keyword research and targeting",
        "Bid optimization strategies",
        "ACOS reduction techniques",
        "Advanced campaign types",
        "Performance analytics",
        "Budget management",
        "Case studies and examples"
      ],
      popular: false
    },
    {
      id: 3,
      title: "Amazon Product Research Bootcamp",
      description: "Discover winning products with our comprehensive research methodology. Learn to identify high-profit opportunities and avoid costly mistakes.",
      duration: "3 weeks",
      level: "Beginner",
      price: "$197",
      originalPrice: "$297",
      features: [
        "Market analysis techniques",
        "Competition research",
        "Profit calculation methods",
        "Trend identification",
        "Supplier validation",
        "Risk assessment",
        "Research tools and software",
        "Product validation framework"
      ],
      popular: false
    },
    {
      id: 4,
      title: "Amazon Brand Building Strategy",
      description: "Build a sustainable Amazon brand that stands out from the competition. Learn trademark protection, brand registry, and long-term growth strategies.",
      duration: "6 weeks",
      level: "Intermediate to Advanced",
      price: "$397",
      originalPrice: "$497",
      features: [
        "Brand strategy development",
        "Amazon Brand Registry",
        "Trademark protection",
        "Brand store optimization",
        "A+ content creation",
        "Customer loyalty building",
        "Multi-channel expansion",
        "Legal protection strategies"
      ],
      popular: false
    },
    {
      id: 5,
      title: "Amazon Seller Compliance & Legal Protection",
      description: "Protect your Amazon business with comprehensive compliance strategies. Learn to avoid suspensions, handle IP claims, and maintain account health.",
      duration: "2 weeks",
      level: "All Levels",
      price: "$197",
      originalPrice: "$297",
      features: [
        "Account health management",
        "Compliance best practices",
        "IP claim handling",
        "Suspension prevention",
        "Appeal strategies",
        "Legal documentation",
        "Policy updates",
        "Risk mitigation"
      ],
      popular: false
    },
    {
      id: 6,
      title: "Amazon International Expansion",
      description: "Scale your Amazon business globally with our international expansion course. Learn market entry strategies for Europe, Asia, and beyond.",
      duration: "5 weeks",
      level: "Advanced",
      price: "$397",
      originalPrice: "$597",
      features: [
        "Market selection criteria",
        "International regulations",
        "Cross-border logistics",
        "Currency and pricing",
        "Cultural considerations",
        "VAT and tax compliance",
        "Local competition analysis",
        "Expansion timeline planning"
      ],
      popular: false
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <Image
              src="/assets/images/icon-lightGray.png"
              alt="Eco Business Icon"
              width={80}
              height={80}
              className="mx-auto"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Amazon Business Courses
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            Master Amazon selling with our comprehensive course collection. From beginner fundamentals to advanced strategies, achieve maximum ROI on your Amazon business.
          </p>
          <CTAButton href="#courses" variant="secondary" size="lg">
            Browse Courses
          </CTAButton>
        </div>
      </section>

      {/* Course Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Amazon Courses?
            </h2>
            <p className="text-xl text-gray-600">
              Learn from industry experts with proven track records
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Proven Strategies</h3>
              <p className="text-gray-600">
                Learn from successful Amazon sellers who have generated millions in revenue using these exact strategies.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Comprehensive Content</h3>
              <p className="text-gray-600">
                Step-by-step guides, video tutorials, templates, and tools to implement everything you learn.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Expert Support</h3>
              <p className="text-gray-600">
                Direct access to instructors, live Q&A sessions, and a community of successful Amazon sellers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section id="courses" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Available Courses
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect course to accelerate your Amazon business
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {courses.map((course) => (
              <div key={course.id} className={`bg-white rounded-2xl p-8 shadow-lg relative ${
                course.popular ? 'border-2 border-orange-500' : 'border border-gray-200'
              }`}>
                {course.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {course.duration}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      {course.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl font-bold text-green-600">{course.price}</span>
                    <span className="text-lg text-gray-400 line-through">{course.originalPrice}</span>
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm font-semibold">
                      Save {Math.round((1 - parseInt(course.price.slice(1)) / parseInt(course.originalPrice.slice(1))) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-3">What you&apos;ll learn:</h4>
                  <ul className="space-y-2">
                    {course.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                    {course.features.length > 4 && (
                      <li className="text-gray-500 text-sm ml-7">
                        +{course.features.length - 4} more topics covered
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <CTAButton href="/contact" className="flex-1">
                    Enroll Now
                  </CTAButton>
                  <CTAButton href="/contact" variant="outline" className="flex-1">
                    Learn More
                  </CTAButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Students&apos; Success
            </h2>
            <p className="text-xl text-gray-600">
              Real results from real students
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">2500+</div>
              <div className="text-gray-700">Students Enrolled</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">$50M+</div>
              <div className="text-gray-700">Student Revenue Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-700">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">4.9/5</div>
              <div className="text-gray-700">Average Course Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Student Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our successful Amazon sellers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="mb-6">
                <svg className="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-1.209.496-2.391 1.39-3.285 1.098-1.098 2.177-2.177 2.177-3.324 0-.848-.677-1.524-1.524-1.524-.848 0-1.524.676-1.524 1.524 0 .848.676 1.524 1.524 1.524.848 0 1.524-.676 1.524-1.524 0-1.047-.859-1.905-1.905-1.905-1.047 0-1.905.858-1.905 1.905 0 1.146 1.079 2.226 2.177 3.324.894.894 1.39 2.076 1.39 3.285V21h-2.324zM9.983 21v-7.391c0-1.209.496-2.391 1.39-3.285 1.098-1.098 2.177-2.177 2.177-3.324 0-.848-.677-1.524-1.524-1.524-.848 0-1.524.676-1.524 1.524 0 .848.676 1.524 1.524 1.524.848 0 1.524-.676 1.524-1.524 0-1.047-.859-1.905-1.905-1.905-1.047 0-1.905.858-1.905 1.905 0 1.146 1.079 2.226 2.177 3.324.894.894 1.39 2.076 1.39 3.285V21H9.983z"/>
                </svg>
              </div>
              <p className="text-gray-700 mb-6">
                &ldquo;The FBA course helped me go from zero to $100K in my first year. The step-by-step guidance and community support were invaluable.&rdquo;
              </p>
              <div className="font-semibold text-gray-900">Lisa Zhang</div>
              <div className="text-orange-600">Generated $100K in first year</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="mb-6">
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-1.209.496-2.391 1.39-3.285 1.098-1.098 2.177-2.177 2.177-3.324 0-.848-.677-1.524-1.524-1.524-.848 0-1.524.676-1.524 1.524 0 .848.676 1.524 1.524 1.524.848 0 1.524-.676 1.524-1.524 0-1.047-.859-1.905-1.905-1.905-1.047 0-1.905.858-1.905 1.905 0 1.146 1.079 2.226 2.177 3.324.894.894 1.39 2.076 1.39 3.285V21h-2.324zM9.983 21v-7.391c0-1.209.496-2.391 1.39-3.285 1.098-1.098 2.177-2.177 2.177-3.324 0-.848-.677-1.524-1.524-1.524-.848 0-1.524.676-1.524 1.524 0 .848.676 1.524 1.524 1.524.848 0 1.524-.676 1.524-1.524 0-1.047-.859-1.905-1.905-1.905-1.047 0-1.905.858-1.905 1.905 0 1.146 1.079 2.226 2.177 3.324.894.894 1.39 2.076 1.39 3.285V21H9.983z"/>
                </svg>
              </div>
              <p className="text-gray-700 mb-6">
                &ldquo;The PPC course reduced my ACOS from 45% to 18% in just 2 months. My profits have tripled since implementing these strategies.&rdquo;
              </p>
              <div className="font-semibold text-gray-900">Marcus Johnson</div>
              <div className="text-green-600">Tripled profits in 2 months</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-1.209.496-2.391 1.39-3.285 1.098-1.098 2.177-2.177 2.177-3.324 0-.848-.677-1.524-1.524-1.524-.848 0-1.524.676-1.524 1.524 0 .848.676 1.524 1.524 1.524.848 0 1.524-.676 1.524-1.524 0-1.047-.859-1.905-1.905-1.905-1.047 0-1.905.858-1.905 1.905 0 1.146 1.079 2.226 2.177 3.324.894.894 1.39 2.076 1.39 3.285V21h-2.324zM9.983 21v-7.391c0-1.209.496-2.391 1.39-3.285 1.098-1.098 2.177-2.177 2.177-3.324 0-.848-.677-1.524-1.524-1.524-.848 0-1.524.676-1.524 1.524 0 .848.676 1.524 1.524 1.524.848 0 1.524-.676 1.524-1.524 0-1.047-.859-1.905-1.905-1.905-1.047 0-1.905.858-1.905 1.905 0 1.146 1.079 2.226 2.177 3.324.894.894 1.39 2.076 1.39 3.285V21H9.983z"/>
                </svg>
              </div>
              <p className="text-gray-700 mb-6">
                &ldquo;I built a 7-figure brand using the brand building strategies taught in the course. The ROI has been incredible.&rdquo;
              </p>
              <div className="font-semibold text-gray-900">Jennifer Adams</div>
              <div className="text-blue-600">Built 7-figure brand</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Build Your Amazon Empire?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful students and start your Amazon journey today
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton href="/contact" variant="secondary" size="lg">
              Enroll in a Course
            </CTAButton>
            <CTAButton href="/contact" variant="outline" size="lg">
              Get Free Consultation
            </CTAButton>
          </div>
        </div>
      </section>
    </Layout>
  );
}