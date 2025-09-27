import React from "react";
// import { ExpandMoreFilled } from "./ExpandMoreFilled";
// import image from "./image.svg";
import "./survey.css";
// import vertical from "./vertical.svg";

function Survey() {
    return (
        <div className="screen">
            <div className="frame">
                <p className="text-wrapper">
                    더 나은 추천을 위한 설문입니다. 설문에 응해주시면 맞춤화된 추천을
                    받아보실 수 있습니다.
                </p>
            </div>

            <div className="div">
                <div className="div-wrapper">
                    <div className="text-wrapper-2">기본정보</div>
                </div>

                <div className="frame-2">
                    <div className="frame-3">
                        <div className="text-wrapper-3">나이대는 어떻게 되시나요?</div>
                    </div>

                    <div className="frame-4">
                        <div className="frame-5">
                            <div className="text-wrapper-4">10대</div>
                        </div>

                        <div className="frame-5">
                            <div className="text-wrapper-4">20대</div>
                        </div>

                        <div className="frame-5">
                            <div className="text-wrapper-4">30대</div>
                        </div>

                        <div className="frame-5">
                            <div className="text-wrapper-4">40대</div>
                        </div>

                        <div className="frame-6">
                            <div className="text-wrapper-4">50대 이상</div>
                        </div>
                    </div>
                </div>

                <div className="frame-2">
                    <div className="div-wrapper">
                        <div className="text-wrapper-3">여행을 주로 누구와 다니나요?</div>
                    </div>

                    <div className="frame-7">
                        <div className="frame-5">
                            <div className="text-wrapper-4">혼자</div>
                        </div>

                        <div className="frame-5">
                            <div className="text-wrapper-4">친구</div>
                        </div>

                        <div className="frame-5">
                            <div className="text-wrapper-4">연인</div>
                        </div>

                        <div className="frame-5">
                            <div className="text-wrapper-4">가족</div>
                        </div>

                        <div className="frame-5">
                            <div className="text-wrapper-4">기타</div>
                        </div>
                    </div>
                </div>

                <div className="frame-8">
                    <div className="text-wrapper-3">사는 지역이 어떻게 되시나요?</div>

                    <div className="frame-9">
                        <div className="button-group">
                            <button className="button">
                                <div className="base">
                                    <div className="button-2">지역 선택(시/도)</div>
                                </div>
                            </button>

                            {/* <img className="vertical" alt="Vertical" src={image} /> */}

                            <div className="base-wrapper">
                                <div className="base">
                                    <div className="masked-icon">
                                        {/* <ExpandMoreFilled className="icon-left" color="white" /> */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="button-group">
                            <button className="button">
                                <div className="base">
                                    <div className="button-2">세부지역 선택(시/군/구)</div>
                                </div>
                            </button>

                            {/* <img className="vertical" alt="Vertical" src={vertical} /> */}

                            <div className="base-wrapper">
                                <div className="base">
                                    <div className="masked-icon">
                                        {/* <ExpandMoreFilled className="icon-left" color="white" /> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="frame-wrapper">
                <div className="frame-10">
                    <div className="frame-11">
                        <div className="text-wrapper-5">건너뛰기</div>
                    </div>

                    <div className="frame-12">
                        <div className="text-wrapper-5">다음</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Survey;
