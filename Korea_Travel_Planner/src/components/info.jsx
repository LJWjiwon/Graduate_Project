import React from "react";
// import { ArrowLeft01Sharp } from "./ArrowLeft01Sharp";
// import { User } from "./User";
// import addCircle from "./add-circle.svg";
// import image3 from "./image-3.png";
// import image from "./image.svg";
import "./info.css";
// import vector from "./vector.svg";

function Info() {
    return (
        <div className="screen">
            <div className="frame">
                <div className="user-wrapper">
                    {/* <User className="user-instance" /> */}
                </div>

                {/* <ArrowLeft01Sharp className="arrow-left-sharp" /> */}
                <div className="search-bar">
                    <div className="group">
                        <div className="text-wrapper">Search anything....</div>
                    </div>

                    <div className="iconsax-linear-wrapper">
                        <div className="iconsax-linear">
                            {/* <img className="vector" alt="Vector" src={vector} /> */}
                        </div>
                    </div>
                </div>
            </div>

            <div className="div">
                {/* <img className="image" alt="Image" src={image3} /> */}

                <div className="div-wrapper">
                    <div className="text-wrapper-2">부산 씨라이프 아쿠아리움</div>
                </div>

                <div className="frame-2">
                    <div className="text-wrapper-3">
                        블라블라
                        <br />
                        블라
                        <br />
                        블라ㅏㅏ
                    </div>
                </div>
            </div>

            <div className="frame-3">
                <div className="frame-4">
                    {/* <img className="add-circle" alt="Add circle" src={addCircle} /> */}

                    <div className="frame-5">
                        <div className="text-wrapper-4">일정 추가</div>
                    </div>
                </div>

                <div className="frame-6">
                    {/* <img className="add-circle" alt="Add circle" src={image} /> */}

                    <div className="frame-5">
                        <div className="text-wrapper-4">일정 관리</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Info;
