import React, { useState, useEffect } from 'react';
import questionsData from './data';

function App() {
  const [screen, setScreen] = useState('home'); // home, quiz, result
  const [mode, setMode] = useState(''); // practice, exam
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    let timer;
    if (screen === 'quiz' && mode === 'exam' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [screen, mode, timeLeft]);

  const startPractice = () => {
    setMode('practice');
    setQuestions([...questionsData]);
    setCurrentIndex(0);
    setUserAnswers({});
    setScreen('quiz');
  };

  const startExam = () => {
    setMode('exam');
    let shuffled = [...questionsData].sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, 60).map(q => {
      let opts = [...q.options].sort(() => 0.5 - Math.random());
      return { ...q, options: opts };
    });
    setQuestions(selected);
    setCurrentIndex(0);
    setUserAnswers({});
    setTimeLeft(30 * 60);
    setScreen('quiz');
  };

  const selectOption = (optId) => {
    if (userAnswers[currentIndex]) return; // already answered
    const isCorrect = optId === questions[currentIndex].answer;
    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: { selected: optId, isCorrect }
    }));
  };

  const finishQuiz = () => {
    setScreen('result');
  };

  const goHome = () => {
    setScreen('home');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (screen === 'home') {
    return (
      <div className="screen active">
        <h1>📚 Ôn Tập Kiến Thức 🚀</h1>
        <p>Chọn chế độ để bắt đầu!</p>
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <button className="btn btn-primary" onClick={startPractice}>📖 Luyện Tập (Tất cả)</button>
          <button className="btn btn-danger" onClick={startExam}>⏳ Thi Thử (60 câu - 30 phút)</button>
        </div>
      </div>
    );
  }

  if (screen === 'result') {
    let score = Object.values(userAnswers).filter(a => a.isCorrect).length;
    let total = questions.length;
    let msg = "Hoàn thành bài tập!";
    if (mode === 'exam') {
      let percent = score / total;
      if (percent >= 0.8) msg = "Tuyệt vời! Bạn nắm kiến thức rất chắc! 🏆";
      else if (percent >= 0.5) msg = "Khá tốt, cố gắng ôn thêm nhé! 👍";
      else msg = "Cần ôn tập nhiều hơn! 💪";
    }

    return (
      <div className="screen active">
        <h1>🎉 Kết Quả 🎉</h1>
        <div className="score-card">
          <h2 id="score-text">Đúng: {score} / {total}</h2>
          <p id="score-msg">{msg}</p>
        </div>
        <button className="btn btn-primary" onClick={goHome}>🏠 Về Trang Chủ</button>
      </div>
    );
  }

  // Quiz Screen
  const q = questions[currentIndex];
  const hasAnswered = !!userAnswers[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  let prefix = mode === 'practice' ? `${q.id} / ` : `Câu ${currentIndex + 1}/`;
  let total = mode === 'practice' ? questions.length : 60;

  return (
    <div className="screen active" style={{ justifyContent: 'flex-start' }}>
      <div className="quiz-header">
        <button className="btn btn-small" onClick={goHome}>🔙 Quay lại</button>
        {mode === 'exam' && (
          <div id="timer">⏱️ <span>{formatTime(timeLeft)}</span></div>
        )}
        <div className="progress">
          <span>{prefix}{total}</span>
        </div>
      </div>

      <div className="question-box">
        <h2 id="question-text">{q.text}</h2>
        <div className="options">
          {q.options.map(opt => {
            let className = 'option';
            if (hasAnswered) {
              className += ' disabled';
              if (opt.id === q.answer) className += ' correct';
              else if (userAnswers[currentIndex].selected === opt.id) className += ' wrong';
            }

            let optPrefix = mode === 'practice' ? `${opt.id}. ` : '';

            return (
              <div 
                key={opt.id} 
                className={className} 
                onClick={() => selectOption(opt.id)}
              >
                {optPrefix}{opt.text}
              </div>
            );
          })}
        </div>
      </div>

      <div className="navigation">
        <button 
          className="btn btn-nav" 
          style={{ visibility: currentIndex === 0 ? 'hidden' : 'visible' }} 
          onClick={() => setCurrentIndex(currentIndex - 1)}
        >
          ⬅️ Câu trước
        </button>

        {isLast ? (
          <button className="btn btn-success" onClick={finishQuiz} style={{ width: 'auto' }}>Nộp Bài 🏁</button>
        ) : (
          <button className="btn btn-nav" onClick={() => setCurrentIndex(currentIndex + 1)}>Câu tiếp ➡️</button>
        )}
      </div>
    </div>
  );
}

export default App;
