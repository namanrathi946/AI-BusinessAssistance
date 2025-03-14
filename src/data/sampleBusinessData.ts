
import { BusinessData } from '../types/businessData';

export const sampleBusinessData: BusinessData = {
  companyName: "TechNova Solutions",
  industry: "Software & Cloud Services",
  foundingYear: 2018,
  mission: "To transform business operations through accessible cloud technology",
  vision: "Creating a world where every business can harness the power of AI and cloud computing",
  
  financialData: [
    {
      year: 2020,
      revenue: 2500000,
      profit: 375000,
      expenses: 2125000,
      cashFlow: 450000,
      investmentBudget: 300000,
      marketingBudget: 250000,
      rndBudget: 500000,
      roi: 0.18,
      revenueGrowth: 0.25,
      profitMargin: 0.15
    },
    {
      year: 2021,
      revenue: 4200000,
      profit: 840000,
      expenses: 3360000,
      cashFlow: 920000,
      investmentBudget: 600000,
      marketingBudget: 420000,
      rndBudget: 800000,
      roi: 0.24,
      revenueGrowth: 0.68,
      profitMargin: 0.20
    },
    {
      year: 2022,
      revenue: 7300000,
      profit: 1825000,
      expenses: 5475000,
      cashFlow: 1950000,
      investmentBudget: 1000000,
      marketingBudget: 730000,
      rndBudget: 1400000,
      roi: 0.31,
      revenueGrowth: 0.74,
      profitMargin: 0.25
    },
    {
      year: 2023,
      revenue: 12500000,
      profit: 3750000,
      expenses: 8750000,
      cashFlow: 4100000,
      investmentBudget: 2000000,
      marketingBudget: 1250000,
      rndBudget: 2500000,
      roi: 0.35,
      revenueGrowth: 0.71,
      profitMargin: 0.30
    }
  ],
  
  hrData: [
    {
      year: 2020,
      totalEmployees: 28,
      newHires: 12,
      attritionRate: 0.10,
      averageSalary: 85000,
      trainingBudget: 42000,
      employeeSatisfaction: 7.2,
      remotePercentage: 0.25,
      departmentDistribution: {
        engineering: 16,
        marketing: 4,
        sales: 5,
        support: 2,
        administration: 1
      }
    },
    {
      year: 2021,
      totalEmployees: 47,
      newHires: 22,
      attritionRate: 0.08,
      averageSalary: 88000,
      trainingBudget: 94000,
      employeeSatisfaction: 7.6,
      remotePercentage: 0.35,
      departmentDistribution: {
        engineering: 28,
        marketing: 7,
        sales: 8,
        support: 3,
        administration: 1
      }
    },
    {
      year: 2022,
      totalEmployees: 72,
      newHires: 31,
      attritionRate: 0.12,
      averageSalary: 92000,
      trainingBudget: 180000,
      employeeSatisfaction: 7.1,
      remotePercentage: 0.55,
      departmentDistribution: {
        engineering: 42,
        marketing: 10,
        sales: 12,
        support: 6,
        administration: 2
      }
    },
    {
      year: 2023,
      totalEmployees: 103,
      newHires: 40,
      attritionRate: 0.09,
      averageSalary: 95000,
      trainingBudget: 257500,
      employeeSatisfaction: 7.8,
      remotePercentage: 0.65,
      departmentDistribution: {
        engineering: 58,
        marketing: 15,
        sales: 18,
        support: 9,
        administration: 3
      }
    }
  ],
  
  technologyData: [
    {
      year: 2020,
      techStack: ["React", "Node.js", "PostgreSQL", "AWS"],
      infrastructureCost: 180000,
      developmentVelocity: 45,
      technicalDebt: 4,
      securityIncidents: 1,
      uptime: 99.5,
      recentUpdates: ["Core Platform Launch", "Initial API Development"],
      plannedProjects: ["Mobile App v1", "API Gateway", "Dashboard Redesign"],
      completedProjects: ["Core Platform", "Customer Portal"]
    },
    {
      year: 2021,
      techStack: ["React", "Node.js", "PostgreSQL", "AWS", "Redis", "Docker"],
      infrastructureCost: 310000,
      developmentVelocity: 65,
      technicalDebt: 5,
      securityIncidents: 2,
      uptime: 99.7,
      recentUpdates: ["Redis Caching Integration", "Docker Containerization"],
      plannedProjects: ["AI Recommendation Engine", "Microservices Migration", "Mobile App v2"],
      completedProjects: ["Mobile App v1", "API Gateway", "Dashboard Redesign"]
    },
    {
      year: 2022,
      techStack: ["React", "Node.js", "PostgreSQL", "AWS", "Redis", "Docker", "Kubernetes", "TensorFlow"],
      infrastructureCost: 580000,
      developmentVelocity: 85,
      technicalDebt: 7,
      securityIncidents: 1,
      uptime: 99.8,
      recentUpdates: ["Kubernetes Orchestration", "TensorFlow ML Models"],
      plannedProjects: ["Global CDN", "Blockchain Integration", "Real-time Analytics"],
      completedProjects: ["AI Recommendation Engine", "Microservices Migration", "Mobile App v2"]
    },
    {
      year: 2023,
      techStack: ["React", "Node.js", "PostgreSQL", "AWS", "Redis", "Docker", "Kubernetes", "TensorFlow", "GraphQL", "Kafka"],
      infrastructureCost: 920000,
      developmentVelocity: 110,
      technicalDebt: 5,
      securityIncidents: 0,
      uptime: 99.95,
      recentUpdates: ["GraphQL API Gateway", "Kafka Event Streaming"],
      plannedProjects: ["Edge Computing Solution", "ML Platform v2", "IoT Integration"],
      completedProjects: ["Global CDN", "Blockchain Integration", "Real-time Analytics"]
    }
  ],
  
  marketingData: [
    {
      year: 2020,
      customerAcquisitionCost: 420,
      conversionRate: 1.8,
      marketShare: 2.3,
      brandAwareness: 4,
      topPerformingMarket: "Small Business",
      topPerformingProduct: "Cloud Dashboard",
      activeMarketingCampaigns: ["Product Launch", "Content Marketing"],
      channelPerformance: {
        social: 1.2,
        search: 2.1,
        email: 2.4,
        content: 1.8,
        partnerships: 1.5
      }
    },
    {
      year: 2021,
      customerAcquisitionCost: 380,
      conversionRate: 2.4,
      marketShare: 3.7,
      brandAwareness: 5.5,
      topPerformingMarket: "Mid-Market",
      topPerformingProduct: "Data Integration Platform",
      activeMarketingCampaigns: ["Cloud Migration", "Industry Webinars", "PPC Campaign"],
      channelPerformance: {
        social: 1.7,
        search: 2.3,
        email: 2.2,
        content: 2.5,
        partnerships: 1.9
      }
    },
    {
      year: 2022,
      customerAcquisitionCost: 340,
      conversionRate: 3.2,
      marketShare: 5.4,
      brandAwareness: 6.8,
      topPerformingMarket: "Enterprise",
      topPerformingProduct: "AI Analytics Suite",
      activeMarketingCampaigns: ["AI Solutions", "Customer Success Stories", "Partner Program"],
      channelPerformance: {
        social: 2.1,
        search: 2.6,
        email: 2.0,
        content: 2.8,
        partnerships: 2.5
      }
    },
    {
      year: 2023,
      customerAcquisitionCost: 310,
      conversionRate: 3.8,
      marketShare: 7.2,
      brandAwareness: 7.9,
      topPerformingMarket: "Financial Services",
      topPerformingProduct: "Enterprise AI Platform",
      activeMarketingCampaigns: ["Enterprise Solutions", "Industry Conference", "Thought Leadership", "Account-Based Marketing"],
      channelPerformance: {
        social: 2.4,
        search: 2.9,
        email: 2.2,
        content: 3.1,
        partnerships: 3.3
      }
    }
  ],
  
  strategicData: [
    {
      year: 2020,
      businessMilestones: ["First 50 Customers", "Seed Round Closed"],
      strategicInitiatives: ["Product Market Fit", "Core Platform Development"],
      marketThreats: ["Established Competitors", "Limited Brand Recognition"],
      marketOpportunities: ["Cloud Migration Trend", "Remote Work Acceleration"],
      competitorMovements: ["Legacy Player Restructuring", "New Entrant in SMB Market"],
      customerSatisfaction: 8.1,
      productRoadmap: ["Core Platform", "Customer Portal", "Mobile Access"]
    },
    {
      year: 2021,
      businessMilestones: ["Series A Funding", "100th Customer", "First Enterprise Client"],
      strategicInitiatives: ["Upmarket Strategy", "Partner Ecosystem"],
      marketThreats: ["Price Competition", "Talent Shortage"],
      marketOpportunities: ["AI/ML Integration", "Industry Vertical Expansion"],
      competitorMovements: ["Market Leader Acquisition", "Price Drop by Main Competitor"],
      customerSatisfaction: 8.3,
      productRoadmap: ["AI Capabilities", "Advanced Analytics", "API Ecosystem"]
    },
    {
      year: 2022,
      businessMilestones: ["International Expansion", "Series B Funding", "250th Customer"],
      strategicInitiatives: ["Global Reach", "Product Diversification", "Vertical Solutions"],
      marketThreats: ["Economic Uncertainty", "Regulatory Changes", "Emerging Technologies"],
      marketOpportunities: ["Enterprise Market Growth", "Industry-Specific Solutions", "Data Monetization"],
      competitorMovements: ["New Enterprise Competitor", "Open Source Alternative"],
      customerSatisfaction: 8.7,
      productRoadmap: ["Blockchain Integration", "Industry Solutions", "Global Infrastructure"]
    },
    {
      year: 2023,
      businessMilestones: ["500th Customer", "First Acquisition", "Industry Award"],
      strategicInitiatives: ["M&A Strategy", "Platform Expansion", "Thought Leadership"],
      marketThreats: ["Market Consolidation", "Tech Talent War", "AI Regulation"],
      marketOpportunities: ["Edge Computing", "Predictive Analytics Market", "IoT Integration"],
      competitorMovements: ["Major Player Platform Shift", "Competitor Security Breach"],
      customerSatisfaction: 8.9,
      productRoadmap: ["Edge Computing", "Vertical AI Solutions", "Predictive Intelligence Suite"]
    }
  ]
};
