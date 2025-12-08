import Layout from "../layouts";
import Home from "../pages/home";
import Ranking from "../pages/ranking";
import Schedule from "../pages/schedule";
import ScheduleDetail from "../pages/schedule/schedule.detail";
import SearchResultPage from "../pages/search/SearchResultPage.jsx";
import PlaceDetail from '../pages/place/PlaceDetail.jsx';
import Login from "../pages/login";
import Register from "../pages/register";
import Profile from "../pages/profile";
import PrivateRoutes from "./private.router";
import ScheduleCreate from "../pages/schedule/schedule.create";

export const Router = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      { path: 'ranking', element: <Ranking /> },
      { path: 'schedule', element: <Schedule /> },
      { path: 'schedule/:id', element: <ScheduleDetail /> },
      { path: 'places/:id', element: <PlaceDetail /> },
      { path: 'search', element: <SearchResultPage /> },
      {
        element: <PrivateRoutes />,
        children: [
          { 
            path: '/profile',
            element: <Profile />
          },
          {
            path: '/schedule/create',
            element: <ScheduleCreate />
          }
        ],
      },
    ]
  }
];
export default Router;
