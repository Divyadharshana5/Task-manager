import './globals.css'

export const metadata = {
  title: 'Task Manager',
  description: 'A simple task management app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}