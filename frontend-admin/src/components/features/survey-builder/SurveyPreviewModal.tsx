'use client';

import { useState, useMemo } from 'react';
import { Survey, Block, Question, LookAndFeel, SelectionStyle } from '@/api/contracts';
import { Check } from 'lucide-react';

interface SurveyPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: Survey | null;
}

type PreviewPage = 'welcome' | 'consent' | 'questions' | 'thankyou';

// Extended LookAndFeel for preview with additional computed styles
interface PreviewStyles {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  headingFont: string;
  baseFontSize: string;
  borderRadius: number;
  showProgressBar: boolean;
  selectionStyle: SelectionStyle;
  buttonStyle: 'filled' | 'outline' | 'soft';
  buttonTextTransform: 'uppercase' | 'capitalize' | 'none';
  cardShadow: string;
  backgroundImageOpacity: number;
  animation: 'none' | 'fade' | 'slide' | 'scale';
  glassOpacity: number;
  inputStyle: 'standard' | 'flushed' | 'filled' | 'floating';
  borderWidth: number;
  borderColor: string;
}

export function SurveyPreviewModal({ isOpen, onClose, survey }: SurveyPreviewModalProps) {
  const [currentPage, setCurrentPage] = useState<PreviewPage>('welcome');
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Compute preview styles from lookAndFeel
  const previewStyles: PreviewStyles = useMemo(() => {
    const lf = survey?.lookAndFeel || defaultLookAndFeel;
    
    // Map shadow size to tailwind classes
    const shadowMap = {
      none: 'shadow-none',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-xl',
    };

    // Map font size to tailwind classes (or px values)
    const fontSizeMap = {
      sm: '14px',
      md: '16px',
      lg: '18px',
    };

    return {
      primaryColor: lf.primaryColor,
      accentColor: lf.accentColor,
      backgroundColor: lf.backgroundColor || '#ffffff',
      textColor: '#1e293b',
      fontFamily: lf.fontFamily,
      headingFont: lf.headingFont || lf.fontFamily,
      baseFontSize: fontSizeMap[lf.baseFontSize || 'md'],
      borderRadius: lf.borderRadius,
      showProgressBar: lf.progressBarStyle !== 'pageCount',
      selectionStyle: lf.selectionStyle || 'radio',
      buttonStyle: lf.buttonStyle || 'filled',
      buttonTextTransform: lf.buttonTextTransform || 'none',
      cardShadow: shadowMap[lf.cardShadow || 'sm'],
      backgroundImageOpacity: lf.backgroundImageOpacity ?? 1,
      animation: lf.animation || 'none',
      glassOpacity: lf.glassOpacity ?? 0,
      inputStyle: lf.inputStyle || 'standard',
      borderWidth: lf.borderWidth ?? 0,
      borderColor: lf.borderColor || 'transparent',
    };
  }, [survey?.lookAndFeel]);

  const blocks = survey?.blocks || [];

  const totalQuestions = useMemo(() => {
    return blocks.reduce((acc, block) => acc + block.questions.length, 0);
  }, [blocks]);

  const answeredQuestions = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  if (!isOpen || !survey) return null;

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goToNextPage = () => {
    if (currentPage === 'welcome') {
      setCurrentPage('consent');
    } else if (currentPage === 'consent') {
      setCurrentPage('questions');
      setCurrentBlockIndex(0);
    } else if (currentPage === 'questions') {
      if (currentBlockIndex < blocks.length - 1) {
        setCurrentBlockIndex((prev) => prev + 1);
      } else {
        setCurrentPage('thankyou');
      }
    }
  };

  const goToPrevPage = () => {
    if (currentPage === 'consent') {
      setCurrentPage('welcome');
    } else if (currentPage === 'questions') {
      if (currentBlockIndex > 0) {
        setCurrentBlockIndex((prev) => prev - 1);
      } else {
        setCurrentPage('consent');
      }
    } else if (currentPage === 'thankyou') {
      setCurrentPage('questions');
      setCurrentBlockIndex(blocks.length - 1);
    }
  };

  const getDeviceWidth = () => {
    switch (deviceView) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-2xl';
      default:
        return 'max-w-4xl';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900">
      {/* Preview Toolbar */}
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit Preview
          </button>
          <div className="h-6 w-px bg-gray-600" />
          <span className="text-sm text-gray-400">Preview Mode</span>
        </div>

        {/* Device Toggle */}
        <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setDeviceView('desktop')}
            className={`p-2 rounded-md transition-colors ${
              deviceView === 'desktop' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Desktop"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setDeviceView('tablet')}
            className={`p-2 rounded-md transition-colors ${
              deviceView === 'tablet' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Tablet"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setDeviceView('mobile')}
            className={`p-2 rounded-md transition-colors ${
              deviceView === 'mobile' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Mobile"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>

        {/* Page indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Page: {currentPage === 'questions' ? `Block ${currentBlockIndex + 1}/${blocks.length}` : currentPage}
          </span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center relative">
        {/* Background Image Layer */}
        {survey.lookAndFeel.backgroundType === 'image' && survey.lookAndFeel.headerImageUrl && (
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${survey.lookAndFeel.headerImageUrl})`,
              opacity: previewStyles.backgroundImageOpacity 
            }}
          />
        )}
        
        <div
          className={`w-full ${getDeviceWidth()} rounded-lg overflow-hidden transition-all duration-300 z-10 ${previewStyles.cardShadow}`}
          style={{ 
            borderRadius: `${previewStyles.borderRadius}px`,
            fontSize: previewStyles.baseFontSize,
            backgroundColor: previewStyles.glassOpacity 
              ? `rgba(255, 255, 255, ${1 - previewStyles.glassOpacity})` 
              : (previewStyles.cardShadow === 'shadow-none' ? 'transparent' : '#ffffff'),
            backdropFilter: previewStyles.glassOpacity ? 'blur(12px)' : 'none',
            borderWidth: `${previewStyles.borderWidth}px`,
            borderColor: previewStyles.borderColor,
            borderStyle: previewStyles.borderWidth > 0 ? 'solid' : 'none'
          }}
        >
          {/* Progress Bar */}
          {previewStyles.showProgressBar && currentPage === 'questions' && (
            <div className="h-2 bg-gray-200">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: previewStyles.primaryColor }}
              />
            </div>
          )}

          {/* Survey Header */}
          <div className="p-6 border-b bg-white">
            <h1
              className="text-2xl font-bold"
              style={{ color: previewStyles.primaryColor, fontFamily: previewStyles.headingFont }}
            >
              {survey.name}
            </h1>
          </div>

          {/* Page Content */}
          <div
            key={currentPage + currentBlockIndex}
            className={`p-6 min-h-[400px] ${
              previewStyles.animation === 'fade' ? 'animate-in fade-in duration-500' :
              previewStyles.animation === 'slide' ? 'animate-in slide-in-from-right-8 duration-500' :
              previewStyles.animation === 'scale' ? 'animate-in zoom-in-95 duration-500' : ''
            }`}
            style={{ backgroundColor: previewStyles.backgroundColor, fontFamily: previewStyles.fontFamily }}
          >
            {currentPage === 'welcome' && (
              <WelcomePage
                content={survey.welcomePage?.content || '<p>Welcome to our survey!</p>'}
                styles={previewStyles}
              />
            )}

            {currentPage === 'consent' && (
              <ConsentPageView
                statement={survey.consentPage?.statement || 'Please review and accept our terms.'}
                styles={previewStyles}
              />
            )}

            {currentPage === 'questions' && blocks[currentBlockIndex] && (
              <QuestionsPage
                block={blocks[currentBlockIndex]}
                answers={answers}
                onAnswer={handleAnswer}
                styles={previewStyles}
              />
            )}

            {currentPage === 'thankyou' && (
              <ThankYouPage
                content={survey.thankYouPage?.content || '<p>Thank you for completing this survey!</p>'}
                styles={previewStyles}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="p-4 border-t flex justify-between bg-white">
            {currentPage !== 'welcome' && currentPage !== 'thankyou' ? (
              <button
                onClick={goToPrevPage}
                className={`px-6 py-2 border transition-colors hover:bg-gray-50 ${previewStyles.buttonTextTransform}`}
                style={{
                  borderColor: previewStyles.primaryColor,
                  color: previewStyles.primaryColor,
                  borderRadius: `${previewStyles.borderRadius}px`,
                  textTransform: previewStyles.buttonTextTransform
                }}
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {currentPage !== 'thankyou' && (
              <button
                onClick={goToNextPage}
                className={`px-6 py-2 transition-colors hover:opacity-90 ${previewStyles.buttonTextTransform}`}
                style={{
                  backgroundColor: previewStyles.buttonStyle === 'filled' ? previewStyles.primaryColor : 
                                  previewStyles.buttonStyle === 'soft' ? `${previewStyles.primaryColor}20` : 'transparent',
                  color: previewStyles.buttonStyle === 'filled' ? '#ffffff' : previewStyles.primaryColor,
                  border: previewStyles.buttonStyle === 'outline' ? `1px solid ${previewStyles.primaryColor}` : 'none',
                  borderRadius: `${previewStyles.borderRadius}px`,
                  textTransform: previewStyles.buttonTextTransform
                }}
              >
                {currentPage === 'welcome' ? 'Start Survey' : currentPage === 'questions' && currentBlockIndex === blocks.length - 1 ? 'Submit' : 'Next'}
              </button>
            )}

            {currentPage === 'thankyou' && (
              <button
                onClick={onClose}
                className={`px-6 py-2 transition-colors hover:opacity-90 ${previewStyles.buttonTextTransform}`}
                style={{
                  backgroundColor: previewStyles.buttonStyle === 'filled' ? previewStyles.primaryColor : 
                                  previewStyles.buttonStyle === 'soft' ? `${previewStyles.primaryColor}20` : 'transparent',
                  color: previewStyles.buttonStyle === 'filled' ? '#ffffff' : previewStyles.primaryColor,
                  border: previewStyles.buttonStyle === 'outline' ? `1px solid ${previewStyles.primaryColor}` : 'none',
                  borderRadius: `${previewStyles.borderRadius}px`,
                  textTransform: previewStyles.buttonTextTransform
                }}
              >
                Close Preview
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components

function WelcomePage({ content, styles }: { content: string; styles: PreviewStyles }) {
  return (
    <div className="prose max-w-none" style={{ color: styles.textColor }}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

function ConsentPageView({ statement, styles }: { statement: string; styles: PreviewStyles }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div>
      <div className="prose max-w-none mb-6" style={{ color: styles.textColor }}>
        <p>{statement}</p>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="w-5 h-5 rounded"
          style={{ accentColor: styles.primaryColor }}
        />
        <span style={{ color: styles.textColor }}>I agree to participate in this survey</span>
      </label>
    </div>
  );
}

function QuestionsPage({
  block,
  answers,
  onAnswer,
  styles,
}: {
  block: Block;
  answers: Record<string, string | string[]>;
  onAnswer: (questionId: string, value: string | string[]) => void;
  styles: PreviewStyles;
}) {
  return (
    <div className="space-y-8">
      {block.name && (
        <h2 className="text-xl font-semibold mb-4" style={{ color: styles.primaryColor, fontFamily: styles.headingFont }}>
          {block.name}
        </h2>
      )}
      {block.questions.map((question, index) => (
        <QuestionRenderer
          key={question.id}
          question={question}
          index={index + 1}
          answer={answers[question.id]}
          onAnswer={(value) => onAnswer(question.id, value)}
          styles={styles}
        />
      ))}
    </div>
  );
}

function QuestionRenderer({
  question,
  index,
  answer,
  onAnswer,
  styles,
}: {
  question: Question;
  index: number;
  answer?: string | string[];
  onAnswer: (value: string | string[]) => void;
  styles: PreviewStyles;
}) {
  const renderInput = () => {
    switch (question.type) {
      case 'MultipleChoice':
        const mcQuestion = question as import('@/api/contracts').MultipleChoiceQuestion;
        const selStyle = styles.selectionStyle;
        const isMultiple = mcQuestion.allowMultiple;
        
        // Render choices with different selection styles
        const renderChoice = (choice: { id: string; text: string }, isSelected: boolean, onSelect: () => void) => {
          // Radio/Classic style
          if (selStyle === 'radio') {
            return (
              <label
                key={choice.id}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderRadius: `${styles.borderRadius}px` }}
              >
                {isMultiple ? (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: styles.primaryColor }}
                  />
                ) : (
                  <input
                    type="radio"
                    name={question.id}
                    checked={isSelected}
                    onChange={onSelect}
                    className="w-4 h-4"
                    style={{ accentColor: styles.primaryColor }}
                  />
                )}
                <span style={{ color: styles.textColor }}>{choice.text}</span>
              </label>
            );
          }

          // Pill style
          if (selStyle === 'pill') {
            return (
              <button
                key={choice.id}
                onClick={onSelect}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  isSelected
                    ? 'text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
                style={isSelected ? { backgroundColor: styles.primaryColor } : {}}
                type="button"
              >
                {choice.text}
              </button>
            );
          }

          // Bubble style
          if (selStyle === 'bubble') {
            return (
              <button
                key={choice.id}
                onClick={onSelect}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all border-2 ${
                  isSelected
                    ? ''
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
                style={isSelected ? { 
                  backgroundColor: `${styles.primaryColor}20`,
                  borderColor: styles.primaryColor,
                  color: styles.primaryColor
                } : {}}
                type="button"
              >
                {isSelected && <Check className="mr-1 inline-block h-3 w-3" />}
                {choice.text}
              </button>
            );
          }

          // Button style
          return (
            <button
              key={choice.id}
              onClick={onSelect}
              className={`w-full px-4 py-3 text-sm font-medium text-center transition-all border-2 ${
                isSelected
                  ? 'text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
              style={{
                borderRadius: `${styles.borderRadius}px`,
                ...(isSelected ? { 
                  backgroundColor: styles.primaryColor,
                  borderColor: styles.primaryColor,
                } : {})
              }}
              type="button"
            >
              {choice.text}
            </button>
          );
        };
        
        if (isMultiple) {
          // Checkbox style
          const selectedChoices = (answer as string[]) || [];
          const isWrap = selStyle === 'pill' || selStyle === 'bubble';
          return (
            <div className={isWrap ? 'flex flex-wrap gap-2' : 'space-y-2'}>
              {mcQuestion.choices?.map((choice) => {
                const isSelected = selectedChoices.includes(choice.id);
                return renderChoice(choice, isSelected, () => {
                  if (isSelected) {
                    onAnswer(selectedChoices.filter((id) => id !== choice.id));
                  } else {
                    onAnswer([...selectedChoices, choice.id]);
                  }
                });
              })}
            </div>
          );
        }
        // Radio style
        const isWrap = selStyle === 'pill' || selStyle === 'bubble';
        return (
          <div className={isWrap ? 'flex flex-wrap gap-2' : 'space-y-2'}>
            {mcQuestion.choices?.map((choice) => 
              renderChoice(choice, answer === choice.id, () => onAnswer(choice.id))
            )}
          </div>
        );

      case 'TextEntry':
        return (
          <textarea
            value={(answer as string) || ''}
            onChange={(e) => onAnswer(e.target.value)}
            className={`w-full p-3 resize-none focus:outline-none ${
               styles.inputStyle === 'flushed' ? 'border-b-2 bg-transparent px-0' :
               styles.inputStyle === 'filled' ? 'bg-gray-100 border-0' :
               styles.inputStyle === 'floating' ? 'border shadow-sm' :
               'border' // standard
            }`}
            style={{
              borderRadius: styles.inputStyle !== 'flushed' ? `${styles.borderRadius}px` : '0',
              borderColor: styles.inputStyle === 'flushed' || styles.inputStyle === 'standard' || styles.inputStyle === 'floating' ? undefined : 'transparent',
              color: styles.textColor,
              minHeight: '100px',
            }}
            placeholder="Enter your response..."
          />
        );

      case 'MatrixTable':
        const matrixQuestion = question as import('@/api/contracts').MatrixTableQuestion;
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left"></th>
                  {matrixQuestion.columns.map((col) => (
                    <th key={col.id} className="p-2 text-center text-sm font-medium" style={{ color: styles.textColor }}>
                      {col.text}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixQuestion.rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-2 text-sm" style={{ color: styles.textColor }}>{row.text}</td>
                    {matrixQuestion.columns.map((col) => (
                      <td key={col.id} className="p-2 text-center">
                        <input
                          type="radio"
                          name={`${question.id}-${row.id}`}
                          className="w-4 h-4"
                          style={{ accentColor: styles.primaryColor }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={(answer as string) || ''}
            onChange={(e) => onAnswer(e.target.value)}
            className={`w-full p-3 focus:outline-none ${
               styles.inputStyle === 'flushed' ? 'border-b-2 bg-transparent px-0' :
               styles.inputStyle === 'filled' ? 'bg-gray-100 border-0' :
               styles.inputStyle === 'floating' ? 'border shadow-sm' :
               'border' // standard
            }`}
            style={{
              borderRadius: styles.inputStyle !== 'flushed' ? `${styles.borderRadius}px` : '0',
              borderColor: styles.inputStyle === 'flushed' || styles.inputStyle === 'standard' || styles.inputStyle === 'floating' ? undefined : 'transparent',
              color: styles.textColor,
            }}
            placeholder="Enter your response..."
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <span className="font-medium" style={{ color: styles.primaryColor }}>
          Q{index}.
        </span>
        <div>
          <span style={{ color: styles.textColor }}>{question.text}</span>
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      </div>
      {renderInput()}
    </div>
  );
}

function ThankYouPage({ content, styles }: { content: string; styles: PreviewStyles }) {
  return (
    <div className="text-center py-8">
      <svg
        className="w-16 h-16 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: styles.primaryColor }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div
        className="prose max-w-none"
        style={{ color: styles.textColor }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

const defaultLookAndFeel: LookAndFeel = {
  primaryColor: '#2563eb',
  accentColor: '#64748b',
  fontFamily: 'Inter, system-ui, sans-serif',
  progressBarStyle: 'bar',
  borderRadius: 8,
};
