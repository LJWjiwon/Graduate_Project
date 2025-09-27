import React from "react";
// import { ArrowDown01Round } from "./ArrowDown01Round";
// import { ArrowLeft01Sharp } from "./ArrowLeft01Sharp";
// import { Delete02 } from "./Delete02";
// import { IconComponentNode } from "./IconComponentNode";
// import { Location01 } from "./Location01";
// import { Navigation01 } from "./Navigation01";
// import { Note } from "./Note";
// import { NoteAdd } from "./NoteAdd";
// import { User } from "./User";
// import image4 from "./image-4.png";
import "./plan.css";
// import vector from "./vector.svg";

function Plan() {
    return (
        <div className="screen">
            <div className="frame">
                <div className="div-wrapper">
                    <div className="text-wrapper">부산 반려동물 여행 계획</div>
                </div>

                <div className="user-wrapper">
                    {/* <User className="icon-instance-node" /> */}
                </div>

                {/* <ArrowLeft01Sharp className="arrow-left-sharp" /> */}
            </div>

            <div className="div">
                <div className="frame-2">
                    {/* <img className="image" alt="Image" src={image4} /> */}

                    <div className="frame-3">
                        {/* <Location01 className="icon-instance-node" /> */}
                        <div className="frame-4">
                            <div className="text-wrapper-2">부산광역시 북구</div>
                        </div>

                        {/* <ArrowDown01Round className="icon-instance-node" /> */}
                    </div>

                    <div className="search-bar">
                        <div className="group">
                            <div className="text-wrapper-3">Search place....</div>
                        </div>

                        <div className="iconsax-linear-wrapper">
                            <div className="iconsax-linear">
                                {/* <img className="vector" alt="Vector" src={vector} /> */}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="frame-5">
                    <div className="frame-6">
                        {/* <ArrowLeft01Sharp className="arrow-left-01-sharp" /> */}
                        <div className="frame-4">
                            <div className="text-wrapper-4">1일차</div>
                        </div>

                        {/* <IconComponentNode className="arrow-left-01-sharp" /> */}
                    </div>

                    <div className="frame-7">
                        <div className="frame-wrapper">
                            <div className="frame-8">
                                <div className="text-wrapper-5">저장</div>
                            </div>
                        </div>

                        <div className="frame-9">
                            <div className="frame-10">
                                <div className="group-2">
                                    <div className="frame-11">
                                        <div className="text-wrapper-6">부산 아쿠아리움</div>
                                    </div>

                                    <div className="frame-12">
                                        <div className="text-wrapper-6">{""}</div>
                                    </div>
                                </div>

                                <div className="frame-13">
                                    {/* <Note /> */}
                                    <div className="frame-4">
                                        <div className="text-wrapper-7">아쿠아리움. 근처 밥집</div>
                                    </div>
                                </div>
                            </div>

                            <div className="frame-14">
                                <div className="frame-15">
                                    <div className="text-wrapper-8">AM 9:00</div>
                                </div>

                                {/* <Delete02 className="delete" /> */}
                            </div>
                        </div>

                        <div className="frame-16">
                            {/* <Navigation01 className="navigation" /> */}
                            <div className="text-wrapper-9">15분 이동. 버스.</div>
                        </div>

                        <div className="frame-9">
                            <div className="frame-10">
                                <div className="group-2">
                                    <div className="frame-11">
                                        <div className="text-wrapper-6">부산 아쿠아리움</div>
                                    </div>

                                    <div className="frame-12">
                                        <div className="text-wrapper-6">{""}</div>
                                    </div>
                                </div>

                                <div className="frame-13">
                                    {/* <Note /> */}
                                    <div className="frame-4">
                                        <div className="text-wrapper-7">아쿠아리움. 근처 밥집</div>
                                    </div>
                                </div>
                            </div>

                            <div className="frame-14">
                                <div className="frame-15">
                                    <div className="text-wrapper-8">AM 9:00</div>
                                </div>

                                {/* <Delete02 className="delete" /> */}
                            </div>
                        </div>

                        <div className="group-wrapper">
                            <div className="group-3">
                                {/* <NoteAdd className="note-add" /> */}
                                <div className="frame-17">
                                    <div className="text-wrapper-7">이동시간 메모 추가</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Plan;
