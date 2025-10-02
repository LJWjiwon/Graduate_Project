import React from 'react';
import './login.css'; // Import the CSS file

const Login = () => {
  return (
    <div className="login-container">
      {/* Left side: Image and background */}
      <div className="login-image-section">
        {/*
          Note: In a real application, you'd import the image
          or use a URL. For simplicity, the CSS will handle the
          background image for this section.
        */}
      </div>

      {/* Right side: Login form */}
      <div className="login-form-section">
        <h2 className="login-title">Login</h2>

        <div className="form-fields">
          {/* ID Input */}
          <input
            type="text"
            placeholder="아이디" // Korean for "ID"
            className="input-field"
          />

          {/* Password Input */}
          <input
            type="password"
            placeholder="비밀번호" // Korean for "Password"
            className="input-field"
          />
        </div>

        <div className="form-actions">
          {/* Login Button */}
          <button className="btn primary-btn">
            로그인 // Korean for "Login"
          </button>
          {/* Signup Button */}
          <button className="btn secondary-btn">
            회원가입 // Korean for "Sign up"
          </button>
        </div>

        {/* Social Login Buttons */}
        <div className="social-login">
          {/* Google Login Button */}
          <button className="social-btn google-btn">
            <span className="google-icon">G</span> Sign In with Google
          </button>

          {/* Kakao Login Button (Yellow) */}
          <button className="social-btn kakao-btn">
            <span className="kakao-icon"></span> Login with Kakao
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;