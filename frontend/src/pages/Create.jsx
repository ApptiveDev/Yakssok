import React, { useState } from 'react';
import './Create.css';
import { useNavigate } from "react-router-dom";
import SidebarLeft from '../components/SidebarLeft';
import logoImage from "../assets/createLogo.png";

const Create = () => {
    const navigate = useNavigate();

    const sampleEvents = []; 
    const [title, setTitle] = useState(""); 

    return (
        <div className='create-container'>
            {/* <SidebarLeft events={sampleEvents} /> */}
            <main className='main-content'>
                <img src={logoImage} alt="logoImage" className='logoImage'/>
                <br/>
                <form>
                    <p className='request-text'>새로운 약속의 이름을 알려주세요</p>
                    <p className='input-index'>약속 이름</p>
                    <input
                        className="title-input"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="새로운 약속 이름"
                    />
                    <p className='request-text'>약속에 몇명의 인원이<br/>참여하나요?</p>
                    <div className='number-input'>
                        <span className='num-index-1'>참여인원</span>
                        <input
                            type="number"
                            className="number-box"
                            min="0"
                            max="10"
                        />
                        <span className='num-index-2'>명</span>
                    </div>
                    <p className='request-text'>어느 기간 안에서<br/>약속을 정하면 좋을까요?</p>
                </form>
            </main>
            
        </div>
    );
};

export default Create;
