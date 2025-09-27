import React from "react";
// import { AddCircle } from "./AddCircle";
import ArrowLeft01Sharp from "./ArrowLeft01Sharp";
// import { Delete02 } from "./Delete02";
// import { PencilEdit01 } from "./PencilEdit01";
// import { User } from "./User";
import "./plan_manage.css";

function Manage() {
    return (
        <div className="screen">
            <div className="frame">
                <div className="div-wrapper">
                    <div className="text-wrapper">일정 관리</div>
                </div>

                <div className="user-wrapper">
                    {/* <User className="user-instance" /> */}
                </div>

                <ArrowLeft01Sharp className="arrow-left-sharp" />
            </div>

            <div className="div">
                <div className="frame-wrapper">
                    <div className="frame-2">
                        {/* <AddCircle className="add-circle" /> */}
                        <div className="frame-3">
                            <div className="text-wrapper-2">일정 추가</div>
                        </div>
                    </div>
                </div>

                <div className="frame-4">
                    <div className="frame-5">
                        <div className="frame-3">
                            <div className="text-wrapper-3">부산 반려동물 여행 계획</div>
                        </div>

                        <div className="frame-3">
                            <div className="text-wrapper-4">
                                2025.04.17 ~ 2025.04.18 (2일)
                            </div>
                        </div>
                    </div>

                    <div className="frame-6">
                        {/* <PencilEdit01 className="icon-instance-node" />
                        <Delete02 className="icon-instance-node" /> */}
                    </div>
                </div>

                <div className="frame-4">
                    <div className="frame-5">
                        <div className="frame-3">
                            <div className="text-wrapper-3">힐링 여행!</div>
                        </div>

                        <div className="frame-3">
                            <div className="text-wrapper-4">
                                2025.04.17 ~ 2025.04.17 (1일)
                            </div>
                        </div>
                    </div>

                    <div className="frame-6">
                        {/* <PencilEdit01 className="icon-instance-node" />
                        <Delete02 className="icon-instance-node" /> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Manage;
