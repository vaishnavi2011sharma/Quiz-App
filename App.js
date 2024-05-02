import React, { useState, useEffect } from 'react';
import QuizResult from './components/QuizResult';
import './App.css'; // Import CSS file

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [clickedOption, setClickedOption] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);

  useEffect(() => {
    // Load state from localStorage on initial render
    const savedState = JSON.parse(localStorage.getItem('quizState'));
    if (savedState) {
      setCurrentQuestion(savedState.currentQuestion);
      setScore(savedState.score);
      setClickedOption(savedState.clickedOption);
      setShowResult(savedState.showResult);
    }

    fetch('./quizQuestions.json')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched questions:', data);
        setQuestions(data);
      })
      .catch(error => console.error('Error fetching questions:', error));

    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    // Save state to localStorage whenever it changes
    const stateToSave = {
      currentQuestion,
      score,
      clickedOption,
      showResult,
    };
    localStorage.setItem('quizState', JSON.stringify(stateToSave));
  }, [currentQuestion, score, clickedOption, showResult]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('Visibility changed:', document.visibilityState);
      if (document.visibilityState === 'hidden') {
        setViolationCount(violationCount + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [violationCount]);

  const enterFullScreen = () => {
    document.documentElement.requestFullscreen();
  };

  const changeQuestion = () => {
    updateScore();
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setClickedOption(0);
    } else {
      setShowResult(true);
    }
  };

  const updateScore = () => {
    if (clickedOption === questions[currentQuestion]?.answer) {
      setScore(score + 1);
    }
  };

  const resetAll = () => {
    setShowResult(false);
    setCurrentQuestion(0);
    setClickedOption(0);
    setScore(0);
    // Clear saved state from localStorage
    localStorage.removeItem('quizState');
  };

  return (
    <div>
      {!isFullScreen && (
        <div className="blocker-popup">
          <p>Please enter full-screen mode to continue.</p>
          <button onClick={enterFullScreen}>Enter Full Screen</button>
        </div>
      )}
      {isFullScreen && (
        <>
          <p className="heading-txt">Quiz APP</p>
          <div className="container">
            <div className="violation-count">Violation Count: {violationCount}</div>
            {showResult ? (
              <QuizResult score={score} totalScore={questions.length} tryAgain={resetAll} />
            ) : (
              <>
                <div className="question">
                  <span id="question-number">{currentQuestion + 1}. </span>
                  <span id="question-txt">{questions[currentQuestion]?.question}</span>
                </div>
                <div className="option-container">
                  {questions[currentQuestion]?.options.map((option, i) => {
                    return (
                      <button
                        className={`option-btn ${clickedOption === i + 1 ? 'checked' : null}`}
                        key={i}
                        onClick={() => setClickedOption(i + 1)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                <input type="button" value="Next" id="next-button" onClick={changeQuestion} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Quiz;
