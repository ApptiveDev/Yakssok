// 사이드바 고정 레이아웃 

import { Outlet } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import SidebarLeft from "./components/SidebarLeft";
import { API_BASE_URL } from "./config/api";

export default function AppLayout() {
  const [sidebarEvents, setSidebarEvents] = useState([]);
  const [error, setError] = useState("");

  const token = useMemo(() => localStorage.getItem("access_token"), []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setError("");

        const res = await fetch(`${API_BASE_URL}/appointments/`, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data = await res.json();

        const mapped = data.map((a) => ({
          id: a.id,
          name: a.name,
          invite_link: a.invite_link,
          start: null,
          className: `yakssok-${a.id}`,
        }));

        setSidebarEvents(mapped);
      } catch (e) {
        console.error(e);
        setError("약속 목록 불러오지 못함. (토큰/서버/CORS 확인 필요)");
        setSidebarEvents([]);
      }
    };

    fetchAppointments();
  }, [token]);

  return (
    <div className="appLayout">
      <SidebarLeft events={sidebarEvents} className="sidebar"/>
      <Outlet className="content"/>
    </div>
  );
}
