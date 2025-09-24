import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';
import logo from '../../assets/images/SFAC-Logo.png';

function RegistrationPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  
  // State for form fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentId, setStudentId] = useState<File | null>(null);
  const [studentIdPreview, setStudentIdPreview] = useState<string | null>(null);
  const [role, setRole] = useState(''); // Add state for role
  
  // State for validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [studentIdError, setStudentIdError] = useState('');
  
  // State for password strength
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  // Animation effects
  useEffect(() => {
    requestAnimationFrame(() => {
      const root = document.documentElement;
      root.classList.add('page-mounted');
    });

    const elements: Element[] = [];
    if (cardRef.current) elements.push(cardRef.current);
    if (footerRef.current) elements.push(footerRef.current);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  // Password validation and strength check
  const validatePassword = (password: string) => {
    // Check if password is at least 8 characters
    if (!password) {
      setPasswordError('Password is required');
      setPasswordStrength('');
      return false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      setPasswordStrength('weak');
      return false;
    }

    // Check password strength
    let strength = 0;
    
    // Check for special characters
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);

    if (hasSpecialChar) strength++;
    if (hasNumber) strength++;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;

    // Determine strength level
    if (strength <= 2) {
      setPasswordStrength('weak');
    } else if (strength <= 3) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }

    // Check for special characters requirement
    if (!hasSpecialChar) {
      setPasswordError('Password must contain at least one special character');
      return false;
    }

    setPasswordError('');
    return true;
  };

  // Confirm password validation
  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  };

  // ID file validation
  const validateStudentId = (file: File | null) => {
    if (!file) {
      setStudentIdError('ID photo is required');
      return false;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setStudentIdError('Only JPG and PNG files are allowed');
      return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setStudentIdError('File size must be less than 5MB');
      return false;
    }

    setStudentIdError('');
    return true;
  };

  // Handle file upload and preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setStudentId(file);

    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setStudentIdPreview(previewUrl);
      validateStudentId(file);
    } else {
      setStudentIdPreview(null);
    }

    // Clean up preview URL when component unmounts
    return () => {
      if (studentIdPreview) {
        URL.revokeObjectURL(studentIdPreview);
      }
    };
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // Validate all fields
  const isEmailValid = validateEmail(email);
  const isPasswordValid = validatePassword(password);
  const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
  const isStudentIdValid = validateStudentId(studentId);
  const isRoleValid = !!role;

  if (!isRoleValid) {
    // Optionally set an error for role
    return;
  }

  if (isEmailValid && isPasswordValid && isConfirmPasswordValid && isStudentIdValid && isRoleValid) {
    setIsSubmitting(true);
    setSubmissionError('');

    if (!studentId) {
      setSubmissionError('Student ID photo is required');
      setIsSubmitting(false);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;

      // Prepare payload to match user.model.js
      const payload = {
        email,
        password,
        idpic: {
          filename: studentId.name,
          image: base64Image
        },
        role
      };


      try {
        const response = await fetch('https://sfac-hub.onrender.com/api/user/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        setIsSubmitting(false);

        if (response.ok) {
          setSubmissionSuccess(true);
          setShowNotification(true);
          
          // Show notification and redirect after 3 seconds
          setTimeout(() => {
            setSubmissionSuccess(false);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setStudentId(null);
            setStudentIdPreview(null);
            setPasswordStrength('');
            setRole('');
          }, 10000);
        } else {
          const data = await response.json();
          setSubmissionError(data.message || 'Registration failed');
        }
      } catch (error) {
        setIsSubmitting(false);
        setSubmissionError('Network error. Please try again.');
      }
    };
    reader.readAsDataURL(studentId);
  }
};

  // Animation classes for card
  const cardClasses = [
    'login-card',
    'fade-on-scroll',
    submissionSuccess ? 'success-animation' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="login-landing">
      <main className="center-stage">
        <div ref={cardRef} className={cardClasses}>
          <div className="card-logo-wrap">
            <img src={logo} alt="SFAC logo" className="card-logo" />
          </div>
          <h1 className="card-title">Create an Account</h1>
          <p className="card-sub">Register to access SFAC Hub</p>

          {submissionSuccess ? (
            <div className="success-message">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#10b981" fillOpacity="0.1" />
                <path d="M8 12l3 3 6-6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>Registration Successful!</h3>
              <p>Successfully registered. Please wait for admin verification of your account.</p>
              <p className="redirect-text">Redirecting to sign-in page...</p>
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              {/* Role Dropdown */}
              <label className="label">Role</label>
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>
                </span>
                <select
                  className="input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="" disabled>Select your role</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {/* Email Field */}
              <label className="label">Email</label>
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" strokeWidth="1.6"/><path d="m5 7 7 5 7-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  className={`input ${emailError ? 'input-error' : ''}`} 
                  value={email} 
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateEmail(e.target.value);
                  }}
                  required 
                />
              </div>
              {emailError && <p className="error-message">{emailError}</p>}

              {/* Password Field */}
              <label className="label">Password</label>
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M8 10V8a4 4 0 1 1 8 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  className={`input input-has-toggle ${passwordError ? 'input-error' : ''}`} 
                  value={password} 
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                    // Also validate confirm password if it's already filled
                    if (confirmPassword) {
                      validateConfirmPassword(confirmPassword);
                    }
                  }}
                  required 
                />
                <button 
                  type="button" 
                  className="toggle-btn" 
                  aria-label={showPassword ? 'Hide password' : 'Show password'} 
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    // eye-off
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M10.73 6.17A8.7 8.7 0 0 1 12 6c5 0 8.5 5.5 8.5 5.5a13.7 13.7 0 0 1-3.08 3.44" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M6.5 6.5A13.6 13.6 0 0 0 3.5 11.5S7 17 12 17c1.07 0 2.08-.22 3-.62" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  ) : (
                    // eye
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 6c5 0 8.5 5.5 8.5 5.5S17 17 12 17 3.5 11.5 3.5 11.5 7 6 12 6Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="11.5" r="2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  )}
                </button>
              </div>
              {passwordError && <p className="error-message">{passwordError}</p>}
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    <div className={`strength-bar ${passwordStrength === 'weak' || passwordStrength === 'medium' || passwordStrength === 'strong' ? 'active weak' : ''}`}></div>
                    <div className={`strength-bar ${passwordStrength === 'medium' || passwordStrength === 'strong' ? 'active medium' : ''}`}></div>
                    <div className={`strength-bar ${passwordStrength === 'strong' ? 'active strong' : ''}`}></div>
                  </div>
                  <p className={`strength-text ${passwordStrength}`}>
                    {passwordStrength === 'weak' && 'Weak'}
                    {passwordStrength === 'medium' && 'Medium'}
                    {passwordStrength === 'strong' && 'Strong'}
                  </p>
                </div>
              )}
              
              {/* Confirm Password Field */}
              <label className="label">Confirm Password</label>
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M8 10V8a4 4 0 1 1 8 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </span>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  className={`input input-has-toggle ${confirmPasswordError ? 'input-error' : ''}`} 
                  value={confirmPassword} 
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validateConfirmPassword(e.target.value);
                  }}
                  required 
                />
                <button 
                  type="button" 
                  className="toggle-btn" 
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} 
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? (
                    // eye-off
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M10.73 6.17A8.7 8.7 0 0 1 12 6c5 0 8.5 5.5 8.5 5.5a13.7 13.7 0 0 1-3.08 3.44" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M6.5 6.5A13.6 13.6 0 0 0 3.5 11.5S7 17 12 17c1.07 0 2.08-.22 3-.62" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  ) : (
                    // eye
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 6c5 0 8.5 5.5 8.5 5.5S17 17 12 17 3.5 11.5 3.5 11.5 7 6 12 6Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="11.5" r="2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  )}
                </button>
              </div>
              {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
              
              {/* ID Upload */}
              <label className="label">ID Photo</label>
              <div className={`file-upload ${studentIdError ? 'file-upload-error' : ''}`}>
                <input 
                  type="file" 
                  id="student-id-upload" 
                  className="file-input" 
                  accept=".jpg,.jpeg,.png" 
                  onChange={handleFileChange}
                  required
                />
                <label htmlFor="student-id-upload" className="file-label">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.5 13.5 7 19h10l-1.5-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="m8 10 4 2 4-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span>Upload Photo</span>
                  <small className="file-hint">JPG/PNG • Max 5MB</small>
                </label>
                {studentId && (
                  <div className="file-preview">
                    <img src={studentIdPreview || undefined} alt="ID Preview" className="preview-image" />
                    <button 
                      type="button" 
                      className="remove-file-btn" 
                      onClick={() => {
                        setStudentId(null);
                        setStudentIdPreview(null);
                        setStudentIdError('ID photo is required');
                      }}
                    >
                      {/* <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="m6 6 12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> */}
                    </button>
                  </div>
                )}
              </div>
              {studentIdError && <p className="error-message">{studentIdError}</p>}
              
              {/* Submit Button */}
              <button 
                className="cta-btn primary" 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading-spinner">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto' }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="18 18" strokeDashoffset="0" strokeLinecap="round">
                        <animate attributeName="stroke-dashoffset" from="0" to="36" dur="1s" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                  </span>
                ) : 'Register'}
              </button>
              
              {/* Submission Error */}
              {submissionError && <p className="error-message">{submissionError}</p>}
            </form>
          )}

          <div className="form-footer">
            <span className="muted-text">Already have an account? <Link to="/login" className="muted-link strong">Sign in</Link></span>
          </div>
        </div>
      </main>

      <footer ref={footerRef} className="footer fade-on-scroll">
        <div className="container footer-inner">
          <p>© {new Date().getFullYear()} SFAC Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default RegistrationPage;