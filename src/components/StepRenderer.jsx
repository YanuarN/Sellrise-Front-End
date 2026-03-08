/**
 * StepRenderer Component
 * 
 * Renders different step types for the conversation widget.
 * Supports all step types defined in the feature requirements:
 * - message
 * - question_text
 * - question_choice
 * - form
 * - conditional_branch (internal, not rendered)
 * - kb_search
 * - handoff_booking_link
 * - handoff_operator
 * - end
 */

import { useState, useEffect } from 'react';
import { Send, ExternalLink, User } from 'lucide-react';
import Button from './Button';

const StepRenderer = ({
  step,
  onSubmit,
  disabled = false,
  className = ''
}) => {
  const [textInput, setTextInput] = useState('');
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Reset state when step changes
  useEffect(() => {
    setTextInput('');
    setFormData({});
    setFormErrors({});
  }, [step]);

  if (!step) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No step to display
      </div>
    );
  }

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    
    onSubmit({
      type: 'text',
      value: textInput
    });
    setTextInput('');
  };

  const handleChoiceSelect = (choice) => {
    onSubmit({
      type: 'choice',
      value: choice
    });
  };

  const handleFormSubmit = () => {
    // Validate form
    const errors = {};
    const fields = step.fields || [];
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        errors[field.name] = `${field.label} is required`;
      }
      
      // Type-specific validation
      if (formData[field.name]) {
        const value = formData[field.name];
        
        if (field.type === 'email' || field.validation?.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors[field.name] = 'Please enter a valid email';
          }
        }
        
        if (field.type === 'tel' || field.validation?.type === 'phone') {
          const phoneRegex = /^[\d\s\-\(\)\+]{7,}$/;
          if (!phoneRegex.test(value)) {
            errors[field.name] = 'Please enter a valid phone number';
          }
        }
        
        if (field.validation?.min_length && value.length < field.validation.min_length) {
          errors[field.name] = `Minimum length is ${field.validation.min_length}`;
        }
        
        if (field.validation?.max_length && value.length > field.validation.max_length) {
          errors[field.name] = `Maximum length is ${field.validation.max_length}`;
        }
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    onSubmit({
      type: 'form',
      value: formData
    });
    setFormData({});
    setFormErrors({});
  };

  const handleFormFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error for this field
    if (formErrors[fieldName]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Render based on step type
  switch (step.type) {
    case 'message':
      return (
        <div className={`${className}`}>
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <p className="text-sm text-blue-900 whitespace-pre-wrap">{step.content}</p>
          </div>
        </div>
      );

    case 'question_text':
      return (
        <div className={`space-y-3 ${className}`}>
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium">{step.question}</p>
            {step.validation?.error_message && (
              <p className="text-xs text-gray-600 mt-1">{step.validation.error_message}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !disabled && handleTextSubmit()}
              placeholder="Type your answer..."
              disabled={disabled}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || disabled}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );

    case 'question_choice':
      return (
        <div className={`space-y-3 ${className}`}>
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium">{step.question}</p>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {(step.choices || []).map((choice, index) => (
              <button
                key={index}
                onClick={() => !disabled && handleChoiceSelect(choice)}
                disabled={disabled}
                className="px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      );

    case 'form':
      return (
        <div className={`space-y-4 ${className}`}>
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-semibold">{step.title}</p>
          </div>
          
          <div className="space-y-3">
            {(step.fields || []).map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFormFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={disabled}
                    rows={3}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      formErrors[field.name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFormFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={disabled}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      formErrors[field.name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                )}
                
                {formErrors[field.name] && (
                  <p className="text-xs text-red-600 mt-1">{formErrors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
          
          <Button
            variant="primary"
            size="md"
            onClick={handleFormSubmit}
            disabled={disabled}
            className="w-full"
          >
            Submit
          </Button>
        </div>
      );

    case 'kb_search':
      return (
        <div className={`space-y-3 ${className}`}>
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium">{step.prompt || 'What would you like to know?'}</p>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !disabled && handleTextSubmit()}
              placeholder="Ask a question..."
              disabled={disabled}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || disabled}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );

    case 'kb_search_results':
      return (
        <div className={`space-y-3 ${className}`}>
          {step.results && step.results.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Here's what I found:</p>
              {step.results.map((result, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                >
                  {result.type === 'article' ? (
                    <>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {result.title}
                      </h4>
                      <p className="text-xs text-gray-600">{result.snippet}</p>
                      {result.category && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          {result.category}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {result.question}
                      </h4>
                      <p className="text-xs text-gray-600">{result.answer_preview}</p>
                      {result.category && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          {result.category}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                I don't have specific information about that. Can I help you with something else?
              </p>
            </div>
          )}
        </div>
      );

    case 'handoff_booking_link':
      return (
        <div className={`space-y-3 ${className}`}>
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <p className="text-sm text-blue-900">{step.text}</p>
          </div>
          
          <a
            href={step.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {step.button_label || 'Book Now'}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      );

    case 'handoff_operator':
      return (
        <div className={`${className}`}>
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-900 font-medium">{step.message}</p>
            </div>
            <p className="text-xs text-green-700 mt-2">
              A team member will be with you shortly...
            </p>
          </div>
        </div>
      );

    case 'end':
      return (
        <div className={`${className}`}>
          <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-900 font-medium">
              {step.message || 'Thank you for your time!'}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              This conversation has ended.
            </p>
          </div>
        </div>
      );

    default:
      return (
        <div className={`${className}`}>
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-sm text-red-900">
              Unknown step type: <code className="font-mono">{step.type}</code>
            </p>
          </div>
        </div>
      );
  }
};

export default StepRenderer;
