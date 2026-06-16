# Draft Tracker

Draft Tracker is an offline React Native MVP for ship masters and deck officers who need an operational estimate of cargo onboard during loading or discharging.

It is not a replacement for an official draft survey. It is designed for monitoring cargo quantity, rates, progress, and estimated completion time during cargo operations.

## Platform

- iOS and Android through Expo / React Native
- TypeScript
- Local device storage only
- No accounts
- No cloud backend

## Main Features

- Vessel setup with vessel name, lightship, constant, and hydrostatic PDF reference
- Offline hydrostatic PDF upload with local table extraction heuristic
- Manual hydrostatic table review and editing
- Loading or discharging operation setup
- Survey input for six drafts, dock water density, ballast, fresh water, fuel, and survey time
- Mean draft, displacement interpolation, density correction, and cargo onboard calculation
- Results for cargo onboard, changes since previous and commencement survey, rates, target remaining, progress, and ETC
- Chronological local history for the active operation

## Calculations

Mean draft uses a Simpson-style weighting:

```text
((forward mean) + 6 * (midship mean) + (aft mean)) / 8
```

Cargo onboard:

```text
Displacement - Lightship - Constant - Ballast - Fresh Water - Fuel
```

Hydrostatic displacement is linearly interpolated from the saved hydrostatic table and corrected from salt water density using dock water density.

## Run

Install dependencies, then start Expo:

```bash
npm install
npm run start
```

Then open the app in Expo Go, an iOS simulator, or an Android emulator.

## Project Structure

```text
App.tsx
src/
  components/       Shared mobile UI components
  screens/          Vessel, operation, survey, results, history screens
  services/         Local storage, hydrostatic import, calculations
  theme/            Maritime daylight color system
  types/            Domain models
  utils/            IDs and formatting helpers
```

## MVP Notes

Hydrostatic PDFs are not standardized. The app attempts local text extraction and row detection, then requires manual review/editing before use. For production, replace the heuristic extractor with a tested parser tuned to the vessel operator's hydrostatic table format.
