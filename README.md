# JanSetu AI

## Deployment

This app uses Firebase Authentication and Cloud Firestore for users and reports. It does not use the local SQLite files in `data/` at runtime.

Set these environment variables in the hosting provider before building:

- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase web app API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase web app ID
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps browser key

Use `npm run build` as the build command and `npm run start` as the start command. Deploy `firestore.rules` to the Firebase project before accepting user reports.

JanSetu AI is a civic issue reporting and policy intelligence platform. It helps citizens report community infrastructure problems and gives government teams a clearer way to understand, prioritize, and act on them.

Reports can be submitted as text or as photo/video input. JanSetu AI analyzes the report, identifies the issue category, estimates its severity, assigns it to the relevant department, and produces a priority score. Related reports can increase the urgency of an issue so repeated problems are easier to spot.

## What it includes

- Citizen reporting with text, image, and video input
- AI-assisted issue classification and priority scoring
- Department assignment based on the reported problem
- A government dashboard with report status tracking and a map view
- Policy insights for identifying infrastructure gaps and demand hotspots
- English and Hindi language support

## Application flow

1. A citizen describes a community issue or uploads media.
2. JanSetu AI analyzes the report and shows the extracted issue, severity, department, and priority score.
3. The citizen reviews the result and submits it to the government workflow.
4. Government teams update the report as it moves from submission to resolution.
5. Policymakers use the aggregated reports to identify recurring problems and areas that need attention.

## Example scenarios

### A dangerous pothole near a school

A parent reports a large pothole that is making it difficult for school buses and two-wheelers to pass safely. JanSetu AI identifies the issue as a road infrastructure problem, marks it as high priority, and routes it to the roads department. When similar reports are received from nearby residents, the combined pattern highlights the location as an infrastructure hotspot.

### A leaking water pipe

A resident submits a video showing water continuously leaking from a roadside pipe. JanSetu AI recognizes the issue as a water and sanitation concern, estimates its severity, and assigns it to the appropriate department. The report can then be tracked from submission through inspection and resolution.

### Uncollected waste in a busy area

Several people report garbage accumulating near a market. JanSetu AI groups the reports around the same concern, identifies the repeated demand, and helps sanitation teams see that the issue affects more people than a single complaint suggests.

### A broken streetlight

A citizen reports a streetlight that has stopped working on an important route. JanSetu AI classifies it as an electricity issue and records the report for departmental action. A lower individual severity does not prevent policymakers from seeing a larger pattern if several nearby lights are reported over time.

## Why JanSetu AI matters

Citizen feedback is often detailed but difficult to organize at scale. JanSetu AI turns descriptions, images, and videos into structured information that can be reviewed by the right teams. It helps separate urgent problems from routine requests, reveals repeated issues, and gives policymakers evidence for deciding where attention and resources are most needed.

