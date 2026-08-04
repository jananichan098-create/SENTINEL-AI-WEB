# SentinelAI Watch

Build a modern, professional, AI-powered Smart Surveillance and Real-Time Alert System web application called "SentinelAI".

The design should look like a real enterprise security dashboard (similar to Hikvision, Cisco Meraki, or Tesla monitoring dashboards).

Theme:

- Dark mode

- Navy blue and black colors

- Red accents for alerts

- Glassmorphism cards

- Smooth animations

- Responsive design for desktop and tablet

====================================

LOGIN PAGE

====================================

Create a beautiful login page with:

- SentinelAI logo

- Email field

- Password field

- Remember me checkbox

- Login button

- "Forgot Password?"

- Background with animated security grid

====================================

DASHBOARD

====================================

Sidebar:

- Dashboard

- Live Surveillance

- Campus Map

- Alerts

- Cameras

- Analytics

- Event History

- Settings

Top Bar:

- Search

- Current Date & Time

- Notification Bell

- Admin Profile

====================================

LIVE SURVEILLANCE

====================================

Create a large Live Camera Feed section.

Include:

- "Start Camera" button

- "Stop Camera" button

- Camera status indicator

- Camera name

- Camera location

The camera feed should use the user's webcam (browser camera) as a placeholder.

Overlay the video with AI detection boxes such as:

Person Detected

Fire Detected

Smoke Detected

Crowd Detected

Show confidence percentages beside detections.

====================================

LIVE ALERT PANEL

====================================

Create a floating alert panel.

Whenever an alert occurs:

Display:

🚨 FIRE DETECTED

🚨 PERSON DETTECTED

🚨 CROWD FORMING

🚨 UNAUTHORIZED ENTRY

Each alert should include:

- Time

- Camera ID

- Building Name

- Severity

High severity alerts should glow red.

Medium alerts should glow orange.

Safe status should glow green.

Include a "Test Alert" button that simulates an emergency.

====================================

ALARM

====================================

When "Test Alert" is clicked:

Play an alarm sound.

Flash the screen red briefly.

Show an emergency popup.

====================================

CAMPUS MAP

====================================

Create a campus map using Leaflet.js.

Display markers for:

Main Gate

Library

Admin Block

Biomedical Lab

Engineering Block

Hostel

Parking

Sports Complex

Camera icons should appear on every building.

When a simulated emergency happens:

The building marker turns RED.

Safe buildings remain GREEN.

Clicking a marker opens a popup showing:

Camera Name

Current Status

Last Alert

People Count

====================================

ANALYTICS

====================================

Display cards showing:

Total Cameras

People Detected Today

Fire Alerts

Crowd Alerts

Visitors

Active Alerts

System Health

Use animated counters.

Include interactive charts for:

Daily Alerts

People Count

Alert Types

Camera Usage

====================================

EVENT HISTORY

====================================

Create a searchable table containing:

Time

Camera

Location

Alert Type

Confidence

Status

Snapshot Preview

Export button

Filter by date.

====================================

CAMERA PAGE

====================================

Display camera cards.

Each card contains:

Camera Name

Location

Online/Offline Status

View Live button

Health Indicator

====================================

SETTINGS

====================================

Allow changing:

Alert Sound ON/OFF

Dark Mode

Notification Preferences

Camera Refresh Rate

====================================

FOOTER

====================================

Display:

SentinelAI © 2026

AI Smart Surveillance Platform

====================================

DESIGN

====================================

Use modern dashboards with:

Bootstrap

Font Awesome icons

Rounded cards

Hover effects

Animated charts

Loading animations

Professional spacing

The interface should feel premium and competition-ready.

Do not use dummy lorem ipsum text.

Use realistic sample data throughout the dashboard.

Ensure the project is organized into reusable components and is easy to extend with Flask, OpenCV, and YOLO AI later.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vigilant-stream-app.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/141ea8a7-d48c-406e-9313-0bd1cc13f78e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
