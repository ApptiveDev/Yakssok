import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LogoIconWhite from "../assets/LogoIconWhite";
import EditIcon from "../assets/EditIcon";
import CreateEvent from '../components/CreateEvent';
import UpdateEvent from '../components/UpdateEvent';
import ExclamationIcon from '../assets/ExclamationIcon';
import CheckCircleIcon from '../assets/CheckCircleIcon';
import EmptyCircleIcon from '../assets/EmptyCircleIcon';
import './Invited.css'; 

const Invited = () => {
  const location = useLocation();  
  const initialEvents = location.state ? location.state.events : []; 

  // 초기 데이터 로드 (ID가 없으면 강제로 생성)
  const [allEvents, setAllEvents] = useState(() => {
    return initialEvents.map((event, index) => ({
      ...event,
      id: event.id || `generated-${index}-${Date.now()}`
    }));
  });

  const partyName = "앱티브 팀플 회의"; 

  const partyDateRange = React.useMemo(() => ({
    startDate: new Date(2025, 10, 2), 
    endDate: new Date(2025, 11, 8),   
  }), []);

  const [dates, setDates] = useState([]); 
  const [filteredEvents, setFilteredEvents] = useState([]); 
  
  // 팝업 메뉴 상태
  const [activeMenuId, setActiveMenuId] = useState(null);

  // 화면 모드: 'list', 'create', 'update', 'delete'
  const [viewMode, setViewMode] = useState('list');

  // 추가, 수정을 위한 데이터
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 삭제를 위한 데이터
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([]);

  // 날짜 배열 생성
  useEffect(() => {
    const dateArray = [];
    let currentDate = new Date(partyDateRange.startDate);
    while (currentDate <= partyDateRange.endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1); 
    }
    setDates(dateArray); 
  }, [partyDateRange]); 

  // 이벤트 필터링 (allEvents 기준)
  useEffect(() => {
    const filtered = allEvents.filter((event) => {
      if (!event.start) return false;
      const eventDate = new Date(event.start);
      if (isNaN(eventDate.getTime())) return false;

      const start = new Date(partyDateRange.startDate);
      const end = new Date(partyDateRange.endDate);

      eventDate.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      return eventDate >= start && eventDate <= end;
    });
    setFilteredEvents(filtered); 
  }, [allEvents, partyDateRange]); 

  const getEventTitleForDate = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const eventForDate = filteredEvents.filter(event => {
      const eventDate = new Date(event.start);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === targetDate.getTime(); 
    });

    return eventForDate.length > 0 
      ? eventForDate.map(event => event.title).join(", ") 
      : "약속 없음";
  };
  
  const toggleMenu = (dateMs) => {
    // 삭제 
    if (viewMode === 'delete') return;

    if (activeMenuId === dateMs) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(dateMs);
    }
  };

  // 추가
  const handleAddClick = (date) => {
    setSelectedDate(date);
    setViewMode('create'); 
    setActiveMenuId(null);
  };

  //수정
  const handleEditClick = (date, eventTitle) => {
    const targetEvent = allEvents.find(event => {
      const eDate = new Date(event.start);
      eDate.setHours(0,0,0,0);
      const dDate = new Date(date);
      dDate.setHours(0,0,0,0);
      return eDate.getTime() === dDate.getTime() && eventTitle.includes(event.title);
    });

    if (targetEvent) {
      setSelectedEvent(targetEvent);
      setViewMode('update');
      setActiveMenuId(null);
    } else {
        alert("수정할 약속이 없습니다.");
    }
  };

  // 삭제
  const enterDeleteMode = (date) => {
    const title = getEventTitleForDate(date);
    if (title === "약속 없음") {
        alert("삭제할 약속이 없습니다.");
        return;
    }
    
    setSelectedDeleteIds([]); // 초기화
    setViewMode('delete');
    setActiveMenuId(null);
  };

  // 삭제 
  const toggleDeleteSelection = (date) => {
    // 해당 날짜의 이벤트들을 찾음
    const targetEvents = allEvents.filter(event => {
      const eDate = new Date(event.start);
      eDate.setHours(0,0,0,0);
      const dDate = new Date(date);
      dDate.setHours(0,0,0,0);
      return eDate.getTime() === dDate.getTime();
    });

    if (targetEvents.length === 0) return;

    const targetIds = targetEvents.map(e => e.id);
    
    // 이미 선택되어 있는지 확인 (하나라도 포함되면 해제, 아니면 전체 선택)
    const isSelected = targetIds.every(id => selectedDeleteIds.includes(id));

    if (isSelected) {
      // 선택 해제
      setSelectedDeleteIds(prev => prev.filter(id => !targetIds.includes(id)));
    } else {
      // 선택 추가
      setSelectedDeleteIds(prev => [...prev, ...targetIds]);
    }
  };

  const confirmDelete = () => {
    if (selectedDeleteIds.length === 0) {
        alert("선택된 일정이 없습니다.");
        return;
    }
    const updatedEvents = allEvents.filter(e => !selectedDeleteIds.includes(e.id));
    setAllEvents(updatedEvents);
    setViewMode('list');
    setSelectedDeleteIds([]);
  };

  // 추가
  const saveNewEvent = (eventData) => {
    const newEvent = { ...eventData, id: Date.now() };
    setAllEvents([...allEvents, newEvent]); 
    setViewMode('list');
  };

  // 수정
  const updateEvent = (updatedEvent) => {
    setAllEvents(allEvents.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    setViewMode('list');
  };


  if (viewMode === 'create') {
    return <CreateEvent date={selectedDate} onSave={saveNewEvent} onCancel={() => setViewMode('list')} />;
  }

  if (viewMode === 'update') {
    return <UpdateEvent event={selectedEvent} onSave={updateEvent} onCancel={() => setViewMode('list')} />;
  }

  // 삭제 모드인지 확인
  const isDeleteMode = viewMode === 'delete';

  return (
    <div className="invite-container" onClick={() => setActiveMenuId(null)}>
      
      <header className="invite-header">
        {isDeleteMode ? (
          <div className="delete-header-container">
            <div className="delete-icon-wrapper">
              <ExclamationIcon />
            </div>
            <h2 className="delete-header-title">
              선택된 일정을<br/>삭제할까요?
            </h2>
          </div>
        ) : (
          // 일반 모드 헤더
          <>
            <div className="sidebarLeftLogo"> <LogoIconWhite /> </div>
            <h1>{partyName}</h1>
            <p>{partyName}에 초대되었어요</p>
            <p>약속 범위 안에서 나의 일정이예요</p>
          </>
        )}
      </header>
      
      <main className="main-content">
        <div className="date-selector-container">
          {dates.length > 0 ? (
            dates.map((date, index) => {
              const eventTitle = getEventTitleForDate(date); 
              const hasEvent = eventTitle !== "약속 없음"; 
              const dateId = date.getTime();
              const isMenuOpen = activeMenuId === dateId;

              // 삭제 모드일 때 선택 여부 확인
              const isSelectedForDelete = hasEvent && allEvents.some(e => {
                  const eDate = new Date(e.start);
                  eDate.setHours(0,0,0,0);
                  const dDate = new Date(date);
                  dDate.setHours(0,0,0,0);
                  return eDate.getTime() === dDate.getTime() && selectedDeleteIds.includes(e.id);
              });

              return (
                <div 
                  key={index} 
                  className="event-box"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isDeleteMode && hasEvent) toggleDeleteSelection(date);
                  }}
                  style={{ 
                    backgroundColor: hasEvent ? "#F9CBAA" : "#EAEEE0", 
                    color: hasEvent ? "#FFFFFF" : "#C4C5B7",
                    cursor: isDeleteMode && hasEvent ? 'pointer' : 'default',
                    opacity: isDeleteMode && !hasEvent ? 0.5 : 1 
                  }}
                >
                  {isDeleteMode ? (
                      hasEvent && (
                          <div className="edit-icon-pos">
                              {isSelectedForDelete ? <CheckCircleIcon /> : <EmptyCircleIcon />}
                          </div>
                      )
                  ) : (
                      <button 
                        className="edit-icon-pos" 
                        onClick={() => toggleMenu(dateId)}
                      >
                        <EditIcon />
                      </button>
                  )}

                  {/* 팝업 메뉴 (일반 모드일 때만 표시) */}
                  {isMenuOpen && !isDeleteMode && (
                    <div className="popup-menu">
                      <button className="popup-btn add" onClick={() => handleAddClick(date)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                        추가하기
                      </button>
                      
                      <button className="popup-btn normal" onClick={() => handleEditClick(date, eventTitle)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        수정하기
                      </button>
                      
                      <button className="popup-btn normal" onClick={() => enterDeleteMode(date)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        삭제하기
                      </button>
                    </div>
                  )}

                  <div className="event-date">{date.getDate()}</div> 
                  <div className="event-info"><span className="event-title">{eventTitle}</span></div>
                </div>
              );
            })
          ) : (
            <div className="empty-event-box"><div className="event-date">No Dates</div></div>
          )}
        </div>
      </main>

      <footer>
        {isDeleteMode ? (
            // [삭제 모드] 네/아니오 버튼
            <>
                <button 
                    className="confirm-btn" 
                    style={{ background: '#1F1F1F', width: '100px' }}
                    onClick={confirmDelete}
                >
                    네
                </button>
                <button 
                    className="edit-btn" 
                    style={{ width: '100px', background: '#F4F8E9', color: '#555' }}
                    onClick={() => {
                        setViewMode('list');
                        setSelectedDeleteIds([]);
                    }}
                >
                    아니오
                </button>
            </>
        ) : (
            // [일반 모드] 확인/수정하기 버튼
            <>
                <button className="confirm-btn">확인</button>
                <button className="edit-btn">나의 일정 수정하기</button>
            </>
        )}
      </footer>
    </div>
  );
};

export default Invited;