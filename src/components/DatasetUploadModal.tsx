
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Database } from 'lucide-react';
import { BusinessData } from '../types/businessData';
import { sampleBusinessData } from '../data/sampleBusinessData';

interface DatasetUploadModalProps {
  open: boolean;
  onClose: () => void;
  onDatasetUploaded: (data: BusinessData) => void;
}

const DatasetUploadModal = ({ open, onClose, onDatasetUploaded }: DatasetUploadModalProps) => {
  const [activeTab, setActiveTab] = useState('csv');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage('');
    }
  };
  
  const handleUseSampleData = () => {
    onDatasetUploaded(sampleBusinessData);
    onClose();
  };
  
  const handleUpload = async () => {
    if (!file && activeTab === 'csv') {
      setErrorMessage('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    
    try {
      if (activeTab === 'csv') {
        // In a real implementation, this would parse the CSV
        // For now, we'll just simulate success after a delay
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For the purpose of the demo, we'll just use the sample data
        // In a real implementation, this would convert the CSV to BusinessData
        onDatasetUploaded(sampleBusinessData);
      } else if (activeTab === 'json') {
        // Handle JSON input - for the demo we'll just use sample data
        onDatasetUploaded(sampleBusinessData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('Failed to parse the file. Please ensure it follows the correct format.');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Upload Business Dataset</DialogTitle>
          <DialogDescription>
            Upload your company data to be used by the AI agents during the meeting.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
            <TabsTrigger value="json">JSON Format</TabsTrigger>
            <TabsTrigger value="sample">Sample Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="csv" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                 onClick={() => document.getElementById('file-upload')?.click()}>
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                CSV file with financial, HR, technology, marketing, and strategic data
              </p>
              
              <Input 
                id="file-upload" 
                type="file" 
                accept=".csv"
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
            
            {file && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{file.name}</span>
                <span className="text-gray-500">({Math.round(file.size / 1024)} KB)</span>
              </div>
            )}
            
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </TabsContent>
          
          <TabsContent value="json" className="space-y-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm mb-2">Paste your JSON data here:</p>
              <textarea 
                className="w-full h-32 p-2 text-xs font-mono border rounded-md" 
                placeholder='{"companyName": "Your Company", "financialData": [...], ...}'
              />
            </div>
            
            <div className="text-sm text-gray-500">
              <p className="font-medium">JSON Format Guidelines:</p>
              <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                <li>Must include financial, HR, technology, marketing, and strategic data</li>
                <li>Should be structured by year from 2020-2023</li>
                <li>Follow the BusinessData type structure</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="sample" className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="font-medium">TechNova Solutions Sample Data</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Use our pre-configured sample dataset for a technology company with 4 years of historical data (2020-2023).
              </p>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="border rounded p-2 bg-muted/30">
                  <p className="font-medium">Financial Data</p>
                  <p className="text-xs text-gray-500">Revenue, profit, budgets, ROI</p>
                </div>
                <div className="border rounded p-2 bg-muted/30">
                  <p className="font-medium">HR Data</p>
                  <p className="text-xs text-gray-500">Headcount, attrition, satisfaction</p>
                </div>
                <div className="border rounded p-2 bg-muted/30">
                  <p className="font-medium">Technology Data</p>
                  <p className="text-xs text-gray-500">Tech stack, projects, infrastructure</p>
                </div>
                <div className="border rounded p-2 bg-muted/30">
                  <p className="font-medium">Strategic Data</p>
                  <p className="text-xs text-gray-500">Initiatives, market analysis</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleUseSampleData}>
                Use Sample Dataset
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {activeTab !== 'sample' && (
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Processing...' : 'Upload Dataset'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatasetUploadModal;
