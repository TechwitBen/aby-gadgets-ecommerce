import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Shield,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Primary color (blue)
const primary = "#3B82F6";

// Subject options
const subjectOptions = [
  "Product Question",
  "Order Status/Tracking",
  "Returns & Exchanges",
  "Technical Support",
  "Payment Issue",
  "Store Location/Hours",
  "Bulk/Wholesale Inquiry",
  "Other",
];

// FAQ data
const faqs = [
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 3-5 business days. Express shipping (1-2 business days) is available for an additional fee. Orders placed before 2 PM EST ship the same day.",
  },
  {
    q: "What is your return/exchange policy?",
    a: "We offer a 30-day money-back guarantee on all products. Items must be in original condition with all packaging and accessories. Return shipping is free for defective items.",
  },
  {
    q: "Do you offer warranties on products?",
    a: "All products include the manufacturer's warranty. Extended warranty options are available at checkout for additional coverage.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, Google Pay, and Affirm financing.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order ships, you'll receive a tracking number via email. You can also track orders by logging into your account on our website.",
  },
  {
    q: "Do you price match?",
    a: "Yes! If you find a lower price from an authorized retailer within 7 days of purchase, we'll refund the difference. Contact us with proof of the lower price.",
  },
  {
    q: "Are all products brand new and authentic?",
    a: "Absolutely. We only sell 100% authentic products from authorized distributors. Products marked as 'refurbished' or 'open box' are clearly labeled.",
  },
  {
    q: "Do you have a physical store location?",
    a: "Yes! Visit our flagship store in San Francisco at 1234 Technology Boulevard. See store hours and directions above.",
  },
];

const Contact = () => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    orderNumber: "",
    subject: subjectOptions[0],
    message: "",
    newsletter: false,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form submission state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }
    return newErrors;
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError("");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setSubmitError("");
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        orderNumber: "",
        subject: subjectOptions[0],
        message: "",
        newsletter: false,
      });
      // Hide success message after 5 seconds? We'll keep it until next interaction.
    }, 500);
  };

  // Reset success message when form is changed after success
  const handleFormChange = () => {
    if (isSubmitted) setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <Header />
      </div>

      {/* Page Header */}
      <section className="bg-white py-16 md:py-20 border-b border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question? Our customer support team is here to help. We typically respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Form & Information */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Column (2/3 width) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

                {isSubmitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium">Thank you for contacting us!</p>
                      <p className="text-green-700 text-sm mt-1">
                        We've received your message and will respond within 24 hours. Check your email for a confirmation.
                      </p>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{submitError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} onChange={handleFormChange}>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* First Name */}
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.firstName ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    {/* Phone (optional) */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Order Number (optional) */}
                  <div className="mb-6">
                    <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Order Number <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="orderNumber"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Subject dropdown */}
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {subjectOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.message ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                  </div>

                  {/* Newsletter checkbox */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Subscribe to our newsletter for exclusive deals and updates
                      </span>
                    </label>
                  </div>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto text-white shadow-md hover:shadow-lg transition-shadow"
                    style={{ backgroundColor: primary }}
                  >
                    Send Message <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Information Panel (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

                {/* Email */}
                <div className="mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0" style={{ color: primary }}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email Support</p>
                      <a href="mailto:support@techhub.com" className="text-blue-600 hover:underline">
                        support@techhub.com
                      </a>
                      <p className="text-sm text-gray-500 mt-1">Available 24/7 - We respond within 24 hours</p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0" style={{ color: primary }}>
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Phone Support</p>
                      <a href="tel:+18005558324" className="text-blue-600 hover:underline">
                        +1 (800) 555-TECH
                      </a>
                      <p className="text-sm text-gray-500 mt-1">
                        Mon-Fri: 9:00 AM - 6:00 PM EST<br />
                        Sat: 10:00 AM - 4:00 PM EST<br />
                        Sun: Closed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live Chat */}
                <div className="mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0" style={{ color: primary }}>
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Live Chat</p>
                      <p className="text-sm text-gray-700 mb-2">Chat with our team in real-time</p>
                      <Button
                        size="sm"
                        className="text-white shadow-sm"
                        style={{ backgroundColor: primary }}
                      >
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <p className="font-medium text-gray-900 mb-3">Follow us for updates and exclusive offers:</p>
                  <div className="flex gap-3">
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    @TechHubStore (Facebook, Twitter) · @techhubofficial (Instagram) · TechHub Reviews (YouTube)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Physical Store Location */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Visit Our Store</h2>
              <div className="w-20 h-1 mx-auto rounded-full" style={{ backgroundColor: primary }}></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Store info */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0" style={{ color: primary }}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">TechHub Flagship Store</h3>
                    <p className="text-gray-600">
                      1234 Technology Boulevard<br />
                      San Francisco, CA 94102
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0" style={{ color: primary }}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Store Hours</h4>
                    <p className="text-gray-600">
                      Monday-Friday: 10:00 AM - 8:00 PM<br />
                      Saturday: 10:00 AM - 6:00 PM<br />
                      Sunday: 12:00 PM - 5:00 PM
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Parking</h4>
                  <p className="text-gray-600">Free parking available in adjacent lot. Street parking also available.</p>
                </div>

                <p className="text-gray-600 mb-6">
                  Come see our products in person! Our knowledgeable staff can answer questions, provide demos, and help you find the perfect tech for your needs. Walk-ins welcome - no appointment necessary.
                </p>

                <Button
                  asChild
                  size="lg"
                  className="text-white shadow-md hover:shadow-lg"
                  style={{ backgroundColor: primary }}
                >
                  <a href="https://maps.google.com/?q=1234+Technology+Boulevard+San+Francisco+CA+94102" target="_blank" rel="noopener noreferrer">
                    Get Directions <MapPin className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>

              {/* Map placeholder */}
              <div className="bg-gray-200 rounded-2xl overflow-hidden h-96 flex items-center justify-center border border-gray-300">
                <div className="text-center p-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Google Maps will be embedded here</p>
                  <p className="text-sm text-gray-400 mt-2">1234 Technology Blvd, San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="w-20 h-1 mx-auto rounded-full" style={{ backgroundColor: primary }}></div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Trust Elements */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-700">⏱️ Average Response Time: 2.3 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-gray-700">⭐ 98% Customer Satisfaction Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">🔒 All communications are encrypted and secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;