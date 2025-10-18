
import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import { useAppContext } from '../../context/AppContext';
import { Problem, MessageSender, ChatMessage } from '../../types';
import { StarIcon as StarSolid, XIcon, ReplyIcon, SearchIcon } from '../icons/Icons';

interface ExploreViewProps {
    onContinueChat: (messages: ChatMessage[]) => void;
}

const ExploreView: React.FC<ExploreViewProps> = ({ onContinueChat }) => {
  const { problems, starredProblems, toggleStarProblem, currentUserHistory, techSolutions } = useAppContext();
  const [activeTab, setActiveTab] = useState<'all' | 'starred' | 'history'>('all');
  const [viewingSolutionFor, setViewingSolutionFor] = useState<Problem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const mostRepeatingProblems = useMemo(() => {
    return [...problems].sort((a, b) => b.repeatCount - a.repeatCount).slice(0, 3);
  }, [problems]);

  const allOtherProblems = useMemo(() => {
    const topIds = mostRepeatingProblems.map(p => p.id);
    return problems
        .filter(p => !topIds.includes(p.id))
        .filter(p => 
            searchQuery === '' ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
  }, [problems, mostRepeatingProblems, searchQuery]);

  const starredProblemsList = useMemo(() => {
    return problems.filter(p => starredProblems.includes(p.id));
  }, [problems, starredProblems]);
  
  const solutionForSelectedProblem = useMemo(() => {
    if (!viewingSolutionFor) return null;
    return techSolutions.find(s => s.problemId === viewingSolutionFor.id) || null;
  }, [viewingSolutionFor, techSolutions]);

  const ProblemCard: React.FC<{ problem: Problem }> = ({ problem }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex justify-between items-start">
      <div className="flex-grow cursor-pointer pr-2" onClick={() => setViewingSolutionFor(problem)}>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{problem.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{problem.description}</p>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-3">
          {activeTab === 'history' ? (
              <span>{new Date(problem.submittedAt).toLocaleString()}</span>
          ) : (
              <span>Repeated {problem.repeatCount} times</span>
          )}
        </div>
      </div>
      {activeTab !== 'history' && (
        <button onClick={() => toggleStarProblem(problem.id)} className="p-2 text-gray-400 hover:text-yellow-500 flex-shrink-0">
          <StarSolid className={`w-6 h-6 ${starredProblems.includes(problem.id) ? 'text-yellow-400' : 'text-gray-400'}`} />
        </button>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'all':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Most Repeating Problems</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {mostRepeatingProblems.map(p => <ProblemCard key={p.id} problem={p} />)}
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">All Other Problems</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {allOtherProblems.length > 0 ? (
                  allOtherProblems.map(p => <ProblemCard key={p.id} problem={p} />)
              ) : (
                  <p className="text-gray-500 dark:text-gray-400 col-span-2">No problems match your search.</p>
              )}
            </div>
          </>
        );
      case 'starred':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your Starred Problems</h2>
            {starredProblemsList.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {starredProblemsList.map(p => <ProblemCard key={p.id} problem={p} />)}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">You haven't starred any problems yet.</p>
            )}
          </>
        );
      case 'history':
         return (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your History</h2>
            {currentUserHistory.length > 0 ? (
                 <div className="grid gap-4 md:grid-cols-2">
                    {currentUserHistory.map(p => <ProblemCard key={p.id} problem={p} />)}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">You have no problem history yet.</p>
            )}
          </>
        );
    }
  };
  
  const TabButton: React.FC<{ tab: 'all' | 'starred' | 'history', label: string }> = ({ tab, label }) => (
      <button 
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
      >
          {label}
      </button>
  )

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explore Problems</h1>
          {activeTab === 'all' && (
              <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon className="w-5 h-5 text-gray-400"/>
                  </div>
                  <input
                      type="text"
                      placeholder="Search for a problem..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full max-w-sm pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </div>
          )}
          </div>
          <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
             <TabButton tab="all" label="All Problems" />
             <TabButton tab="starred" label="Starred" />
             <TabButton tab="history" label="History" />
          </div>
      </div>
      <div className="h-[calc(100%-100px)] overflow-y-auto pb-4">
        {renderContent()}
      </div>

      {viewingSolutionFor && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setViewingSolutionFor(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{viewingSolutionFor.title}</h2>
                    <button onClick={() => setViewingSolutionFor(null)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {activeTab === 'history' && viewingSolutionFor.chatHistory ? (
                        <div className="space-y-4">
                            {viewingSolutionFor.chatHistory.map((msg, index) => (
                                <div key={index} className={`flex items-end gap-3 ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === MessageSender.AI && <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0"></div>}
                                    <div className={`max-w-lg p-3 rounded-2xl ${msg.sender === MessageSender.USER ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}>
                                        {msg.image && <img src={msg.image} alt="User upload" className="rounded-lg mb-2 max-h-40" />}
                                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{__html: marked.parse(msg.text)}}></div>
                                    </div>
                                    {msg.sender === MessageSender.USER && <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>}
                                </div>
                            ))}
                        </div>
                    ) : solutionForSelectedProblem ? (
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Verified solution provided by <strong>{solutionForSelectedProblem.solvedBy.name}</strong> on {new Date(solutionForSelectedProblem.solvedAt).toLocaleDateString()}.
                        </p>
                        <div className="space-y-6">
                        {solutionForSelectedProblem.steps.map((step, index) => (
                            <div key={step.id} className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">{index + 1}</div>
                            <div className="flex-grow pt-1">
                                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{step.description}</p>
                                {step.imageUrl && <img src={step.imageUrl} alt={`Step ${index + 1} illustration`} className="mt-3 rounded-lg border dark:border-gray-700 max-w-sm" />}
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                        <h3 className="text-lg font-semibold mb-2">
                           {activeTab === 'history' ? 'Chat History Not Available' : 'No Verified Solution Available'}
                        </h3>
                        <p>
                          {activeTab === 'history' 
                            ? 'The conversation for this entry was not saved.' 
                            : 'There is no official solution from the tech team for this problem yet. Try asking the AI assistant for help.'}
                        </p>
                    </div>
                    )}
                </div>
                {(activeTab === 'history' && viewingSolutionFor.chatHistory) && (
                    <div className="p-4 border-t dark:border-gray-700 flex-shrink-0 flex justify-end">
                        <button 
                            onClick={() => {
                                if (viewingSolutionFor?.chatHistory) {
                                    onContinueChat(viewingSolutionFor.chatHistory);
                                    setViewingSolutionFor(null);
                                }
                            }}
                            className="flex items-center px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                        >
                            <ReplyIcon className="w-5 h-5 mr-2" />
                            Continue Conversation
                        </button>
                    </div>
                )}
            </div>
        </div>
        )}
    </div>
  );
};

export default ExploreView;