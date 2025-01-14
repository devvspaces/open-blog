import App from './pages/index';
import MembersPage, { membersLoader } from './pages/members';
import CreatePostPage from './pages/new';
import PostPage, { postLoader } from './pages/post';
import MemberDetailPage, { memberLoader } from './pages/members/detail';
import SignUp from './pages/auth/signup';
import SettingsPage from './pages/billing';
import ErrorPage from './pages/error-page';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './pages/root';
import ProfilePage from './pages/account';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: 'account',
        element: <ProfilePage />,
      },
      {
        path: 'new/post',
        element: <CreatePostPage />,
      },
      {
        path: 'posts/:owner/:id',
        element: <PostPage />,
        loader: postLoader,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'members',
        element: <MembersPage />,
        loader: membersLoader,
      },
      {
        path: 'members/:id',
        element: <MemberDetailPage />,
        loader: memberLoader,
      },
      {
        path: 'signup',
        element: <SignUp />,
      },
    ],
  },
]);

export default router;