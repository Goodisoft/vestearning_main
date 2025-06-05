/**
 * Admin Page Manager Controller
 * Handles API endpoints for managing website content sections
 */

const AdminPageManagerService = require("../../services/adminPageManagerService");
const service = new AdminPageManagerService();

class AdminPageManagerController {
  // Hero Section endpoints
  async getHeroSection(req, res) {
    try {
      const heroSection = await service.getHeroSection();
      return res.status(200).json({ success: true, data: heroSection });
    } catch (error) {
      console.error("Error in getHeroSection controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async updateHeroSection(req, res) {
    try {
      const { title, subtitle } = req.body;

      if (!title || !subtitle) {
        return res
          .status(400)
          .json({ success: false, message: "Title and subtitle are required" });
      }

      const updatedHeroSection = await service.updateHeroSection({
        title,
        subtitle,
      });

      return res.status(200).json({
        success: true,
        data: updatedHeroSection,
        message: "Hero section updated successfully",
      });
    } catch (error) {
      console.error("Error in updateHeroSection controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // About Section endpoints
  async getAboutSection(req, res) {
    try {
      const aboutSection = await service.getAboutSection();
      return res.status(200).json({ success: true, data: aboutSection });
    } catch (error) {
      console.error("Error in getAboutSection controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async updateAboutSection(req, res) {
    try {
      const { title, description } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: "Title and description are required",
        });
      }

      const updatedAboutSection = await service.updateAboutSection({
        title,
        description,
      });

      return res.status(200).json({
        success: true,
        data: updatedAboutSection,
        message: "About section updated successfully",
      });
    } catch (error) {
      console.error("Error in updateAboutSection controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Why Choose Us section endpoints
  async getWhyChooseUs(req, res) {
    try {
      const whyChooseUs = await service.getWhyChooseUs();
      return res.status(200).json({ success: true, data: whyChooseUs });
    } catch (error) {
      console.error("Error in getWhyChooseUs controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async addWhyChooseUs(req, res) {
    try {
      const { title, description } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: "Title and description are required",
        });
      }

      const newWhyChooseUs = await service.addWhyChooseUs({
        title,
        description,
      });

      return res.status(201).json({
        success: true,
        data: newWhyChooseUs,
        message: "Why Choose Us item added successfully",
      });
    } catch (error) {
      console.error("Error in addWhyChooseUs controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async updateWhyChooseUs(req, res) {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: "Title and description are required",
        });
      }

      const updatedWhyChooseUs = await service.updateWhyChooseUs(id, {
        title,
        description,
      });

      if (!updatedWhyChooseUs) {
        return res
          .status(404)
          .json({ success: false, message: "Why Choose Us item not found" });
      }

      return res.status(200).json({
        success: true,
        data: updatedWhyChooseUs,
        message: "Why Choose Us item updated successfully",
      });
    } catch (error) {
      console.error("Error in updateWhyChooseUs controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async deleteWhyChooseUs(req, res) {
    try {
      const { id } = req.params;

      const deletedWhyChooseUs = await service.deleteWhyChooseUs(id);

      if (!deletedWhyChooseUs) {
        return res
          .status(404)
          .json({ success: false, message: "Why Choose Us item not found" });
      }

      return res.status(200).json({
        success: true,
        data: deletedWhyChooseUs,
        message: "Why Choose Us item deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteWhyChooseUs controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Testimonials endpoints
  async getTestimonials(req, res) {
    try {
      const testimonials = await service.getTestimonials();
      return res.status(200).json({ success: true, data: testimonials });
    } catch (error) {
      console.error("Error in getTestimonials controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async addTestimonial(req, res) {
    try {
      const { name, country, message } = req.body;

      if (!name || !message) {
        return res
          .status(400)
          .json({ success: false, message: "Name and message are required" });
      }

      const newTestimonial = await service.addTestimonial({
        name,
        country,
        message,
      });

      return res.status(201).json({
        success: true,
        data: newTestimonial,
        message: "Testimonial added successfully",
      });
    } catch (error) {
      console.error("Error in addTestimonial controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async updateTestimonial(req, res) {
    try {
      const { id } = req.params;
      const { name, country, message } = req.body;

      if (!name || !message) {
        return res
          .status(400)
          .json({ success: false, message: "Name and message are required" });
      }

      const updatedTestimonial = await service.updateTestimonial(id, {
        name,
        country,
        message,
      });

      if (!updatedTestimonial) {
        return res
          .status(404)
          .json({ success: false, message: "Testimonial not found" });
      }

      return res.status(200).json({
        success: true,
        data: updatedTestimonial,
        message: "Testimonial updated successfully",
      });
    } catch (error) {
      console.error("Error in updateTestimonial controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async deleteTestimonial(req, res) {
    try {
      const { id } = req.params;

      const deletedTestimonial = await service.deleteTestimonial(id);

      if (!deletedTestimonial) {
        return res
          .status(404)
          .json({ success: false, message: "Testimonial not found" });
      }

      return res.status(200).json({
        success: true,
        data: deletedTestimonial,
        message: "Testimonial deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteTestimonial controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // FAQs endpoints
  async getFAQs(req, res) {
    try {
      const faqs = await service.getFAQs();
      return res.status(200).json({ success: true, data: faqs });
    } catch (error) {
      console.error("Error in getFAQs controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async addFAQ(req, res) {
    try {
      const { question, answer } = req.body;

      if (!question || !answer) {
        return res.status(400).json({
          success: false,
          message: "Question and answer are required",
        });
      }

      const newFAQ = await service.addFAQ({
        question,
        answer,
      });

      return res.status(201).json({
        success: true,
        data: newFAQ,
        message: "FAQ added successfully",
      });
    } catch (error) {
      console.error("Error in addFAQ controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async updateFAQ(req, res) {
    try {
      const { id } = req.params;
      const { question, answer } = req.body;

      if (!question || !answer) {
        return res.status(400).json({
          success: false,
          message: "Question and answer are required",
        });
      }

      const updatedFAQ = await service.updateFAQ(id, {
        question,
        answer,
      });

      if (!updatedFAQ) {
        return res
          .status(404)
          .json({ success: false, message: "FAQ not found" });
      }

      return res.status(200).json({
        success: true,
        data: updatedFAQ,
        message: "FAQ updated successfully",
      });
    } catch (error) {
      console.error("Error in updateFAQ controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async deleteFAQ(req, res) {
    try {
      const { id } = req.params;

      const deletedFAQ = await service.deleteFAQ(id);

      if (!deletedFAQ) {
        return res
          .status(404)
          .json({ success: false, message: "FAQ not found" });
      }

      return res.status(200).json({
        success: true,
        data: deletedFAQ,
        message: "FAQ deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteFAQ controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Crypto Tips endpoints
  async getCryptoTips(req, res) {
    try {
      const cryptoTips = await service.getCryptoTips();
      return res.status(200).json({ success: true, data: cryptoTips });
    } catch (error) {
      console.error("Error in getCryptoTips controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async addCryptoTip(req, res) {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        return res
          .status(400)
          .json({ success: false, message: "Title and content are required" });
      }

      const newCryptoTip = await service.addCryptoTip({
        title,
        content,
      });

      return res.status(201).json({
        success: true,
        data: newCryptoTip,
        message: "Crypto Tip added successfully",
      });
    } catch (error) {
      console.error("Error in addCryptoTip controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async updateCryptoTip(req, res) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;

      if (!title || !content) {
        return res
          .status(400)
          .json({ success: false, message: "Title and content are required" });
      }

      const updatedCryptoTip = await service.updateCryptoTip(id, {
        title,
        content,
      });

      if (!updatedCryptoTip) {
        return res
          .status(404)
          .json({ success: false, message: "Crypto Tip not found" });
      }

      return res.status(200).json({
        success: true,
        data: updatedCryptoTip,
        message: "Crypto Tip updated successfully",
      });
    } catch (error) {
      console.error("Error in updateCryptoTip controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async deleteCryptoTip(req, res) {
    try {
      const { id } = req.params;

      const deletedCryptoTip = await service.deleteCryptoTip(id);

      if (!deletedCryptoTip) {
        return res
          .status(404)
          .json({ success: false, message: "Crypto Tip not found" });
      }

      return res.status(200).json({
        success: true,
        data: deletedCryptoTip,
        message: "Crypto Tip deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteCryptoTip controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Top Investors endpoints
  async getTopInvestors(req, res) {
    try {
      const topInvestors = await service.getTopInvestors();
      return res.status(200).json({ success: true, data: topInvestors });
    } catch (error) {
      console.error("Error in getTopInvestors controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async addTopInvestor(req, res) {
    try {
      const { name, amount } = req.body;

      if (!name || !amount) {
        return res
          .status(400)
          .json({ success: false, message: "Name and amount are required" });
      }

      const newTopInvestor = await service.addTopInvestor({
        name,
        amount,
      });

      return res.status(201).json({
        success: true,
        data: newTopInvestor,
        message: "Top Investor added successfully",
      });
    } catch (error) {
      console.error("Error in addTopInvestor controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async updateTopInvestor(req, res) {
    try {
      const { id } = req.params;
      const { name, amount } = req.body;

      if (!name || !amount) {
        return res
          .status(400)
          .json({ success: false, message: "Name and amount are required" });
      }

      const updatedTopInvestor = await service.updateTopInvestor(id, {
        name,
        amount,
      });

      if (!updatedTopInvestor) {
        return res
          .status(404)
          .json({ success: false, message: "Top Investor not found" });
      }

      return res.status(200).json({
        success: true,
        data: updatedTopInvestor,
        message: "Top Investor updated successfully",
      });
    } catch (error) {
      console.error("Error in updateTopInvestor controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async deleteTopInvestor(req, res) {
    try {
      const { id } = req.params;

      const deletedTopInvestor = await service.deleteTopInvestor(id);

      if (!deletedTopInvestor) {
        return res
          .status(404)
          .json({ success: false, message: "Top Investor not found" });
      }

      return res.status(200).json({
        success: true,
        data: deletedTopInvestor,
        message: "Top Investor deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteTopInvestor controller:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Render admin page manager view
  async renderPageManager(req, res) {
    try {
      const heroSection = await service.getHeroSection();
      const aboutSection = await service.getAboutSection();
      const whyChooseUs = await service.getWhyChooseUs();
      const testimonials = await service.getTestimonials();
      const faqs = await service.getFAQs();
      const cryptoTips = await service.getCryptoTips();
      const topInvestors = await service.getTopInvestors();

      res.render("adminViews/page_manager", {
        title: "Admin Page Manager",
        heroSection,
        aboutSection,
        whyChooseUs,
        testimonials,
        faqs,
        cryptoTips,
        topInvestors,
      });
    } catch (error) {
      console.error("Error in renderPageManager controller:", error);
      res.status(500).send("Server error");
    }
  }
}

module.exports = new AdminPageManagerController();
