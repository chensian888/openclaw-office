import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import BoardPage from '@/pages/OpenClawBoard'
import NotesPage from '@/pages/OpenClawNotes'

describe('OpenClaw pages', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders board page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<BoardPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('OpenClaw 像素办公室')).toBeInTheDocument()
    expect(screen.getByText('状态面板')).toBeInTheDocument()
    expect(screen.getByText('今日工作小记')).toBeInTheDocument()
    expect(screen.getByText('最近小记')).toBeInTheDocument()
  })

  it('renders notes page', () => {
    render(
      <MemoryRouter initialEntries={['/notes']}>
        <Routes>
          <Route path="/notes" element={<NotesPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: '返回看板' })).toBeInTheDocument()
    expect(screen.getByText('详情')).toBeInTheDocument()
  })
})
