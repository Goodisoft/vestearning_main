const planRepository = require("../repositories/planRepository");
const AppSettings = require("../models/appSettingsModel");
const he = require("he");


const AdminPageManagerService = require("../services/adminPageManagerService");
const pageManagerService = new AdminPageManagerService();

class PageController {
  static async homePage(req, res) {
    try {
      // Fetch active plans
      const plans = await planRepository.getActivePlans();

      // Fetch app settings
      const appSettings = await AppSettings.getSettings();

      // Fetch all content sections
      const heroSection = await pageManagerService.getHeroSection();
      const aboutSection = await pageManagerService.getAboutSection();
      const whyChooseUs = await pageManagerService.getWhyChooseUs();
      const testimonials = await pageManagerService.getTestimonials();
      const faqs = await pageManagerService.getFAQs();
      const cryptoTips = await pageManagerService.getCryptoTips();
      const topInvestors = await pageManagerService.getTopInvestors();
      
      // After fetching aboutSection from DB
      if (aboutSection && aboutSection.description) {
        aboutSection.description = he.decode(aboutSection.description);
      }

      return res.render("index.ejs", {
        plans,
        appSettings,
        heroSection,
        aboutSection,
        whyChooseUs,
        testimonials,
        faqs,
        cryptoTips,
        topInvestors,
      });
    } catch (error) {
      console.error("Error fetching data for home page:", error);
      return res.render("index.ejs", {
        plans: [],
        appSettings: {},
        heroSection: {},
        aboutSection: {},
        whyChooseUs: [],
        testimonials: [],
        faqs: [],
        cryptoTips: [],
        topInvestors: [],
      });
    }
  }

  static async aboutPage(req, res) {
    try {
      // Fetch app settings
      const appSettings = await AppSettings.getSettings();      

      // Fetch content sections relevant for about page
      const heroSection = await pageManagerService.getHeroSection();
      const aboutSection = await pageManagerService.getAboutSection();
      const whyChooseUs = await pageManagerService.getWhyChooseUs();
      const testimonials = await pageManagerService.getTestimonials();
      const faqs = await pageManagerService.getFAQs();

       // After fetching aboutSection from DB
      if (aboutSection && aboutSection.description) {
        aboutSection.description = he.decode(aboutSection.description);
      }

      return res.render("about", {
        appSettings,
        heroSection,
        aboutSection,
        whyChooseUs,
        testimonials,
        faqs,
      });
    } catch (error) {
      console.error("Error fetching data for about page:", error);
      return res.render("about", {
        appSettings: {},
        heroSection: {},
        aboutSection: {},
        whyChooseUs: [],
        testimonials: [],
        faqs: [],
      });
    }
  }

  static async planPage(req, res) {
    try {
      // Fetch all active plans
      const plans = await planRepository.getActivePlans();

      // Fetch app settings
      const appSettings = await AppSettings.getSettings();

      return res.render("plan", {
        plans,
        appSettings,
      });
    } catch (error) {
      console.error("Error fetching data for plan page:", error);
      return res.render("plan", {
        plans: [],
        appSettings: {},
      });
    }
  }

  static async contactPage(req, res) {
    try {
      // Fetch app settings
      const appSettings = await AppSettings.getSettings();

      return res.render("contact", {
        appSettings,
      });
    } catch (error) {
      console.error("Error fetching data for contact page:", error);
      return res.render("contact", {
        appSettings: {},
      });
    }
  }

  static async termsAndCondition(req, res) {
    return res.render("terms_condition");
  }
}

module.exports = PageController;
