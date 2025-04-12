// Class to handle main screen functionality

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TimerBox.css";
import Play from "./components/images/Play.svg";
import Refresh from "./components/images/Refresh.svg";
import Stop from "./components/images/Stop.svg";
import sound1 from "/sounds/sound1.mp3";
import sound2 from "/sounds/sound2.mp3";

export const TimerWithButtons = ({ 
  onChangeColors, 
  borderColor, 
  timerSettings, 
  savedTasks, 
  activeTaskIndex = 0, 
  setSavedTasks, 
  selectedMode,
  setSelectedMode 
}) => {
  
    // Basic timer state
    const [displayTime, setDisplayTime] = useState(25 * 60); // Just for display
    const [isRunning, setIsRunning] = useState(false);
    
    // Reference to actual timer data
    const timerData = useRef({
        endTime: null,        // When timer should finish (timestamp)
        duration: 25 * 60,    // How long timer should run (seconds)
        mode: "pomodoro",     // Current timer mode
        interval: null        // Store the interval reference
    });

    // Get current task
    const currentTask = savedTasks && savedTasks.length > activeTaskIndex 
        ? savedTasks[activeTaskIndex] 
        : { name: "", pomodoros: "" };
    
    // Only show boxes if there's actual content/user input 
    const showTaskBox = currentTask?.name && currentTask.name.trim() !== "";
    const showPomodoroBox = currentTask?.pomodoros && parseInt(currentTask.pomodoros) > 0;

    // Format time for display
    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Initialization and browser reload handling
    useEffect(() => {
        // Check for active timer in storage
        const storedEndTime = localStorage.getItem('pomodoroEndTime');
        const storedDuration = localStorage.getItem('pomodoroDuration');
        const storedMode = localStorage.getItem('pomodoroMode');
        
        if (storedEndTime && storedDuration && storedMode) {
            const endTime = parseInt(storedEndTime, 10);
            const duration = parseInt(storedDuration, 10);
            const now = Date.now();
            
            // Calculate remaining time
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            
            if (remaining > 0) {
                // Timer still has time left
                console.log("Resuming saved timer with", remaining, "seconds left");
                
                // Update timer data
                timerData.current = {
                    endTime: endTime,
                    duration: duration,
                    mode: storedMode,
                    interval: null
                };
                
                // Update display and state
                setDisplayTime(remaining);
                setIsRunning(true);
                
                // Also sync UI with stored mode
                if (setSelectedMode) {
                    setSelectedMode(storedMode);
                }
                
                // Update UI colors
                if (storedMode === "pomodoro") {
                    onChangeColors("#FFCD74", "#000000", "#d38c2b");
                } else if (storedMode === "shortBreak") {
                    onChangeColors("#FF7251", "#ffffff", "#9B294A");
                } else if (storedMode === "longBreak") {
                    onChangeColors("#9B294A", "#FFcd74", "#FFCD74");
                }
                
                // Start the timer
                startTimerInterval();
            } else {
                // Timer would have expired
                completeTimer(storedMode);
                clearTimerStorage();
            }
        } else {
            // Default to pomodoro mode
            resetToPomodoro();
        }
        
        // Cleanup on unmount
        return () => {
            if (timerData.current.interval) {
                clearInterval(timerData.current.interval);
            }
        };
    }, []);
    
    // Handle visibility change (for sleep/wake)
    useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
              console.log("Page visible again, checking timer status");
              
              // Check if we have a saved mode in localStorage
              const savedMode = localStorage.getItem('pomodoroMode');
              
              // Only process if we have saved timer data
              if (savedMode) {
                  // Restore the correct mode
                  if (setSelectedMode) {
                      setSelectedMode(savedMode);
                  }
                  
                  // Also restore the correct colors based on mode
                  if (savedMode === "pomodoro") {
                      onChangeColors("#FFCD74", "#000000", "#d38c2b");
                  } else if (savedMode === "shortBreak") {
                      onChangeColors("#FF7251", "#ffffff", "#9B294A");
                  } else if (savedMode === "longBreak") {
                      onChangeColors("#9B294A", "#FFcd74", "#FFCD74");
                  }
                  
                  // Check timer status if it was running
                  const storedEndTime = localStorage.getItem('pomodoroEndTime');
                  const storedDuration = localStorage.getItem('pomodoroDuration');
                  
                  if (storedEndTime && storedDuration && isRunning) {
                      const now = Date.now();
                      const endTime = parseInt(storedEndTime, 10);
                      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
                      
                      console.log("Timer check: mode=", savedMode,
                                  "endTime=", new Date(endTime).toLocaleTimeString(), 
                                  "now=", new Date(now).toLocaleTimeString(),
                                  "remaining=", remaining);
                      
                      if (remaining <= 0) {
                          // Timer should have completed
                          completeTimer(savedMode);
                          clearTimerStorage();
                      } else {
                          // Timer still running, update display
                          setDisplayTime(remaining);
                          
                          // Restart timer interval (the old one might have been paused)
                          if (timerData.current.interval) {
                              clearInterval(timerData.current.interval);
                          }
                          startTimerInterval();
                      }
                  }
              }
          } else {
              // Page is becoming hidden (computer going to sleep, tab switching, etc.)
              // Save the current mode to localStorage if timer is running
              if (isRunning && selectedMode) {
                  localStorage.setItem('pomodoroMode', selectedMode);
                  console.log("Saved current mode before sleep:", selectedMode);
              }
          }
      };
      
      // Listen for visibility changes
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [isRunning, selectedMode]);

    // Start the interval that updates timer display
    const startTimerInterval = () => {
        // Clear any existing interval
        if (timerData.current.interval) {
            clearInterval(timerData.current.interval);
        }
        
        // Create new interval
        timerData.current.interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((timerData.current.endTime - now) / 1000));
            
            setDisplayTime(remaining);
            
            if (remaining <= 0) {
                completeTimer(timerData.current.mode);
                clearTimerStorage();
            }
        }, 1000);
    };
    
    // Handle timer completion
    const completeTimer = (mode) => {
        // Clear interval
        if (timerData.current.interval) {
            clearInterval(timerData.current.interval);
            timerData.current.interval = null;
        }
        
        // Reset state
        setIsRunning(false);
        setDisplayTime(0);
        
        // Play notification sound
        playNotificationSound();
        
        // Show notification
        toast.success("Timer completed!", {
            position: "top-right",
            autoClose: 3000,
        });
        
        // Decrease pomodoro count if needed
        if (mode === "pomodoro") {
            decreasePomodoroCount();
        }
    };
    
    // Clear timer data from storage
    const clearTimerStorage = () => {
        localStorage.removeItem('pomodoroEndTime');
        localStorage.removeItem('pomodoroDuration');
        localStorage.removeItem('pomodoroMode');
    };
    
    // Reset to default pomodoro mode
    const resetToPomodoro = () => {
        // Stop any running timer
        if (timerData.current.interval) {
            clearInterval(timerData.current.interval);
            timerData.current.interval = null;
        }
        
        // Reset timer data
        timerData.current.endTime = null;
        timerData.current.duration = 25 * 60;
        timerData.current.mode = "pomodoro";
        
        // Update UI
        setDisplayTime(25 * 60);
        setIsRunning(false);
        
        // Switch to pomodoro mode
        if (setSelectedMode) {
            setSelectedMode("pomodoro");
        }
        
        // Set colors
        onChangeColors("#FFCD74", "#000000", "#d38c2b");
        
        // Clear storage
        clearTimerStorage();
    };
    
    // Handle play button click
    const handlePlay = () => {
      if (isRunning) return; // Already running
      
      // Calculate end time
      const duration = displayTime;
      const endTime = Date.now() + (duration * 1000);
      
      // Update timer data
      timerData.current = {
          ...timerData.current,
          endTime: endTime,
          duration: duration,
          mode: selectedMode  // Store current mode
      };
      
      // Store in localStorage for sleep resilience
      localStorage.setItem('pomodoroEndTime', endTime.toString());
      localStorage.setItem('pomodoroDuration', duration.toString());
      localStorage.setItem('pomodoroMode', selectedMode);  // Store mode in localStorage
      
      // Update UI
      setIsRunning(true);
      
      // Start interval
      startTimerInterval();
      
      console.log(`Timer started - mode: ${selectedMode}, duration: ${formatTime(duration)}, end: ${new Date(endTime).toLocaleTimeString()}`);
  };
    
    // Handle stop button click
    const handleStop = () => {
        if (!isRunning) return; // Not running
        
        // Clear interval
        if (timerData.current.interval) {
            clearInterval(timerData.current.interval);
            timerData.current.interval = null;
        }
        
        // Calculate remaining time
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((timerData.current.endTime - now) / 1000));
        
        // Update UI
        setIsRunning(false);
        setDisplayTime(remaining);
        
        // Clear storage
        clearTimerStorage();
        
        console.log(`Timer stopped with ${formatTime(remaining)} remaining`);
    };
    
    // Handle refresh button click
    const handleRefresh = () => {
      // Stop any running timer
      if (timerData.current.interval) {
          clearInterval(timerData.current.interval);
          timerData.current.interval = null;
      }
      
      setIsRunning(false);
      
      // Reset to the current mode's saved time (not original pomodoro)
      let resetTime;
      
      if (selectedMode === "pomodoro") {
          resetTime = timerSettings.pomodoro;
      } else if (selectedMode === "shortBreak") {
          resetTime = timerSettings.shortBreak;
      } else if (selectedMode === "longBreak") {
          resetTime = timerSettings.longBreak;
      } else {
          // Default fallback
          resetTime = timerSettings.pomodoro;
      }
      
      // Update UI
      setDisplayTime(resetTime);
      
      // Update timer data
      timerData.current.endTime = null;
      timerData.current.duration = resetTime;
      
      // Clear any stored timer data
      clearTimerStorage();
      
      console.log(`Timer reset to current mode (${selectedMode}): ${formatTime(resetTime)}`);
  };
    
    // Handle mode change
    const handleModeChange = (mode) => {
        // Stop any running timer
        if (isRunning) {
            if (timerData.current.interval) {
                clearInterval(timerData.current.interval);
                timerData.current.interval = null;
            }
            setIsRunning(false);
        }
        
        // Clear storage
        clearTimerStorage();
        
        // Update mode
        if (setSelectedMode) {
            setSelectedMode(mode);
        }
        
        // Set time based on mode
        let newTime;
        if (mode === "pomodoro") {
            newTime = timerSettings.pomodoro;
        } else if (mode === "shortBreak") {
            newTime = timerSettings.shortBreak;
        } else if (mode === "longBreak") {
            newTime = timerSettings.longBreak;
        }
        
        // Update timer data
        timerData.current.duration = newTime;
        timerData.current.endTime = null;
        timerData.current.mode = mode;
        
        // Update UI
        setDisplayTime(newTime);
        
        console.log(`Switched to ${mode} mode: ${formatTime(newTime)}`);
    };
    
    // Function to play notification sound
    const playNotificationSound = () => {
        try {
            const audio1 = new Audio(sound1);
            const audio2 = new Audio(sound2);
            
            // Play first sound
            audio1.play();
            
            // Play second sound after a delay
            setTimeout(() => {
                audio2.play();
            }, 2500);
            
            audio1.addEventListener("error", (e) => console.error("Error playing sound 1:", e));
            audio2.addEventListener("error", (e) => console.error("Error playing sound 2:", e));
        } catch (error) {
            console.error("Error playing notification sound:", error);
        }
    };
    
    // Function to decrease pomodoro count
    const decreasePomodoroCount = () => {
        // Only decrease in pomodoro mode
        if (timerData.current.mode !== "pomodoro") return;
        
        if (savedTasks && savedTasks.length > activeTaskIndex) {
            const currentTask = savedTasks[activeTaskIndex];
            
            // Only decrease if pomodoro count is valid and greater than 0
            if (currentTask && currentTask.pomodoros && parseInt(currentTask.pomodoros) > 0) {
                // Create a copy of savedTasks
                const updatedTasks = [...savedTasks];
                
                // Decrease the pomodoro count by 1
                const newCount = parseInt(currentTask.pomodoros) - 1;
                updatedTasks[activeTaskIndex] = {
                    ...currentTask,
                    pomodoros: newCount.toString()
                };
                
                // Update the savedTasks state in parent component
                setSavedTasks(updatedTasks);
                
                // Update localStorage to persist the change
                localStorage.setItem("savedTasks", JSON.stringify(updatedTasks));
                
                console.log(`Decreased pomodoro count for task "${currentTask.name}" to ${newCount}`);
                
                // Show notification of completed pomodoro
                toast.success(`Completed 1 pomodoro for "${currentTask.name}"! ${newCount} remaining.`, {
                    position: "top-right",
                    autoClose: 4000,
                });
            }
        }
    };

    // Shared box style for consistency
    const boxStyle = {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        border: `4px solid ${borderColor}`,
        borderRadius: '20px',
        backgroundColor: '#ffffee',
        width: '280px',
        padding: '8px 15px',
        boxSizing: 'border-box',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
        fontFamily: "'Baloo 2', Helvetica",
        zIndex: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };
 
    // timer box, play, pause, and refresh buttons.
    return (
        <div className="timer-container"> 
            {/* Task Display Box */}
            {showTaskBox && (
                <div 
                    className="task-box"
                    style={{ 
                        borderColor: borderColor,
                    }}
                >
                    <div>
                        Task: {currentTask.name}
                    </div>
                </div>
            )}
            
            {/* Main Timer Box */}
            <div className="tbox" style={{ 
                border: `10px solid ${borderColor}`, 
                top: '20px',
                position: 'relative',
                marginTop: '30px'
            }}>
                <div className="button-column-left"> 
                    <div className="play-icon" onClick={handlePlay}>
                        <img className="play-button" alt="Play" src={Play} />
                    </div>
                    <div className="stop-icon" onClick={handleStop}>
                        <img className="stop-button" alt="Stop" src={Stop} />
                    </div>
                    <div className="refresh-icon" onClick={handleRefresh}>
                        <img className="refresh-button" alt="Refresh" src={Refresh} />
                    </div>
                </div>
                
                <div className="timer">
                    <div className="text-wrapper">{formatTime(displayTime)}</div>
                </div>
                
                <div className="button-column-right">
                    <div className="pbox"
                        onClick={() => { 
                            onChangeColors("#FFCD74", "#000000", "#d38c2b");
                            handleModeChange("pomodoro");
                        }}>
                        <p className="text-content">Pomodoro</p>
                    </div>
                    <div className="sbox"
                        onClick={() => { 
                            onChangeColors("#FF7251", "#ffffff", "#9B294A");
                            handleModeChange("shortBreak");
                        }}>
                        <p className="text-content2">Short Break</p>
                    </div>
                    <div className="lbox"
                        onClick={() => { 
                            onChangeColors("#9B294A", "#FFcd74", "#FFCD74");
                            handleModeChange("longBreak"); 
                        }}>
                        <p className="text-content2">Long Break</p>
                    </div>
                </div>
            </div>
            
            {/* Pomodoro Count Box */}
            {showPomodoroBox && (
                <div 
                    className="pomodoro-box"
                    style={{ 
                        borderColor: borderColor,
                    }}
                >
                    <div>
                        Pomodoros: {currentTask.pomodoros}
                    </div>
                </div>
            )}
        </div>
    );
};