import { useRef, useState, useEffect } from 'react'
import './login.css'
import logo from '../../assets/images/SFAC-Logo.png'
import { Link } from 'react-router-dom'

function LoginLanding() {
	const cardRef = useRef<HTMLDivElement>(null)
	const footerRef = useRef<HTMLElement>(null)
	const [showPassword, setShowPassword] = useState(false)
	const [role, setRole] = useState('') // Add state for role

	useEffect(() => {
		requestAnimationFrame(() => {
			const root = document.documentElement
			root.classList.add('page-mounted')
		})

		const elements: Element[] = []
		if (cardRef.current) elements.push(cardRef.current)
		if (footerRef.current) elements.push(footerRef.current)

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('reveal')
						observer.unobserve(entry.target)
					}
				})
			},
			{ threshold: 0.15 }
		)

		elements.forEach((el) => observer.observe(el))
		return () => observer.disconnect()
	}, [])

	return (
		<div className="login-landing">
			<main className="center-stage">
				<div ref={cardRef} className="login-card fade-on-scroll">
					<div className="card-logo-wrap">
						<img src={logo} alt="SFAC logo" className="card-logo" />
					</div>
					<h1 className="card-title">Welcome to SFAC Hub</h1>
					<p className="card-sub">Sign in to continue</p>

					<form className="form" onSubmit={(e) => e.preventDefault()}>
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

						<label className="label">Email</label>
						<div className="input-group">
							<span className="input-icon" aria-hidden="true">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" strokeWidth="1.6"/><path d="m5 7 7 5 7-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
							</span>
							<input type="email" placeholder="you@example.com" className="input" required />
						</div>

						<label className="label">Password</label>
						<div className="input-group">
							<span className="input-icon" aria-hidden="true">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M8 10V8a4 4 0 1 1 8 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
							</span>
							<input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input input-has-toggle" required />
							<button type="button" className="toggle-btn" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((v) => !v)}>
								{showPassword ? (
									// eye-off
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M10.73 6.17A8.7 8.7 0 0 1 12 6c5 0 8.5 5.5 8.5 5.5a13.7 13.7 0 0 1-3.08 3.44" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M6.5 6.5A13.6 13.6 0 0 0 3.5 11.5S7 17 12 17c1.07 0 2.08-.22 3-.62" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
								) : (
									// eye
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 6c5 0 8.5 5.5 8.5 5.5S17 17 12 17 3.5 11.5 3.5 11.5 7 6 12 6Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="11.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/></svg>
								)}
							</button>
						</div>

						<button className="cta-btn primary" type="submit">Sign in</button>
					</form>

					<div className="form-footer">
						<a href="#" className="muted-link">Forgot password?</a>
						<span></span>
						<span className="muted-text">Need an account? <Link to="/register" className="muted-link strong">Sign up</Link></span>
					</div>
				</div>
			</main>

			<footer ref={footerRef} className="footer fade-on-scroll">
				<div className="container footer-inner">
					<p>© {new Date().getFullYear()} SFAC Hub. All rights reserved.</p>
				</div>
			</footer>
		</div>
	)
}

export default LoginLanding