'use client';

import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Code2, Play, Save } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languages = [
  { id: 'python', name: 'Python', defaultCode: 'print("Hello, World!")' },
  { id: 'javascript', name: 'JavaScript', defaultCode: 'console.log("Hello, World!");' },
  { id: 'java', name: 'Java', defaultCode: 'class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
  { id: 'cpp', name: 'C++', defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}' }
];

export const CodingPlatform = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].id);
  const [code, setCode] = useState(languages[0].defaultCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    const language = languages.find(lang => lang.id === value);
    if (language) {
      setCode(language.defaultCode);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: selectedLanguage,
          code: code,
        }),
      });

      const data = await response.json();
      setOutput(data.output || data.error || 'No output');
    } catch (error) {
      setOutput('Error executing code. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-md">
            <Code2 className="h-5 w-5 text-slate-500" />
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[140px] border-0 bg-transparent focus:ring-0">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.id} value={language.id}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={runCode} 
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-400px)]">
        <div className="flex flex-col">
          <div className="text-sm font-medium text-slate-700 mb-2">Code Editor</div>
          <div className="flex-1 border rounded-lg overflow-hidden bg-[#1E1E1E]">
            <Editor
              height="100%"
              language={selectedLanguage}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-sm font-medium text-slate-700 mb-2">Output</div>
          <div className="flex-1 bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-auto">
            <pre className="whitespace-pre-wrap">{output || 'Code output will appear here...'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}; 