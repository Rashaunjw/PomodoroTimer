// class to store lone Pomodoro Timer header

import React from "react";
import "./Header.css";

export const Header = ({ style }) => {
    return (
        <div className="header" >
            <div className="text-wrapper" style={{ color: style.color }}>Pomodoro Timer</div>
        </div>
    );
};
