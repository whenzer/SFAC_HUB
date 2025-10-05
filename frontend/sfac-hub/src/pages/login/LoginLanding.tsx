import { useRef, useState, useEffect } from 'react'
import './login.css'
import logo from '../../assets/images/SFAC-Logo.png'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../../components/Footer'

function LoginLanding() {
	const navigate = useNavigate()
	const cardRef = useRef<HTMLDivElement>(null)
	const footerRef = useRef<HTMLElement>(null)
	const [showPassword, setShowPassword] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false) // New state for loading

	useEffect(() => {
		requestAnimationFrame(() => {
			const root = document.documentElement
			root.classList.add('page-mounted')
		})

		const elements: Element[] = []
		if (cardRef.current) elements.push(cardRef.current)

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setIsLoading(true) // Disable button when login starts

		try {
			const response = await fetch('https://sfac-hub.fly.dev/api/user/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			})
			const data = await response.json()
			
			if (response.ok) {
				localStorage.setItem('accessToken', data.accessToken)
				localStorage.setItem('refreshToken', data.refreshToken)
				navigate('/dashboard')
				// Note: We don't set isLoading(false) here because navigate will unmount the component
			} else {
				setError(data.message || 'Login failed')
				setIsLoading(false) // Re-enable button on error
			}
		} catch {
			setError('Network error. Please try again.')
			setIsLoading(false) // Re-enable button on error
		}
	}

	return (
		<div className="login-landing">
			<main className="center-stage">
				<div ref={cardRef} className="login-card fade-on-scroll">
					{/* Breadcrumb Navigation */}
					<nav className="breadcrumb-login">
						<Link to="/" className="breadcrumb-link">Home</Link>
						<span className="breadcrumb-separator">/</span>
						<span className="breadcrumb-current">Login</span>
					</nav>

					<div className="card-logo-wrap">
						<img src={logo} alt="SFAC logo" className="card-logo" />
					</div>
					<h1 className="card-title">Welcome to SFAC Hub</h1>
					<p className="card-sub">Sign in to continue</p>

					<form className="form" onSubmit={handleSubmit}>
						<label className="label">Email</label>
						<div className="input-group">
							<span className="input-icon" aria-hidden="true">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" strokeWidth="1.6"/><path d="m5 7 7 5 7-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
							</span>
							<input
								type="email"
								placeholder="you@example.com"
								className="input"
								required
								value={email}
								onChange={e => setEmail(e.target.value)}
								disabled={isLoading} // Optional: disable inputs during loading
							/>
						</div>

						<label className="label">Password</label>
						<div className="input-group">
							<span className="input-icon" aria-hidden="true">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M8 10V8a4 4 0 1 1 8 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
							</span>
							<input
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••"
								className="input input-has-toggle"
								required
								value={password}
								onChange={e => setPassword(e.target.value)}
								disabled={isLoading} // Optional: disable inputs during loading
							/>
							<button 
								type="button" 
								className="toggle-btn" 
								aria-label={showPassword ? 'Hide password' : 'Show password'} 
								onClick={() => setShowPassword((v) => !v)}
								disabled={isLoading} // Optional: disable during loading
							>
								{showPassword ? (
									// eye-off
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M10.73 6.17A8.7 8.7 0 0 1 12 6c5 0 8.5 5.5 8.5 5.5a13.7 13.7 0 0 1-3.08 3.44" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M6.5 6.5A13.6 13.6 0 0 0 3.5 11.5S7 17 12 17c1.07 0 2.08-.22 3-.62" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
								) : (
									// eye
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 6c5 0 8.5 5.5 8.5 5.5S17 17 12 17 3.5 11.5 3.5 11.5 7 6 12 6Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="11.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/></svg>
								)}
							</button>
						</div>
						{error && <div className="error-message">{error}</div>}
						
						<button 
							className={`cta-btn primary ${isLoading ? 'loading' : ''}`} 
							type="submit"
							disabled={isLoading} // Button becomes disabled when loading
						>
							{isLoading ? 'Signing in...' : 'Sign in'}
						</button>
					</form>

					<div className="form-footer">
						<a href="#" className="muted-link">Forgot password?</a>
						<span></span>
						<span className="muted-text">Need an account? <Link to="/register" className="muted-link strong">Sign up</Link></span>
					</div>
				</div>
			</main>

			<Footer />
			
		</div>
	)
}

export default LoginLanding