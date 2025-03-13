
import { AgentRole } from './index';

export interface FinancialData {
  year: number;
  revenue: number;
  profit: number;
  expenses: number;
  cashFlow: number;
  investmentBudget: number;
  marketingBudget: number;
  rndBudget: number;
  roi: number;
}

export interface HRData {
  year: number;
  totalEmployees: number;
  newHires: number;
  attritionRate: number;
  averageSalary: number;
  trainingBudget: number;
  employeeSatisfaction: number; // 1-10 scale
  departmentDistribution: {
    engineering: number;
    marketing: number;
    sales: number;
    support: number;
    administration: number;
  };
}

export interface TechnologyData {
  year: number;
  techStack: string[];
  infrastructureCost: number;
  developmentVelocity: number; // story points per sprint
  technicalDebt: number; // 1-10 scale
  securityIncidents: number;
  uptime: number; // percentage
  plannedProjects: string[];
  completedProjects: string[];
}

export interface MarketingData {
  year: number;
  customerAcquisitionCost: number;
  conversionRate: number; // percentage
  marketShare: number; // percentage
  brandAwareness: number; // 1-10 scale
  activeMarketingCampaigns: string[];
  channelPerformance: {
    social: number; // ROI multiplier
    search: number;
    email: number;
    content: number;
    partnerships: number;
  };
}

export interface StrategicData {
  year: number;
  businessMilestones: string[];
  strategicInitiatives: string[];
  marketThreats: string[];
  marketOpportunities: string[];
  competitorMovements: string[];
  customerSatisfaction: number; // 1-10 scale
  productRoadmap: string[];
}

export interface BusinessData {
  companyName: string;
  industry: string;
  foundingYear: number;
  mission: string;
  vision: string;
  financialData: FinancialData[];
  hrData: HRData[];
  technologyData: TechnologyData[];
  marketingData: MarketingData[];
  strategicData: StrategicData[];
}

// Map agent roles to relevant data categories
export const agentDataAccess: Record<AgentRole, (data: BusinessData) => any> = {
  CEO: (data: BusinessData) => ({
    financialOverview: data.financialData,
    strategicData: data.strategicData,
    keyMetrics: {
      revenue: data.financialData.map(d => ({ year: d.year, value: d.revenue })),
      profit: data.financialData.map(d => ({ year: d.year, value: d.profit })),
      employees: data.hrData.map(d => ({ year: d.year, value: d.totalEmployees })),
      marketShare: data.marketingData.map(d => ({ year: d.year, value: d.marketShare })),
      customerSatisfaction: data.strategicData.map(d => ({ year: d.year, value: d.customerSatisfaction })),
    }
  }),
  CFO: (data: BusinessData) => ({
    financialData: data.financialData,
    investments: data.financialData.map(d => ({ 
      year: d.year, 
      roi: d.roi,
      investmentBudget: d.investmentBudget,
    })),
    departmentBudgets: data.financialData.map(d => ({
      year: d.year,
      marketing: d.marketingBudget,
      rnd: d.rndBudget,
    })),
    hrCosts: data.hrData.map(d => ({
      year: d.year,
      employees: d.totalEmployees,
      averageSalary: d.averageSalary,
      trainingBudget: d.trainingBudget,
    })),
    techCosts: data.technologyData.map(d => ({
      year: d.year,
      infrastructureCost: d.infrastructureCost,
    })),
  }),
  CTO: (data: BusinessData) => ({
    technologyData: data.technologyData,
    engineeringTeam: data.hrData.map(d => ({
      year: d.year,
      engineeringHeadcount: d.departmentDistribution.engineering,
      trainingBudget: d.trainingBudget,
    })),
    budget: data.financialData.map(d => ({
      year: d.year,
      rndBudget: d.rndBudget,
    })),
    strategicDirection: data.strategicData.map(d => ({
      year: d.year,
      productRoadmap: d.productRoadmap,
    })),
  }),
  HR: (data: BusinessData) => ({
    hrData: data.hrData,
    hrBudget: data.financialData.map(d => ({
      year: d.year,
      trainingBudget: data.hrData.find(hr => hr.year === d.year)?.trainingBudget,
    })),
    departmentGrowth: data.hrData.map(d => ({
      year: d.year,
      departments: d.departmentDistribution,
    })),
    companyMorale: data.hrData.map(d => ({
      year: d.year,
      employeeSatisfaction: d.employeeSatisfaction,
      attritionRate: d.attritionRate,
    })),
  }),
};
