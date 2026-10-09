# Noor

A calm, personal Life OS for iPhone: salah with adhan, Quran and daily tasbihat, rest-day tracking, meals and water, journaling, hobby discovery, family birthdays and a little play.

It is an installable web app (PWA). Open the site in Safari, tap Share, then "Add to Home Screen".

**Privacy:** everything is stored on the phone (localStorage and IndexedDB). Nothing is sent to a server. Personal details are never part of this code; they are added on the device through a one-time setup link.

## Develop

```
npm install
npm run dev
npm run build
```

Prayer times use the [`adhan`](https://github.com/batoulapps/adhan-js) library with the University of Islamic Sciences, Karachi method.
