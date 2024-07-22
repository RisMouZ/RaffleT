import React from "react";
import Navbar from "../components/Navbar";

const dashboard = () => {
    return (
        <div>
            <Navbar />
            <div className="flex justify-center items-center h-screen">
                <h1>Dashboard</h1>
            </div>
        </div>
    );
};

export default dashboard;
