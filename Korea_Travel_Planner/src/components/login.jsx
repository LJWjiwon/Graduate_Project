import React from "react";
// import { KakaoLogin } from "./KakaoLogin";
// import focusRipple from "./focus-ripple.svg";
// import googleLogo from "./google-logo.svg";
// import image from "./image.svg";
import "./login.css";

function Login() {
    return (
        <div className="div-wrapper">
            <div className="frame" />

            <div className="div">
                <div className="frame-2">
                    <div className="frame-3">
                        <div className="text-wrapper-2">Login</div>
                    </div>

                    <div className="frame-4">
                        <div className="text-wrapper-3">아이디</div>
                    </div>

                    <div className="frame-4">
                        <div className="text-wrapper-3">비밀번호</div>
                    </div>

                    <div className="frame-5">
                        <div className="button-wrapper">
                            <button className="button">
                                <img
                                    className="focus-ripple"
                                    alt="Focus ripple"
                                    // src={focusRipple}
                                />

                                <div className="base">
                                    <div className="button-2">로그인</div>
                                </div>
                            </button>
                        </div>

                        <div className="button-wrapper">
                            <button className="button">
                                {/* <img className="focus-ripple" alt="Focus ripple" src={image} /> */}

                                <div className="base-2">
                                    <div className="button-2">회원가입</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="frame-6">
                    <div className="google-action-login">
                        <div className="frame-7">
                            {/* <img className="google-logo" alt="Google logo" src={googleLogo} /> */}

                            <div className="text-wrapper-4">Sign In with Google</div>
                        </div>
                    </div>

                    <div className="kakao-login-wrapper">
                        {/* <KakaoLogin
                            className="kakao-login-instance"
                            kakaoStyleOverrideClassName="design-component-instance-node"
                            labelClassName="kakao-login-2"
                            language="english"
                            size="large"
                            type="default"
                            width="narrow"
                        /> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
