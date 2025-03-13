
import { BusinessData, agentDataAccess } from '../types/businessData';
import { AgentRole } from '../types';
import { sampleBusinessData } from '../data/sampleBusinessData';

// Get data relevant to a specific agent role
export const getAgentData = (role: AgentRole, data: BusinessData = sampleBusinessData) => {
  const accessFunction = agentDataAccess[role];
  if (!accessFunction) {
    throw new Error(`No data access function defined for role: ${role}`);
  }
  return accessFunction(data);
};

// Get specific metrics for visualizations/discussions
export const getMetricsByYear = (
  data: BusinessData = sampleBusinessData,
  metric: 'revenue' | 'profit' | 'employees' | 'marketShare' | 'customerSatisfaction'
) => {
  switch (metric) {
    case 'revenue':
    case 'profit':
      return data.financialData.map(d => ({ year: d.year, value: d[metric] }));
    case 'employees':
      return data.hrData.map(d => ({ year: d.year, value: d.totalEmployees }));
    case 'marketShare':
      return data.marketingData.map(d => ({ year: d.year, value: d.marketShare }));
    case 'customerSatisfaction':
      return data.strategicData.map(d => ({ year: d.year, value: d.customerSatisfaction }));
    default:
      return [];
  }
};

// Get year-over-year growth rate for a specific metric
export const calculateYoYGrowth = (
  data: BusinessData = sampleBusinessData,
  metric: 'revenue' | 'profit' | 'employees' | 'marketShare'
) => {
  const metrics = getMetricsByYear(data, metric);
  
  return metrics.map((current, index) => {
    if (index === 0) return { year: current.year, growth: 0 };
    
    const previous = metrics[index - 1];
    const growth = ((current.value - previous.value) / previous.value) * 100;
    
    return {
      year: current.year,
      growth: Number(growth.toFixed(2))
    };
  }).filter((_, index) => index > 0); // Remove first year as it has no growth
};

// Get the most recent year's data
export const getCurrentYearData = (data: BusinessData = sampleBusinessData) => {
  const years = data.financialData.map(d => d.year);
  const currentYear = Math.max(...years);
  
  return {
    year: currentYear,
    financial: data.financialData.find(d => d.year === currentYear),
    hr: data.hrData.find(d => d.year === currentYear),
    technology: data.technologyData.find(d => d.year === currentYear),
    marketing: data.marketingData.find(d => d.year === currentYear),
    strategic: data.strategicData.find(d => d.year === currentYear)
  };
};

// Generate data insights based on agent role
export const generateRoleInsights = (role: AgentRole, data: BusinessData = sampleBusinessData) => {
  const currentYearData = getCurrentYearData(data);
  const agentData = getAgentData(role, data);
  
  switch (role) {
    case 'CEO':
      return {
        companyOverview: `${data.companyName} has grown to ${currentYearData.hr?.totalEmployees} employees with annual revenue of $${(currentYearData.financial?.revenue || 0) / 1000000}M in ${currentYearData.year}.`,
        keyMetrics: {
          revenueGrowth: calculateYoYGrowth(data, 'revenue').slice(-1)[0],
          profitMargin: ((currentYearData.financial?.profit || 0) / (currentYearData.financial?.revenue || 1) * 100).toFixed(1) + '%',
          marketShareGrowth: calculateYoYGrowth(data, 'marketShare').slice(-1)[0],
          customerSatisfaction: currentYearData.strategic?.customerSatisfaction
        },
        strategicFocus: currentYearData.strategic?.strategicInitiatives || [],
        challenges: currentYearData.strategic?.marketThreats || [],
        opportunities: currentYearData.strategic?.marketOpportunities || []
      };
    
    case 'CFO':
      return {
        financialSummary: `In ${currentYearData.year}, we achieved $${(currentYearData.financial?.revenue || 0) / 1000000}M in revenue with a profit of $${(currentYearData.financial?.profit || 0) / 1000000}M.`,
        keyMetrics: {
          profitMargin: ((currentYearData.financial?.profit || 0) / (currentYearData.financial?.revenue || 1) * 100).toFixed(1) + '%',
          cashFlow: currentYearData.financial?.cashFlow,
          roi: (currentYearData.financial?.roi || 0) * 100 + '%',
          budgetAllocation: {
            marketing: currentYearData.financial?.marketingBudget,
            rnd: currentYearData.financial?.rndBudget,
            infrastructure: currentYearData.technology?.infrastructureCost
          }
        },
        financialChallenges: [
          calculateYoYGrowth(data, 'revenue').slice(-1)[0].growth < 30 ? "Revenue growth is slowing down" : "Maintaining high growth rate",
          "Balancing investments and profitability",
          "Managing cash flow with rapid expansion"
        ],
        investmentPriorities: ["Technology infrastructure", "Product development", "Talent acquisition"]
      };
    
    case 'CTO':
      return {
        technologySummary: `Our tech stack includes ${currentYearData.technology?.techStack.join(", ")} with ${currentYearData.hr?.departmentDistribution.engineering} engineers.`,
        keyMetrics: {
          developmentVelocity: currentYearData.technology?.developmentVelocity,
          technicalDebt: currentYearData.technology?.technicalDebt,
          securityIncidents: currentYearData.technology?.securityIncidents,
          uptime: currentYearData.technology?.uptime + '%'
        },
        completedProjects: currentYearData.technology?.completedProjects || [],
        plannedProjects: currentYearData.technology?.plannedProjects || [],
        techChallenges: [
          "Scaling architecture for growing user base",
          "Balancing new features vs. technical debt",
          "Recruiting specialized talent",
          currentYearData.technology?.technicalDebt && currentYearData.technology.technicalDebt > 6 ? "High technical debt needs addressing" : "Maintaining code quality"
        ]
      };
    
    case 'HR':
      return {
        workforceSummary: `We currently have ${currentYearData.hr?.totalEmployees} employees with ${currentYearData.hr?.newHires} new hires in ${currentYearData.year}.`,
        keyMetrics: {
          attritionRate: (currentYearData.hr?.attritionRate || 0) * 100 + '%',
          employeeSatisfaction: currentYearData.hr?.employeeSatisfaction,
          averageSalary: currentYearData.hr?.averageSalary,
          trainingInvestment: currentYearData.hr?.trainingBudget
        },
        teamDistribution: currentYearData.hr?.departmentDistribution,
        hrChallenges: [
          "Hiring pace to meet growth targets",
          currentYearData.hr?.attritionRate && currentYearData.hr.attritionRate > 0.1 ? "Higher than ideal attrition rate" : "Maintaining low attrition",
          "Competitive compensation in tech market",
          "Building culture with remote/hybrid work"
        ],
        talentInitiatives: [
          "Leadership development program",
          "Engineering excellence workshops",
          "Diversity and inclusion initiatives",
          "Work-life balance improvements"
        ]
      };
  }
};
