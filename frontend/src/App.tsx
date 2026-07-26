import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { UploadsPage } from './features/uploads/pages/UploadsPage';
import { ChatsPage } from './features/chat/pages/ChatsPage';
import { PodcastsPage } from './features/podcasts/pages/PodcastsPage';
import { NotesPage } from './features/study/pages/NotesPage';
import { ExplorePage } from './features/explore/pages/ExplorePage';
import { WhiteboardPage } from './features/whiteboard/pages/WhiteboardPage';
import { VideoHighlightsPage } from './features/video/pages/VideoHighlightsPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/uploads" element={<UploadsPage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/podcasts" element={<PodcastsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/whiteboard" element={<WhiteboardPage />} />
            <Route path="/video" element={<VideoHighlightsPage />} />
            <Route path="/calendar" element={<div className="p-8">Calendar (Coming Soon)</div>} />
            <Route path="/settings" element={<div className="p-8">Settings (Coming Soon)</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
