import { useTheme } from '../context/ThemeContext'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme} className="btn-ghost h-8 px-2" aria-label="Toggle theme">
      {theme === 'light' ? 'Dark' : 'Light'}
    </button>
  )
}

export default ThemeToggle
