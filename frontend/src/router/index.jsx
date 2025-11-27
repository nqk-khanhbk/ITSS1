import Layout from "../layouts";
import Home from "../pages/home";
import Ranking from "../pages/ranking";
import Schedule from "../pages/schedule";
import ScheduleDetail from "../pages/schedule/schedule.detail";
import SearchResultPage from "../pages/search/SearchResultPage.jsx";
import PlaceDetail from '../pages/place/PlaceDetail.jsx';

export const Router = [
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
      { path: 'search', element: <SearchResultPage /> }
    ]
  }
];
export default Router;
