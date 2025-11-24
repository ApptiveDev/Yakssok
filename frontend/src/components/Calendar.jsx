import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import './Calendar.css';

const Calendar = ({ events }) => {
  const calendarRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('dayGridMonth');

  // 초기화: 오늘 날짜로 이동
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
      setCurrentDate(calendarApi.getDate());
    }
  }, []);

  // 월/년도 표시 포맷팅
  const formatMonthAndYear = (date) => {
    const month = date.toLocaleString('ko-KR', { month: 'long' });
    const year = date.getFullYear();
    return { month, year };
  };
  const { month, year } = formatMonthAndYear(currentDate);

  const handleViewChange = (view) => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.changeView(view);
      setActiveView(view);
    }
  };

  const handleTodayClick = () => {
    const api = calendarRef.current?.getApi();
    api?.today();
    setCurrentDate(api.getDate());
  };

  const handlePrevClick = () => {
    const api = calendarRef.current?.getApi();
    api?.prev();
    setCurrentDate(api.getDate());
  };

  const handleNextClick = () => {
    const api = calendarRef.current?.getApi();
    api?.next();
    setCurrentDate(api.getDate());
  };

  // 요일 헤더 커스텀
  const getDayHeaderContent = (info) => {
    const days = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
    const dayName = days[info.date.getDay()];
    const dayNumber = info.date.getDate();

    if (info.view.type === 'dayGridMonth') {
      return <span className="monthly-header-dayname">{dayName}</span>;
    } else if (info.view.type === 'timeGridWeek') {
      return (
        <div className="weekly-header-content">
          <p className="weekly-header-dayname">{dayName}</p>
          <p className="weekly-header-daynumber">{dayNumber}일</p>
        </div>
      );
    }
    return null;
  };

  // 이벤트 렌더링 (주간)
  const renderEventContent = (arg) => {
    const { event, timeText, view } = arg;

    if (view.type === 'timeGridWeek') {
      return (
        <div className="custom-event-content">
          <div className="event-title">{event.title}</div>
          {timeText && (
            <div className="event-time-container">
              <span className="event-time-start">{timeText}</span>
            </div>
          )}
        </div>
      );
    }

    if (view.type === 'dayGridMonth') return null;
    return null;
  };

  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl">
      <div className="calendar-container">
        {/* 상단 커스텀 헤더 */}
        <div className="custom-header">
          <div className="custom-title-container">
            <span className="month">{month}</span>
            <span className="year">{year}</span>
          </div>

          <div className="view-toggle-buttons">
            <button
              onClick={() => handleViewChange('dayGridMonth')}
              className={activeView === 'dayGridMonth' ? 'active' : ''}
            >
              월간
            </button>
            <button
              onClick={() => handleViewChange('timeGridWeek')}
              className={activeView === 'timeGridWeek' ? 'active' : ''}
            >
              주간
            </button>
          </div>

          <div className="nav-buttons">
            <button onClick={handlePrevClick} className="nav-arrow">&lt;</button>
            <button onClick={handleTodayClick} className="today-button">오늘</button>
            <button onClick={handleNextClick} className="nav-arrow">&gt;</button>
          </div>
        </div>

        {/* FullCalendar 본체 */}
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          events={events}
          headerToolbar={false}
          datesSet={(info) => setActiveView(info.view.type)}
          dayHeaderContent={getDayHeaderContent}
          eventContent={renderEventContent}
          eventDisplay="block"

          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}

          allDaySlot={false}
          slotLabelContent={(arg) => `${arg.date.getHours()}시`}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          slotDuration="01:00:00"
          height="100%"

          // 월간 날짜 셀 커스텀 (오늘/과거/미래 색상 + 이벤트 박스)
          dayCellContent={(arg) => {
            if (arg.view.type === 'dayGridMonth') {
              const cellDate = new Date(arg.date);
              cellDate.setHours(0, 0, 0, 0);

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              if (!Array.isArray(events)) {
                return arg.dayNumberText.replace("일", "");
              }

              // 하루의 모든 이벤트 가져오기
              // 해당 날짜에 이벤트가 있는지 확인
              const dayEvents = events.filter(e => {
                if (!e.start) return false;
                const eDate = new Date(e.start);
                eDate.setHours(0, 0, 0, 0);
                return eDate.getTime() === cellDate.getTime();
              });

              if (!dayEvents || dayEvents.length === 0) {
                return arg.dayNumberText.replace("일", "");
              }

              // 하루 최대 2개 이벤트만 표시
              const displayEvents = dayEvents.slice(0, 2);

              let backgroundColor = "";
              let textColor = "#1F1F1F"; 

              if (cellDate.getTime() === today.getTime()) {
                backgroundColor = "#F9CBAA"; 
                textColor = "#FFFFFF";
              } else if (cellDate.getTime() < today.getTime()) {
                backgroundColor = "#EAEEE0"; 
                textColor = "#C4C5B7";
              } else {
                backgroundColor = "#BBCEA0";
                textColor = "#FFFFFF";
              }

              return (
                <div
                  className="calendar-day-box"
                  style={{ backgroundColor, color: textColor }}
                >
                  <div className="calendar-date-num">
                    {arg.dayNumberText.replace("일", "")}
                  </div>
                  {displayEvents.map((ev, i) => (
                    <div key={i} className="calendar-event-title">
                      {ev.title}
                    </div>
                ))}
                </div>
              );
            }

            return arg.dayNumberText;
          }}
        />
      </div>
    </div>
  );
};

export default Calendar;
