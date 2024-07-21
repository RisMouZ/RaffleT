import React from "react";
import Navbar from "../components/Navbar";

const createRaffle = () => {
    return (
        <div>
            {" "}
            <div>
                <Navbar />
                <div className="flex justify-center items-center h-screen">
                    <h1>Create Raffle</h1>
                </div>
            </div>
        </div>
    );
};

export default createRaffle;
