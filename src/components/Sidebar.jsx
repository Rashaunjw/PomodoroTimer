// Class that holds all functionality for Sidebar and implementation for Bodies into sidebar

import React, { useState } from "react";
import "./Sidebar.css";
import { Body1, Body2, Body3 } from "./Bodies";

export const Sidebar = ({ style, stopTimer, borderColor, setTimerSettings, setIsOpen, timerSettings, selectedMode, savedTasks, setSavedTasks, activeTaskIndex, setActiveTaskIndex}) => {
  const [isVertical, setIsVertical] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [selectedBody, setSelectedBody] = useState("pomodoro");

  if (!selectedMode) {
    console.error("❌ selectedMode is not defined in Sidebar!");
    return <div>Error: Selected mode is missing!</div>; // ✅ Prevent crashing
}

  const handleCloseSidebar = (e) => {
    if (e) e.stopPropagation(); // Prevents event bubbling
    console.log("✅ handleCloseSidebar called - Closing sidebar");
    setIsOpen(false);
    setIsOverlayVisible(false);
    setIsVertical(false); 
  };

  const handleOpenSidebar = (e) => {
    e.stopPropagation();
    setIsOverlayVisible(true);
    setIsVertical(true);
    setSelectedBody("pomodoro");
    stopTimer();
  };

  const handleSelectBody = (body) => {
    console.log(`Switching to: ${body}`);
    setSelectedBody(body);
  }
  if (!timerSettings) {
    console.error("❌ timerSettings is not defined in Sidebar!");
    return <div>Error: Timer settings are missing!</div>; // ✅ Avoid crashing
}
  return (
    <> {/* ✅ React Fragment Wrapping Everything */}
      {/* ✅ Background Overlay */}
      {isOverlayVisible && <div className="overlay" ></div>}

    <div className="sidebar" 
    style={{ 
      position: "absolute",
      right: "8%", 
      top: "60px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
    }}
    onClick={handleOpenSidebar}
>
      <svg
        width="64"
        height="44"
        viewBox="0 0 64 44"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: style.color,           transition: "transform 0.3s ease-in-out", 
        transform: isVertical ? "rotate(90deg)" : "rotate(0deg)",
       }}
      >
        <g id="Group 12">
          <g id="Group 11">
            <path
              id="Line 1"
              d="M2 2H62"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              id="Line 2"
              d="M2 20.3789H62"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              id="Line 3"
              d="M2 42H62"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
      {isOverlayVisible && (
        <div className={`sidebar-box ${isOverlayVisible ? "visible" : ""}`}
        style={{ border: `10px solid ${borderColor}` }}
        onClick={(e) => e.stopPropagation()}>
          <Close onClick={handleCloseSidebar} />
          <Labels setSelectedBody={handleSelectBody} selectedBody={selectedBody}/>

          {selectedBody === "pomodoro" && <Body1 />}
          {selectedBody === "timer" && <Body2 
          borderColor={borderColor} 
          setTimerSettings={setTimerSettings} 
          setSelectedBody={setSelectedBody}
          setIsOpen={setIsOpen}
          handleCloseSidebar={handleCloseSidebar}/>}
          {selectedBody === "tasks" && <Body3 
          borderColor={borderColor} 
          timerSettings={timerSettings} 
          selectedMode={selectedMode} 
          savedTasks={savedTasks}
          setSavedTasks={setSavedTasks}
          setTime={(newTime) => console.log("🕒 Timer Updated:", newTime)}
          setIsOpen={setIsOpen}
          activeTaskIndex={activeTaskIndex}
          setActiveTaskIndex={setActiveTaskIndex}
          />}         
        </div>
      )}
    </div>
    </>
  );
};

export const Labels = ({ setSelectedBody, selectedBody }) => {
  if (!setSelectedBody) {
    console.error("setSelectedBody is undefined!"); // ✅ Debugging log
  }

  return (
      <div className="label">
      <button
        className={`label-button ${selectedBody === "pomodoro" ? "selected" : ""}`}
        onClick={() => setSelectedBody("pomodoro")}
      >
        What is Pomodoro?
      </button>

      <button
        className={`label-button ${selectedBody === "timer" ? "selected" : ""}`}
        onClick={() => setSelectedBody("timer")}
      >
        Custom Timer
      </button>

      <button
        className={`label-button ${selectedBody === "tasks" ? "selected" : ""}`}
        onClick={() => setSelectedBody("tasks")}
      >
        Tasks
      </button>
    </div>

  );
};


export const Close = ({ onClick }) => {
  return (
      <button className="close" onClick={(e) => { 
        e.stopPropagation(); // ✅ Prevents event bubbling
        console.log("Close button clicked"); 
        onClick(e); // ✅ Ensures function is properly executed
      }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="ic24-close">
          <path id="Icon" fillRule="evenodd" clipRule="evenodd" d="M23.0302 20.0004L34.3721 8.65836C35.21 7.82051 35.21 6.46624 34.3721 5.62839C33.5343 4.79054 32.18 4.79054 31.3422 5.62839L20.0002 16.9704L8.65832 5.62839C7.82048 4.79054 6.46622 4.79054 5.62838 5.62839C4.79054 6.46624 4.79054 7.82051 5.62838 8.65836L16.9703 20.0004L5.62838 31.3424C4.79054 32.1803 4.79054 33.5345 5.62838 34.3724C6.04623 34.7903 6.59479 35.0002 7.14335 35.0002C7.69191 35.0002 8.24047 34.7903 8.65832 34.3724L20.0002 23.0304L31.3422 34.3724C31.76 34.7903 32.3086 35.0002 32.8571 35.0002C33.4057 35.0002 33.9543 34.7903 34.3721 34.3724C35.21 33.5345 35.21 32.1803 34.3721 31.3424L23.0302 20.0004Z" fill="black"/>
          </g>
        </svg>
      </button>

      
  );
};