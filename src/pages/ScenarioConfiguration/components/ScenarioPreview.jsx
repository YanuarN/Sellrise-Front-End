import { useState } from 'react';
import { X, Play, RotateCcw } from 'lucide-react';
import { Button, Card } from '../../../components';
import StepRenderer from '../../../components/StepRenderer';

function ScenarioPreview({ config, onClose }) {
  const [currentStepId, setCurrentStepId] = useState(config.entry_step_id || null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [variables, setVariables] = useState({});

  const currentStep = config.steps?.[currentStepId];

  const handleStart = () => {
    setCurrentStepId(config.entry_step_id);
    setConversationHistory([]);
    setVariables({});
  };

  const handleStepSubmit = (submission) => {
    const { type, value } = submission;
    
    // Add to conversation history
    let contentToAdd = value;
    if (type === 'form') {
      contentToAdd = Object.entries(value)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ');
    }
    
    setConversationHistory(prev => [...prev, {
      type: 'user',
      content: contentToAdd,
      stepId: currentStepId
    }]);

    // Store variables if step has variable name
    if (currentStep?.variable) {
      setVariables(prev => ({
        ...prev,
        [currentStep.variable]: value
      }));
    }
    
    // For form steps, store all fields
    if (type === 'form') {
      setVariables(prev => ({
        ...prev,
        ...value
      }));
    }

    // Process the response based on step type
    if (currentStep) {
      const nextStepId = getNextStep(currentStep, value);
      
      if (nextStepId && config.steps[nextStepId]) {
        setCurrentStepId(nextStepId);
        
        // Add bot response if it's a message step
        const nextStep = config.steps[nextStepId];
        if (nextStep?.type === 'message') {
          setConversationHistory(prev => [...prev, {
            type: 'bot',
            content: nextStep.content,
            stepId: nextStepId
          }]);
        }
      }
    }
  };

  const getNextStep = (step, response) => {
    if (!step.next) return null;

    if (typeof step.next === 'string') {
      return step.next;
    } else if (typeof step.next === 'object') {
      return step.next[response] || null;
    }

    return null;
  };

  const renderCurrentStep = () => {
    if (!currentStep) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No step configured</p>
          <Button variant="outline" size="sm" onClick={handleStart} className="mt-4">
            <Play className="w-4 h-4 mr-2" />
            Start Preview
          </Button>
        </div>
      );
    }

    // For end step, show restart button
    if (currentStep.type === 'end') {
      return (
        <div className="space-y-4">
          <StepRenderer step={currentStep} onSubmit={handleStepSubmit} />
          <Button variant="outline" size="sm" onClick={handleStart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </Button>
        </div>
      );
    }

    // For message steps with next, auto-advance
    if (currentStep.type === 'message' && currentStep.next) {
      return (
        <div className="space-y-4">
          <StepRenderer step={currentStep} onSubmit={handleStepSubmit} />
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStepSubmit({ type: 'message', value: 'continue' })}
          >
            Continue
          </Button>
        </div>
      );
    }

    return <StepRenderer step={currentStep} onSubmit={handleStepSubmit} />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Scenario Preview</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Preview */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Conversation Flow</h3>
                
                {/* Conversation History */}
                {conversationHistory.length > 0 && (
                  <div className="mb-4 space-y-2 max-h-60 overflow-y-auto">
                    {conversationHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`rounded-lg p-3 ${
                          msg.type === 'bot'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-gray-100 text-gray-900 ml-8'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Current Step */}
                {renderCurrentStep()}
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-4">
              <Card>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Current State</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Step ID:</span>
                    <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1">
                      {currentStepId || 'None'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Step Type:</span>
                    <p className="font-medium mt-1">{currentStep?.type || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Messages:</span>
                    <p className="font-medium mt-1">{conversationHistory.length}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Variables</h3>
                {Object.keys(variables).length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {Object.entries(variables).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-600">{key}:</span>
                        <p className="font-medium mt-1">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No variables set</p>
                )}
              </Card>

              <Button
                variant="outline"
                size="sm"
                onClick={handleStart}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScenarioPreview;
