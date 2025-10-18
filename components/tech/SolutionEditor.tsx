import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Problem, TechSolution, SolutionStep } from '../../types';
import { PlusIcon, TrashIcon, XIcon, CheckCircleIcon } from '../icons/Icons';

interface SolutionEditorProps {
    problem: Problem;
    onClose: () => void;
}

const SolutionEditor: React.FC<SolutionEditorProps> = ({ problem, onClose }) => {
    const { techSolutions, addTechSolution, updateTechSolution, currentUser } = useAppContext();
    const existingSolution = techSolutions.find(s => s.problemId === problem.id);

    const [steps, setSteps] = useState<SolutionStep[]>(existingSolution?.steps || [{ id: `step-${Date.now()}`, description: '' }]);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setSteps(existingSolution?.steps || [{ id: `step-${Date.now()}`, description: '' }]);
        setIsSaved(false);
    }, [problem, existingSolution]);

    const handleStepChange = (id: string, description: string) => {
        setSteps(prev => prev.map(step => step.id === id ? { ...step, description } : step));
    };

    const addStep = () => {
        setSteps(prev => [...prev, { id: `step-${Date.now()}`, description: '' }]);
    };

    const removeStep = (id: string) => {
        if (steps.length > 1) {
            setSteps(prev => prev.filter(step => step.id !== id));
        }
    };

    const handleSave = () => {
        if (!currentUser) return;
        const solution: TechSolution = {
            id: existingSolution?.id || `sol-${Date.now()}`,
            problemId: problem.id,
            steps: steps.filter(s => s.description.trim() !== ''),
            solvedBy: currentUser,
            solvedAt: Date.now(),
        };

        if (existingSolution) {
            updateTechSolution(solution);
        } else {
            addTechSolution(solution);
        }
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-700">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{problem.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reported {problem.repeatCount} times</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Solution Steps</h3>
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-start gap-3">
                             <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center font-semibold">{index + 1}</div>
                            <textarea
                                value={step.description}
                                onChange={(e) => handleStepChange(step.id, e.target.value)}
                                placeholder={`Step ${index + 1} description...`}
                                rows={3}
                                className="flex-grow p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={() => removeStep(step.id)} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50" title="Remove Step" disabled={steps.length <= 1}>
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={addStep} className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    <PlusIcon className="w-5 h-5 mr-1" />
                    Add Step
                </button>
            </div>
            <div className="pt-4 border-t dark:border-gray-700 flex justify-end items-center">
                 {isSaved && (
                    <div className="flex items-center text-green-600 dark:text-green-400 mr-4">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        <span>Solution Saved!</span>
                    </div>
                )}
                <button
                    onClick={handleSave}
                    className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {existingSolution ? 'Update Solution' : 'Save Solution'}
                </button>
            </div>
        </div>
    );
};

export default SolutionEditor;
