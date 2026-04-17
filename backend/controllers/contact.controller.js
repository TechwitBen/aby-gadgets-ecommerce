import { sendContactEmail } from "../Service/Email.service.js";

/**
 * @desc    Handle contact form submission
 * @route   POST /api/v1/contact
 * @access  Public
 */
export const contactFormController = async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Basic validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and message are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid email address.",
      });
    }

    await sendContactEmail({ name: name.trim(), email: email.trim(), phone, service, message: message.trim() });

    return res.status(200).json({
      success: true,
      message: "Your message has been sent. We'll get back to you within 24 hours.",
    });
  } catch (error) {
    console.error("[contact]", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send message. Please try again later.",
    });
  }
};