import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserPoints {
  [phone: string]: number;
}

export interface PointsState {
  userPoints: UserPoints;
}

const initialState: PointsState = {
  userPoints: {},
};

export const pointsSlice = createSlice({
  name: 'points',
  initialState,
  reducers: {
    setUserPoints: (state, action: PayloadAction<{ phone: string; points: number }>) => {
      const { phone, points } = action.payload;
      state.userPoints[phone] = points;
    },
    addUserPoints: (state, action: PayloadAction<{ phone: string; points: number }>) => {
      const { phone, points } = action.payload;
      state.userPoints[phone] = (state.userPoints[phone] || 0) + points;
    },
    resetUserPoints: (state, action: PayloadAction<string>) => {
      state.userPoints[action.payload] = 0;
    },
  },
});

export const { setUserPoints, addUserPoints, resetUserPoints } = pointsSlice.actions;

// Selector to get points for a specific user
export const selectUserPoints = (state: { points: PointsState }, phone: string) => 
  state.points.userPoints[phone] || 0;

export default pointsSlice.reducer;
