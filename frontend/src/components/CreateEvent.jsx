import React, { useState } from 'react';
import './EventPage.css'; 
//import CheckIcon from '../assets/CheckIcon'; 

const PlusCircleIcon = () => (
  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 배경 원 색상 적용 */}
    <circle cx="12" cy="12" r="12" fill="#BBCEA0"/>
    {/* 내부 플러스 모양 (흰색) */}
    <path d="M12 7V17M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 작은 체크 아이콘
const DateCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#BBCEA0"/>
    <path d="M16 9L10.5 14.5L8 12" stroke="#FAFFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CreateEvent = ({ date, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  
  // 시간 상태 분리 (기본값: 12:00 ~ 13:00)
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('13:00');

  const handleSave = () => {
    if (!title.trim()) {
      alert('약속 이름을 입력해주세요!');
      return;
    }
    if (!date) {
        alert("날짜 정보가 없습니다.");
        onCancel();
        return;
    }

    // 1. 시작 시간 Date 객체 생성
    const newStartDate = new Date(date);
    const [startH, startM] = startTime.split(':').map(Number);
    newStartDate.setHours(startH, startM);

    // 2. 종료 시간 Date 객체 생성
    const newEndDate = new Date(date);
    const [endH, endM] = endTime.split(':').map(Number);
    newEndDate.setHours(endH, endM);

    // 종료 시간이 시작 시간보다 빠른 경우 방어 코드 (선택사항)
    if (newEndDate < newStartDate) {
      alert("종료 시간이 시작 시간보다 빠를 수 없습니다.");
      return;
    }

    // 3. 부모에게 전달 (start, end 모두 포함)
    onSave({
      title,
      start: newStartDate,
      end: newEndDate, 
    });
  };
  
  const formattedDate = date ? `${date.getMonth() + 1}월 ${date.getDate()}일` : "";

  return (
    <div className="event-page-overlay">
      <div className="event-page-container">
        
        {/* 헤더 영역 */}
        <div className="create-header-wrapper">
          <div className="header-icon">
            <PlusCircleIcon />
          </div>
          <h2 className="header-title-text">
            선택된 일정에서<br />어떤 약속을 추가할까요?
          </h2>
        </div>

        {/* 선택된 날짜 박스 */}
        <div className="selected-date-box">
          <div className="selected-date-num">
            {date ? date.getDate() : "0"}
          </div>
          <div className="date-check-icon">
            <DateCheckIcon />
          </div>
        </div>

        {/* 입력 폼 영역 */}
        <div className="input-group">
          <label>약속 이름</label>
          <input 
            type="text" 
            placeholder="ex) 듀듀듀"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 👇 [수정됨] 시간 입력 영역 (가로 배치) */}
        <div className="input-group">
          <label>약속 시간</label>
          <div className="time-range-wrapper">
            <input 
              type="time" 
              className="time-input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <span className="time-separator">~</span>
            <input 
              type="time" 
              className="time-input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="button-group">
          <button className="btn primary" onClick={handleSave}>추가하기</button>
          <button className="btn secondary" onClick={onCancel}>뒤로가기</button>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;