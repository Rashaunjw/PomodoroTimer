// Class to handle pomodoro explantion, custom timer, and custom task inputs.

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Sidebar.css";

export const Body1 = () => {
  return (
      <div className="body-text1">
          <div className="text-wrapper4">The Pomodoro Technique is created by Francesco Cirillo for a more productive
          <br />
          way to work and study. The technique uses a timer to break down work into
          <br />
          intervals, traditionally 25 minutes in length, separated by short breaks. Each
          <br />
          interval is known as a pomodoro, from the Italian word for 'tomato', after the
          <br />
          tomato-shaped kitchen timer that Cirillo used as a university student</div>
          <div className="text-wrapper5">How To Use:</div>
          <div className="text-wrapper6">
            1. Identify a task or task that you need to complete
            <br />
            2. Set a timer for 25 minutes
            <br />
            3. Work on a task with no distractions
            <br />
            4. When the alarm sounds, take a 5-minute break
            <br />
            5. Repeat the process 3 more times
            <br />
            6. Take a longer 30-minute break and start again</div>
      </div>
  );
};


export const Body2 = ({ borderColor, setTimerSettings, setSelectedBody, setIsOpen}) => {
const [inputValues, setInputValues] = useState({ pomodoro: "", shortBreak: "", longBreak: "" });
const [isClearVisible, setIsClearVisible] = useState(false);
const [isOverlayVisible, setIsOverlayVisible] = useState(false);

if (!setSelectedBody) console.error("❌ setSelectedBody is missing!");
if (!setIsOpen) console.error("❌ setIsOpen is missing!");


// Handles input change
const handleInputChange = (e, field) => {
  let value = e.target.value;

  if (!/^\d*$/.test(value)) return;

  let numValue = parseInt(value, 10);
  if (isNaN(numValue)) numValue = "";
  else if (numValue < 1) numValue = 1;
  else if (numValue > 60) numValue = 60;


  setInputValues((prevValues) => {
      const updatedValues = { ...prevValues, [field]: numValue.toString() };
      setIsClearVisible(Object.values(updatedValues).some((val) => val !== ""));
      return updatedValues;
      });

  };

  const handleSave = () => {
    console.log("✅ Save button clicked!");

    setTimerSettings({
        pomodoro: parseInt(inputValues.pomodoro, 10) * 60,
        shortBreak: parseInt(inputValues.shortBreak, 10) * 60,
        longBreak: parseInt(inputValues.longBreak, 10) * 60,
    });

    console.log("✅ Custom timer saved:", {
        pomodoro: parseInt(inputValues.pomodoro, 10) * 60,
        shortBreak: parseInt(inputValues.shortBreak, 10) * 60,
        longBreak: parseInt(inputValues.longBreak, 10) * 60,
    });

    toast.success("Custom timer has been saved!", {
      position: "top-right",
      autoClose: 3000, // ✅ Disappears after 3 seconds
  });

};

// ✅ Clears all inputs properly
const handleClear = () => {
  console.log("Clear button clicked - resetting fields!"); // ✅ Debug log
  setInputValues({ pomodoro: "", shortBreak: "", longBreak: "" });
  setIsClearVisible(false);
};

  // ✅ Prevents entering non-numeric characters in input fields
  const preventNonNumeric = (e) => {
      if (e.key === "e" || e.key === "-" || e.key === "+") {
        e.preventDefault();
      }
    };

  const getTextColor = () => {
    return borderColor?.toLowerCase() === "#ffcd74" ? "black" : "white";
  };

  return (
    <div className="body-text2">
      {/* Pomodoro Column */}
      <div className="column">
        <div className="text-wrapper7">Pomodoro</div>
        <div className="box">
          <input
            className="rectangle"
            type="text"
            style={{ borderColor: borderColor }}
            placeholder=""
            value={inputValues.pomodoro}
            onChange={(e) => handleInputChange(e, "pomodoro")}
            onKeyDown={preventNonNumeric}
          />
        </div>
        <div className="text-wrapper9">minutes</div>
      </div>

      {/* Short Break Column */}
      <div className="column">
        <div className="text-wrapper7">Short Break</div>
        <div className="box">
          <input
            className="rectangle"
            type="text"
            style={{ borderColor: borderColor }}
            placeholder=""
            value={inputValues.shortBreak}
            onChange={(e) => handleInputChange(e, "shortBreak")}
            onKeyDown={preventNonNumeric}
          />
        </div>
        <div className="text-wrapper9">minutes</div>
      </div>

      {/* Long Break Column */}
      <div className="column">
        <div className="text-wrapper7">Long Break</div>
        <div className="box">
          <input
            className="rectangle"
            type="text"
            style={{ borderColor: borderColor }}
            placeholder=""
            value={inputValues.longBreak}
            onChange={(e) => handleInputChange(e, "longBreak")}
            onKeyDown={preventNonNumeric}
          />
        </div>
        <div className="text-wrapper9">minutes</div>
      </div>

      {/* Save & Conditional Clear Buttons */}
      <div className="button-container">
        {isClearVisible && (
          <button className="clear-button" onClick={handleClear}>Clear</button>
        )}
        <button className="save-button" onClick={handleSave} style={{ backgroundColor: borderColor, color: getTextColor() }}>Save</button>
      </div>
    </div>
  );
};

export const Body3 = ({ borderColor, timerSettings, selectedMode, setTime, savedTasks, setSavedTasks, setIsOpen, activeTaskIndex, setActiveTaskIndex }) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(activeTaskIndex || 0);
  // Sync tasks with savedTasks when savedTasks changes from outside
useEffect(() => {
  if (Array.isArray(savedTasks) && savedTasks.length > 0) {
    setTasks(savedTasks);
  }
}, [savedTasks]);

  
  // Initialize tasks from savedTasks prop instead of creating a separate state
  const [tasks, setTasks] = useState(() => {
    // Make sure we have a valid savedTasks array
    if (Array.isArray(savedTasks) && savedTasks.length > 0) {
      return [...savedTasks];
    }
    return [
      { name: "", pomodoros: "" },
      { name: "", pomodoros: "" },
      { name: "", pomodoros: "" },
    ];
  });

  // Sync tasks with savedTasks when savedTasks changes from outside
  useEffect(() => {
    if (Array.isArray(savedTasks) && savedTasks.length > 0) {
      setTasks(savedTasks);
    }
  }, [savedTasks]);

  useEffect(() => {
    if (!setTime || !timerSettings || !selectedMode) {
        console.error("❌ setTime or timerSettings is not defined in Body3!");
        return;
    }

    setTime(timerSettings[selectedMode]); // ✅ Apply new time from settings
  }, [timerSettings, selectedMode, setTime]);

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = tasks.map((task, i) =>
        i === index ? { ...task, [field]: value } : task
    );
    setTasks(updatedTasks);
  };

  const handleClear = () => {
    // Create updated tasks with the current one cleared
    const updatedTasks = tasks.map((task, index) =>
        index === currentTaskIndex ? { name: "", pomodoros: "" } : task
    );
    
    // Update local state
    setTasks(updatedTasks);
    
    // Update parent state to ensure persistence is cleared too
    if (setSavedTasks) {
      setSavedTasks(updatedTasks);
      
      // Update localStorage to permanently remove the task
      localStorage.setItem("savedTasks", JSON.stringify(updatedTasks));
      console.log("🗑️ Cleared task from localStorage:", updatedTasks);
    }
    
    // Notify user
    toast.info("Task cleared!", {
        position: "top-right",
        autoClose: 2000,
    });
  };

  const handleSave = () => {
    if (!tasks[currentTaskIndex].name) {
        console.error("❌ Cannot save an empty task!");
        toast.error("Please enter a task name before saving.");
        return;
    }

    if (!setSavedTasks) {
      console.error("❌ setSavedTasks is not passed to Body3!");
      return;
    }
    
    // Update the parent component's state with our current tasks
    setSavedTasks([...tasks]);
    
    // Store in localStorage for persistence
    localStorage.setItem("savedTasks", JSON.stringify(tasks));
    
    // Update the active task index to the current one
    if (setActiveTaskIndex) {
      setActiveTaskIndex(currentTaskIndex);
      localStorage.setItem("lastActiveTaskIndex", currentTaskIndex.toString());
    }
    
    console.log("✅ Saved tasks:", tasks);
    console.log("✅ Active task index set to:", currentTaskIndex);

    toast.success("Task has been saved!", {
        position: "top-right",
        autoClose: 3000,
    });
  };

  const handlePomodoroChange = (direction) => {
    setTasks((prevTasks) =>
        prevTasks.map((task, index) =>
            index === currentTaskIndex
                ? {
                      ...task,
                      pomodoros: direction === "up"
                          ? Math.min(parseInt(task.pomodoros || 0) + 1, 10).toString()
                          : Math.max(parseInt(task.pomodoros || 1) - 1, 1).toString(),
                  }
                : task
        )
    );
  };

  const handleTaskClick = (taskIndex) => {
    setCurrentTaskIndex(taskIndex);
    // Update the active task index in the parent component
    if (setActiveTaskIndex) {
      setActiveTaskIndex(taskIndex);
    }
    console.log("Switched to task:", taskIndex, tasks[taskIndex]);
  };

  const getTextColor = (index) => {
    return currentTaskIndex === index
        ? borderColor?.toLowerCase() === "#ffcd74"
            ? "black"
            : "white"
        : "black"; // Default for unselected buttons
  };

  return (
    <div className="body-text3">
      {/* ✅ Task Selection Buttons */}
      <div className="task-buttons">
        {tasks.map((task, index) => (
          <button
              key={index}
              className={`task-button ${currentTaskIndex === index ? "selected" : ""}`}
              onClick={() => handleTaskClick(index)}
              style={{
                  border: currentTaskIndex === index ? `3px solid ${borderColor}` : "3px solid transparent",
                  backgroundColor: currentTaskIndex === index ? borderColor : "transparent",
                  color: getTextColor(index),
              }}
          >
              Task #{index + 1}
          </button>
        ))}
      </div>
  
      {/* ✅ Task Input Field */}
      <div className="text-wrapper11">What are you working on?</div>
      <input
        type="text"
        className="task-input"
        style={{ borderColor: borderColor }}
        value={tasks[currentTaskIndex]?.name || ""}
        onChange={(e) => handleTaskChange(currentTaskIndex, "name", e.target.value)}
      />
  
      {/* ✅ Pomodoro Selection */}
      <div className="text-wrapper13">How many Pomodoros?</div>
      <div className="pomodoro-selector">
        <input
          className="pomodoro-input"
          type="text"
          placeholder=""
          value={tasks[currentTaskIndex]?.pomodoros || ""}
          readOnly
          style={{ border: `3px solid ${borderColor}` }}
        />
        <div className="arrow-buttons">
          <button onClick={() => handlePomodoroChange("up")} className="arrow-up">
            <svg width="38" height="22" viewBox="0 0 38 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M35.6665 19.9997L18.9998 3.33301L2.33317 19.9997" stroke="black" strokeWidth="4"/>
            </svg>
          </button>
          <button onClick={() => handlePomodoroChange("down")} className="arrow-down">
            <svg width="38" height="22" viewBox="0 0 38 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M35.6665 2.00033L18.9998 18.667L2.33317 2.00033" stroke="black" strokeWidth="4"/>
            </svg>
          </button>
          <button 
            className="save-button" 
            onClick={handleSave}     
            style={{ 
              backgroundColor: borderColor, 
              color: borderColor?.toLowerCase() === "#ffcd74" ? "black" : "white",
            }}
          >
            Save
          </button>
          <button 
            className="cancel-button" 
            onClick={handleClear}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};