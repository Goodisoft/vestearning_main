/**
 * Admin Page Manager Service
 * Handles business logic for managing website content sections
 */

const mongoose = require("mongoose");
const HeroSection = require("../models/heroSectionModel");
const AboutSection = require("../models/aboutSectionModel");
const WhyChooseUs = require("../models/whyUsSectionModel");
const Testimonial = require("../models/testimonialSectionModel");
const FAQ = require("../models/faqSectionModel");
const CryptoTip = require("../models/cryptoTipsModel");
const TopInvestor = require("../models/topInvestorModel");

class AdminPageManagerService {
  // Hero Section methods
  async getHeroSection() {
    try {
      // Find the first hero section or create a default one if none exists
      let heroSection = await HeroSection.findOne();

      if (!heroSection) {
        heroSection = await HeroSection.create({
          title: "Welcome to Site Name",
          subtitle: "The future of crypto investing", 
        });
      }

      return heroSection;
    } catch (error) {
      console.error("Error in getHeroSection:", error); 
      throw error;
    }
  }

  async updateHeroSection(data) {
    try {
      const { title, subtitle } = data;

      // Find the first hero section or create a new one if none exists
      let heroSection = await HeroSection.findOne();

      if (heroSection) {
        // Update existing hero section
        heroSection.title = title;
        heroSection.subtitle = subtitle;
        await heroSection.save();
      } else {
        // Create new hero section
        heroSection = await HeroSection.create({
          title,
          subtitle,
        });
      }

      return heroSection;
    } catch (error) {
      console.error("Error in updateHeroSection:", error);
      throw error;
    }
  }

  // About Section methods
  async getAboutSection() {
    try {
      // Find the first about section or create a default one if none exists
      let aboutSection = await AboutSection.findOne();

      if (!aboutSection) {
        aboutSection = await AboutSection.create({
          title: "About Site Name",
          description:
            "Site name is a leading crypto investment platform offering secure and profitable investment opportunities.",
        });
      }

      return aboutSection;
    } catch (error) {
      console.error("Error in getAboutSection:", error);
      throw error;
    }
  }

  async updateAboutSection(data) {
    try {
      const { title, description } = data;

      // Find the first about section or create a new one if none exists
      let aboutSection = await AboutSection.findOne();

      if (aboutSection) {
        // Update existing about section
        aboutSection.title = title;
        aboutSection.description = description;
        await aboutSection.save();
      } else {
        // Create new about section
        aboutSection = await AboutSection.create({
          title,
          description,
        });
      }

      return aboutSection;
    } catch (error) {
      console.error("Error in updateAboutSection:", error);
      throw error;
    }
  }

  // Why Choose Us Section methods
  async getWhyChooseUs() {
    try {
      return await WhyChooseUs.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error in getWhyChooseUs:", error);
      throw error;
    }
  }

  async addWhyChooseUs(data) {
    try {
      const { title, description } = data;
      return await WhyChooseUs.create({
        title,
        description,
      });
    } catch (error) {
      console.error("Error in addWhyChooseUs:", error);
      throw error;
    }
  }

  async updateWhyChooseUs(id, data) {
    try {
      const { title, description } = data;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await WhyChooseUs.findByIdAndUpdate(
        id,
        {
          title,
          description,
        },
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error("Error in updateWhyChooseUs:", error);
      throw error;
    }
  }

  async deleteWhyChooseUs(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await WhyChooseUs.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error in deleteWhyChooseUs:", error);
      throw error;
    }
  }

  // Testimonials methods
  async getTestimonials() {
    try {
      return await Testimonial.find().sort({ _id: -1 });
    } catch (error) {
      console.error("Error in getTestimonials:", error);
      throw error;
    }
  }

  async addTestimonial(data) {
    try {
      const { name, country, message } = data;
      return await Testimonial.create({
        name,
        country,
        message,
      });
    } catch (error) {
      console.error("Error in addTestimonial:", error);
      throw error;
    }
  }

  async updateTestimonial(id, data) {
    try {
      const { name, country, message } = data;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await Testimonial.findByIdAndUpdate(
        id,
        {
          name,
          country,
          message,
        },
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error("Error in updateTestimonial:", error);
      throw error;
    }
  }

  async deleteTestimonial(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await Testimonial.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error in deleteTestimonial:", error);
      throw error;
    }
  }

  // FAQs methods
  async getFAQs() {
    try {
      return await FAQ.find().sort({ _id: -1 });
    } catch (error) {
      console.error("Error in getFAQs:", error);
      throw error;
    }
  }

  async addFAQ(data) {
    try {
      const { question, answer } = data;
      return await FAQ.create({
        question,
        answer,
      });
    } catch (error) {
      console.error("Error in addFAQ:", error);
      throw error;
    }
  }

  async updateFAQ(id, data) {
    try {
      const { question, answer } = data;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await FAQ.findByIdAndUpdate(
        id,
        {
          question,
          answer,
        },
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error("Error in updateFAQ:", error);
      throw error;
    }
  }

  async deleteFAQ(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await FAQ.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error in deleteFAQ:", error);
      throw error;
    }
  }

  // Crypto Tips methods
  async getCryptoTips() {
    try {
      return await CryptoTip.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error in getCryptoTips:", error);
      throw error;
    }
  }

  async addCryptoTip(data) {
    try {
      const { title, content } = data;
      return await CryptoTip.create({
        title,
        content,
      });
    } catch (error) {
      console.error("Error in addCryptoTip:", error);
      throw error;
    }
  }

  async updateCryptoTip(id, data) {
    try {
      const { title, content } = data;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await CryptoTip.findByIdAndUpdate(
        id,
        {
          title,
          content,
        },
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error("Error in updateCryptoTip:", error);
      throw error;
    }
  }

  async deleteCryptoTip(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await CryptoTip.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error in deleteCryptoTip:", error);
      throw error;
    }
  }

  // Top Investors methods
  async getTopInvestors() {
    try {
      return await TopInvestor.find().sort({ amount: -1 });
    } catch (error) {
      console.error("Error in getTopInvestors:", error);
      throw error;
    }
  }

  async addTopInvestor(data) {
    try {
      const { name, amount } = data;
      return await TopInvestor.create({
        name,
        amount,
      });
    } catch (error) {
      console.error("Error in addTopInvestor:", error);
      throw error;
    }
  }

  async updateTopInvestor(id, data) {
    try {
      const { name, amount } = data;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await TopInvestor.findByIdAndUpdate(
        id,
        {
          name,
          amount,
        },
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error("Error in updateTopInvestor:", error);
      throw error;
    }
  }

  async deleteTopInvestor(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await TopInvestor.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error in deleteTopInvestor:", error);
      throw error;
    }
  }
}

module.exports = AdminPageManagerService;
