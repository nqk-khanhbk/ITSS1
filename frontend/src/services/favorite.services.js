import { get, post, del } from "../utils/request";

export const getFavoritePlaces = async (user_id, page = 1, limit = 10) => {
  return await get(`favorites?user_id=${user_id}&page=${page}&limit=${limit}`);
};

export const getFavoritePlans = async (user_id) => {
  return await get(`day-plans/favorites?user_id=${user_id}`);
};

export const addFavoritePlace = async (user_id, place_id) => {
  return await post(`favorites`, { user_id, place_id });
};

export const removeFavoritePlace = async (user_id, place_id) => {
  return await del(`favorites/${place_id}?user_id=${user_id}`);
};

export const checkFavoritePlace = async (user_id, place_id) => {
  // backend expects GET /favorites/check/:place_id?user_id=xxx
  return await get(`favorites/check/${place_id}?user_id=${user_id}`);
};

// Day-plan likes (favorites) APIs
export const getFavoriteDayPlans = async (user_id, page = 1, limit = 10) => {
  return await get(`day-plans/favorites?user_id=${user_id}&page=${page}&limit=${limit}`);
};

export const likeDayPlan = async (user_id, day_plan_id) => {
  return await post(`day-plans/likes`, { user_id, day_plan_id });
};

export const unlikeDayPlan = async (user_id, day_plan_id) => {
  return await del(`day-plans/likes/${day_plan_id}?user_id=${user_id}`);
};

export const checkLikeDayPlan = async (user_id, day_plan_id) => {
  return await get(`day-plans/likes/check/${day_plan_id}?user_id=${user_id}`);
};

export default {
  getFavoritePlaces,
  getFavoritePlans,
  addFavoritePlace,
  removeFavoritePlace,
  checkFavoritePlace,
};
