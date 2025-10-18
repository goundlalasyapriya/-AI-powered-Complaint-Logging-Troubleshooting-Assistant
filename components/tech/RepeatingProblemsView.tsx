
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Problem, TechSolution } from '../../types';
import SolutionEditor from './SolutionEditor';

const RepeatingProblemsView: React.FC = () => {
    const { problems, techSolutions } = useAppContext();
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

    const sortedProblems = useMemo(() => {
        return [...problems].sort((a, b) => b.repeatCount - a.repeatCount);
    }, [problems]);

    const handleSelectProblem = (problem: Problem) => {
        setSelectedProblem(problem);
    };

    const handleCloseEditor = () => {
        setSelectedProblem(null);
    };

    return (
        <div className="h-full flex gap-6">
            <div className="w-1/3 h-full flex flex-col">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Most Repeating Problems</h1>
                <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-3">
                    {sortedProblems.map(problem => {
                        const hasSolution = techSolutions.some(s => s.problemId === problem.id);
                        return (
                            <div
                                key={problem.id}
                                onClick={() => handleSelectProblem(problem)}
                                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${selectedProblem?.id === problem.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <p className={`font-semibold ${selectedProblem?.id === problem.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{problem.title}</p>
                                    {hasSolution && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${selectedProblem?.id === problem.id ? 'bg-white text-blue-600' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                                            Solved
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs mt-1 ${selectedProblem?.id === problem.id ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                    Reported {problem.repeatCount} times
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="w-2/3 h-full">
                {selectedProblem ? (
                    <SolutionEditor problem={selectedProblem} onClose={handleCloseEditor} />
                ) : (
                    <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-500 dark:text-gray-400">
                        <p>Select a problem to view or add a solution.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RepeatingProblemsView;
