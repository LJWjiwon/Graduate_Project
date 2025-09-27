import React from "react";
// import { ArrowLeft01Sharp } from "./ArrowLeft01Sharp";
// import { User } from "./User";
import "./search.css";
// import vector from "./vector.svg";

function Search() {
    return (
        <div className="div-wrapper">
            <div className="frame">
                <div className="user-wrapper">
                    {/* <User className="user-instance" /> */}
                </div>

                {/* <ArrowLeft01Sharp className="arrow-left-sharp" /> */}
                <div className="search-bar">
                    <div className="group">
                        <div className="text-wrapper">반려동물</div>
                    </div>

                    <div className="iconsax-linear-wrapper">
                        <div className="iconsax-linear">
                            {/* <img className="vector" alt="Vector" src={vector} /> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;
