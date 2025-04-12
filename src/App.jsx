// Main class to handle website functionality.
// Implements Bodies into Sidebar and then Header, Sidebar, and TimerBox components into whole website


import React, { useState, useEffect } from "react";
import { Header } from "./components/Header.jsx";
import { TimerWithButtons } from "./TimerBox.jsx";
import { Sidebar } from "./components/Sidebar.jsx"; 
import { Body1, Body2, Body3 } from "./components/Bodies.jsx";
import { ToastContainer } from "react-toastify";

import "./App.css";


function App() {
  // Load tasks from localStorage on initial load
  const [savedTasks, setSavedTasks] = useState(() => {
    try {
      const storedTasks = localStorage.getItem("savedTasks");
      return storedTasks ? JSON.parse(storedTasks) : [
        { name: "", pomodoros: "" }, 
        { name: "", pomodoros: "" }, 
        { name: "", pomodoros: "" }
      ];
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error);
      return [
        { name: "", pomodoros: "" }, 
        { name: "", pomodoros: "" }, 
        { name: "", pomodoros: "" }
      ];
    }
  });

  // Basic UI state
  const [borderColor, setBorderColor] = useState("#d38c2b");
  const [backgroundColor, setBackgroundColor] = useState("#ffcd74"); // Default background color
  const [textColor, setTextColor] = useState("#000000");
  const [isRunning, setIsRunning] = useState(false);
  const [selectedBody, setSelectedBody] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState("pomodoro"); // ✅ Default to "pomodoro"
  
  // Load timer settings from localStorage if available
  const [timerSettings, setTimerSettings] = useState({
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  });

  // Keep track of the last active task index
  const [activeTaskIndex, setActiveTaskIndex] = useState(() => {
    try {
      const lastActiveIndex = localStorage.getItem("lastActiveTaskIndex");
      return lastActiveIndex ? parseInt(lastActiveIndex, 10) : 0;
    } catch (error) {
      console.error("Error loading last active task index:", error);
      return 0;
    }
  });

  const [time, setTime] = useState(timerSettings.pomodoro);

  // Effect to handle page refresh and ensure pomodoro mode
  useEffect(() => {
    // This will run once on component mount (after page refresh)
    console.log("App initialized/refreshed - ensuring pomodoro mode");
    
    // Force reset to pomodoro mode on every refresh
    setSelectedMode("pomodoro");
    setBackgroundColor("#FFCD74");
    setTextColor("#000000");
    setBorderColor("#d38c2b");
    
    // Add beforeunload event listener
    const handleBeforeUnload = () => {
      localStorage.setItem('refreshToPomodoro', 'true');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Check if we refreshed
    const shouldResetToPomodoro = localStorage.getItem('refreshToPomodoro') === 'true';
    if (shouldResetToPomodoro) {
      localStorage.removeItem('refreshToPomodoro');
    }
    
    // Clean up function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Empty dependency array so it only runs once on mount
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    try {
      if (savedTasks && savedTasks.length > 0) {
        localStorage.setItem("savedTasks", JSON.stringify(savedTasks));
        console.log("💾 Persisting saved tasks:", savedTasks);
      }
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  }, [savedTasks]);
  
  // Save active task index to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("lastActiveTaskIndex", activeTaskIndex.toString());
      console.log("💾 Persisting active task index:", activeTaskIndex);
    } catch (error) {
      console.error("Error saving active task index:", error);
    }
  }, [activeTaskIndex]);

  const changeColors = (bgColor, text, newBorderColor) => {
    setBackgroundColor(bgColor);
    setTextColor(text);
    setBorderColor(newBorderColor);
  };

  const stopTimer = () => {
    setIsRunning(false); // ✅ Stop the timer when sidebar is clicked
  };

  return (
    <div
      style={{
        backgroundColor: backgroundColor, // Dynamic background color
        minHeight: "100vh", // Ensure full-screen height
        margin: 0, // Remove default margin
        transition: "background-color 0.5s ease", // Smooth transition for color change
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <ToastContainer position="top-center" autoClose={3000} />
        <Header 
          style={{ color: textColor }} 
        />
        <Sidebar 
          borderColor={borderColor} 
          style={{ color: textColor }} 
          stopTimer={stopTimer} 
          setIsOpen={setIsOpen} 
          isOpen={isOpen} 
          selectedBody={selectedBody}
          setSelectedBody={setSelectedBody}
          setTimerSettings={setTimerSettings}
          timerSettings={timerSettings}  
          selectedMode={selectedMode} 
          setSelectedMode={setSelectedMode}
          savedTasks={savedTasks}
          setSavedTasks={setSavedTasks}
          setTime={setTime}
          activeTaskIndex={activeTaskIndex}
          setActiveTaskIndex={setActiveTaskIndex}
        />
      </div>
      
      {/* Task Container */}
      <div className="task-container">
        {/* Task info will be displayed by the TimerWithButtons component */}
      </div>
      
      <TimerWithButtons 
        onChangeColors={(bgColor, text, border) => changeColors(bgColor, text, border)} 
        borderColor={borderColor}
        stopTimer={stopTimer}
        timerSettings={timerSettings}
        savedTasks={savedTasks}
        activeTaskIndex={activeTaskIndex}
        setSavedTasks={setSavedTasks}
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
      />
      {selectedBody === "Body1" && <Body1 />}
      {selectedBody === "Body2" && (
        <Body2 
          setTimerSettings={setTimerSettings} 
          setSelectedBody={setSelectedBody} 
          setIsOpen={setIsOpen} 
        />
      )}
      {selectedBody === "Body3" && (
        <Body3 
          timerSettings={timerSettings} 
          selectedMode={selectedMode}
          savedTasks={savedTasks}
          setSavedTasks={setSavedTasks}
          setTime={setTime}
          setIsOpen={setIsOpen}
          activeTaskIndex={activeTaskIndex}
          setActiveTaskIndex={setActiveTaskIndex}
        />
      )}
    </div>
  );
}

export default App;