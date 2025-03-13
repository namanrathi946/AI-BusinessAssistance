
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentRole } from '../types';
import { ChartContainer } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { sampleBusinessData } from '../data/sampleBusinessData';
import { calculateYoYGrowth, getMetricsByYear } from '../utils/businessDataUtils';

interface BusinessDataPanelProps {
  role?: AgentRole;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const BusinessDataPanel = ({ 
  role = 'CEO',
  isVisible, 
  onToggleVisibility 
}: BusinessDataPanelProps) => {
  const [activeTab, setActiveTab] = useState<string>(role.toLowerCase());
  
  const revenueData = getMetricsByYear(sampleBusinessData, 'revenue')
    .map(item => ({ year: item.year.toString(), value: item.value / 1000000 }));
  
  const profitData = getMetricsByYear(sampleBusinessData, 'profit')
    .map(item => ({ year: item.year.toString(), value: item.value / 1000000 }));
  
  const employeeData = getMetricsByYear(sampleBusinessData, 'employees');
  
  const marketShareData = getMetricsByYear(sampleBusinessData, 'marketShare');
  
  const growthData = calculateYoYGrowth(sampleBusinessData, 'revenue')
    .map(item => ({ year: item.year.toString(), value: item.growth }));
  
  const currentYear = Math.max(...sampleBusinessData.financialData.map(d => d.year));
  const currentFinancialData = sampleBusinessData.financialData.find(d => d.year === currentYear);
  
  const budgetData = [
    { name: 'R&D', value: currentFinancialData?.rndBudget || 0 },
    { name: 'Marketing', value: currentFinancialData?.marketingBudget || 0 },
    { name: 'Investment', value: currentFinancialData?.investmentBudget || 0 },
  ].map(item => ({ ...item, value: item.value / 1000000 }));
  
  // Latest tech stack
  const latestTechData = sampleBusinessData.technologyData
    .slice(-1)[0].techStack
    .map(tech => ({ name: tech, value: 1 }));
  
  // Department distribution
  const latestHrData = sampleBusinessData.hrData.slice(-1)[0];
  const deptData = Object.entries(latestHrData.departmentDistribution)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  
  if (!isVisible) return null;
  
  return (
    <div className="glass-panel p-4 animate-fade-in max-h-[500px] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Business Data Dashboard</h2>
        <Button variant="outline" size="sm" onClick={onToggleVisibility}>
          Hide Data
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="ceo">CEO View</TabsTrigger>
          <TabsTrigger value="cfo">Financial</TabsTrigger>
          <TabsTrigger value="cto">Technology</TabsTrigger>
          <TabsTrigger value="hr">HR</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ceo" className="space-y-4">
          <h3 className="text-md font-medium">Company Overview - {sampleBusinessData.companyName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-3">
              <h4 className="text-sm font-medium mb-2">Revenue Growth ($M)</h4>
              <ChartContainer className="h-[200px]" config={{}}>
                <AreaChart data={revenueData}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#0A84FF" fill="#0A84FF" fillOpacity={0.2} />
                </AreaChart>
              </ChartContainer>
            </div>
            <div className="glass-panel p-3">
              <h4 className="text-sm font-medium mb-2">Year-over-Year Growth (%)</h4>
              <ChartContainer className="h-[200px]" config={{}}>
                <BarChart data={growthData}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#30D158" />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
          <div className="bg-secondary/30 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Strategic Initiatives {currentYear}</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {sampleBusinessData.strategicData.slice(-1)[0].strategicInitiatives.map((initiative, i) => (
                <li key={i}>{initiative}</li>
              ))}
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="cfo" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-3">
              <h4 className="text-sm font-medium mb-2">Revenue vs Profit ($M)</h4>
              <ChartContainer className="h-[200px]" config={{}}>
                <AreaChart data={revenueData}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" name="Revenue" stroke="#0A84FF" fill="#0A84FF" fillOpacity={0.2} />
                  <Area type="monotone" data={profitData} dataKey="value" name="Profit" stroke="#30D158" fill="#30D158" fillOpacity={0.2} />
                </AreaChart>
              </ChartContainer>
            </div>
            <div className="glass-panel p-3">
              <h4 className="text-sm font-medium mb-2">Budget Allocation {currentYear} ($M)</h4>
              <ChartContainer className="h-[200px]" config={{}}>
                <BarChart data={budgetData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#FFD60A" />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
          <div className="bg-secondary/30 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Financial Summary {currentYear}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Revenue</p>
                <p className="font-medium">${(currentFinancialData?.revenue || 0)/1000000}M</p>
              </div>
              <div>
                <p className="text-muted-foreground">Profit</p>
                <p className="font-medium">${(currentFinancialData?.profit || 0)/1000000}M</p>
              </div>
              <div>
                <p className="text-muted-foreground">ROI</p>
                <p className="font-medium">{((currentFinancialData?.roi || 0) * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cash Flow</p>
                <p className="font-medium">${(currentFinancialData?.cashFlow || 0)/1000000}M</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="cto" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-3">
              <h4 className="text-sm font-medium mb-2">Tech Stack {currentYear}</h4>
              <ChartContainer className="h-[200px]" config={{}}>
                <BarChart data={latestTechData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#BF5AF2" />
                </BarChart>
              </ChartContainer>
            </div>
            <div className="glass-panel p-3">
              <h4 className="text-sm font-medium mb-2">Infrastructure Cost ($K)</h4>
              <ChartContainer className="h-[200px]" config={{}}>
                <AreaChart data={sampleBusinessData.technologyData.map(d => ({ 
                  year: d.year.toString(), 
                  value: d.infrastructureCost/1000 
                }))}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#0A84FF" fill="#0A84FF" fillOpacity={0.2} />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>
          <div className="bg-secondary/30 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Projects for {currentYear}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Planned Projects</p>
                <ul className="list-disc list-inside">
                  {sampleBusinessData.technologyData.slice(-1)[0].plannedProjects.map((project, i) => (
                    <li key={i}>{project}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-muted-foreground">Completed Projects</p>
                <ul className="list-disc list-inside">
                  {sampleBusinessData.technologyData.slice(-1)[0].completedProjects.map((project, i) => (
                    <li key={i}>{project}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="hr" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-3">
              <h4 className="text-sm font-medium mb-2">Employee Growth</h4>
              <ChartContainer className="h-[200px]" config={{}}>
                <AreaChart data={employeeData.map(d => ({ year: d.year.toString(), value: d.value }))}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#30D158" fill="#30D158" fillOpacity={0.2} />
                </AreaChart>
              </ChartContainer>
            </div>
            <div className="glass-panel p-3">
              <h4 className="text-sm font-medium mb-2">Department Distribution {currentYear}</h4>
              <ChartContainer className="h-[200px]" config={{}}>
                <BarChart data={deptData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#BF5AF2" />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
          <div className="bg-secondary/30 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">HR Metrics {currentYear}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Total Employees</p>
                <p className="font-medium">{latestHrData.totalEmployees}</p>
              </div>
              <div>
                <p className="text-muted-foreground">New Hires</p>
                <p className="font-medium">{latestHrData.newHires}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Attrition Rate</p>
                <p className="font-medium">{(latestHrData.attritionRate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg. Satisfaction</p>
                <p className="font-medium">{latestHrData.employeeSatisfaction}/10</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessDataPanel;
