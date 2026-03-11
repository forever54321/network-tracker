"use client";

/**
 * App-specific icons for detected applications.
 * Uses inline SVGs for brand logos and falls back to category-based icons.
 */

const CATEGORY_BG: Record<string, string> = {
  streaming: "bg-pink-500",
  social: "bg-blue-500",
  messaging: "bg-green-500",
  conferencing: "bg-indigo-500",
  music: "bg-purple-500",
  productivity: "bg-amber-500",
  cloud: "bg-sky-500",
  gaming: "bg-red-500",
  shopping: "bg-orange-500",
  developer: "bg-gray-600",
  smart_home: "bg-teal-500",
};

// Brand colors for specific apps
const APP_COLORS: Record<string, string> = {
  YouTube: "bg-red-600",
  Netflix: "bg-red-700",
  "Disney+": "bg-blue-800",
  Twitch: "bg-purple-600",
  Facebook: "bg-blue-600",
  Instagram: "bg-gradient-to-br from-purple-600 to-pink-500",
  "X (Twitter)": "bg-black dark:bg-gray-700",
  TikTok: "bg-black dark:bg-gray-700",
  Snapchat: "bg-yellow-400",
  Reddit: "bg-orange-600",
  LinkedIn: "bg-blue-700",
  WhatsApp: "bg-green-500",
  Telegram: "bg-sky-500",
  Signal: "bg-blue-600",
  Discord: "bg-indigo-600",
  Zoom: "bg-blue-500",
  "Microsoft Teams": "bg-indigo-700",
  Skype: "bg-sky-500",
  Spotify: "bg-green-600",
  "Apple Music": "bg-pink-600",
  Google: "bg-blue-500",
  "Google Drive": "bg-yellow-500",
  "Google Docs": "bg-blue-600",
  "Google Nest": "bg-blue-400",
  "Google Home": "bg-blue-400",
  GitHub: "bg-gray-900 dark:bg-gray-600",
  "Microsoft 365": "bg-orange-500",
  Outlook: "bg-blue-600",
  OneDrive: "bg-blue-500",
  iCloud: "bg-sky-400",
  "Apple Services": "bg-gray-800 dark:bg-gray-600",
  Steam: "bg-gray-800 dark:bg-gray-600",
  PlayStation: "bg-blue-800",
  Xbox: "bg-green-600",
  Amazon: "bg-orange-500",
  "Amazon Alexa": "bg-sky-400",
  "Amazon Prime Video": "bg-sky-600",
  Plex: "bg-yellow-500",
  Cloudflare: "bg-orange-500",
  AWS: "bg-amber-600",
  "Microsoft Azure": "bg-blue-600",
  Docker: "bg-blue-500",
  Ubiquiti: "bg-blue-600",
  Synology: "bg-blue-600",
  TrueNAS: "bg-blue-800",
  "Windows Update": "bg-blue-500",
  Yahoo: "bg-purple-700",
  Bing: "bg-teal-600",
  Nanoleaf: "bg-green-500",
  Qustodio: "bg-blue-600",
};

// SVG path data for app-specific icons
function getAppSvg(name: string, size: number): JSX.Element | null {
  const s = size;
  const cls = `h-${s} w-${s}`;

  switch (name) {
    // --- Streaming ---
    case "YouTube":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.5 6.2c-.3-1-1-1.8-2-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.5.6c-1 .3-1.8 1.1-2 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1 1.8 2 2.1 1.9.6 9.5.6 9.5.6s7.6 0 9.5-.6c1-.3 1.8-1.1 2-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z" />
        </svg>
      );
    case "Netflix":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.4 0l4.5 12.5V0h2.7v24c-.9 0-1.7-.1-2.6-.2L5.4 11V24H2.7V0h2.7zm10.5 0v24c.9 0 1.7-.1 2.6-.2V12.7L23 24V0h-2.6v12.3L16 0h-.1z" />
        </svg>
      );
    case "Twitch":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.6 11h1.7V6.3h-1.7V11zm4.5 0h1.7V6.3h-1.7V11zM6 0L1.7 4.2v15.6h5.1V24l4.3-4.2h3.4L21.6 13V0H6zm14 12.1l-3.4 3.5h-3.4l-3 3v-3H6.8V1.7h13.2v10.4z" />
        </svg>
      );
    case "Plex":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.7 2l7.3 10L4.7 22h14.6L12 12 19.3 2z" />
        </svg>
      );
    case "Disney+":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 12c0 5.5 4.5 10 10 10s10-4.5 10-10S17.5 2 12 2 2 6.5 2 12zm3 0c0-3.9 3.1-7 7-7s7 3.1 7 7-3.1 7-7 7-7-3.1-7-7z" />
          <path d="M10 8v8l6-4z" />
        </svg>
      );

    // --- Social ---
    case "Facebook":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1c0 6 4.4 11 10.1 11.9v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9H15.8c-1.5 0-1.9.9-1.9 1.8v2.2h3.3l-.5 3.5h-2.8v8.4C19.6 23 24 18.1 24 12.1z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 5.8.1 4.9.3 4.1.6c-.8.3-1.5.7-2.2 1.4C1.2 2.6.8 3.3.6 4.1.3 4.9.1 5.8.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.1 1.3.2 2.2.5 2.9.3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.6.5 2.9.5C8.3 24 8.7 24 12 24s3.7 0 4.9-.1c1.3-.1 2.2-.2 2.9-.5.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.6.5-2.9.1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.1-1.3-.2-2.2-.5-2.9-.3-.8-.7-1.5-1.4-2.2C21.4 1.2 20.7.8 19.9.6c-.8-.3-1.6-.5-2.9-.5C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-10.8a1.4 1.4 0 110-2.9 1.4 1.4 0 010 2.9z" />
        </svg>
      );
    case "X (Twitter)":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.2 2.3h3.5l-7.7 8.8L23 21.7h-7.1l-5.5-7.2-6.3 7.2H.5l8.2-9.4L.1 2.3h7.3l5 6.6 5.8-6.6zm-1.2 17.5h2L7.1 4.3H5l12 15.5z" />
        </svg>
      );
    case "Reddit":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm6.3 13.7c0 .1 0 .3.1.4 0 2.5-2.9 4.5-6.4 4.5s-6.4-2-6.4-4.5c0-.1 0-.3.1-.4-.5-.3-.9-.8-.9-1.5 0-1 .8-1.7 1.7-1.7.4 0 .8.2 1.1.4 1.1-.8 2.5-1.2 4-1.3l.7-3.5c0-.2.2-.3.4-.2l2.5.5c.2-.4.6-.7 1.1-.7.7 0 1.2.6 1.2 1.2s-.6 1.2-1.2 1.2c-.7 0-1.2-.5-1.2-1.2l-2.2-.4-.6 3.1c1.5.1 2.9.5 4 1.3.3-.3.7-.4 1.1-.4.9 0 1.7.8 1.7 1.7 0 .6-.4 1.2-.9 1.5zm-9.4-.6c-.7 0-1.2.6-1.2 1.2s.5 1.2 1.2 1.2c.7 0 1.2-.5 1.2-1.2s-.5-1.2-1.2-1.2zm4.6 3.3c-.1.1-1 .8-2.5.8s-2.4-.7-2.5-.8c-.1-.1-.1-.3 0-.4.1-.1.3-.1.4 0 .1.1.7.6 2 .6s2-.5 2-.6c.1-.1.3-.1.4 0 .2.1.2.3.2.4zm-.3-2.1c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2c.7 0 1.2.6 1.2 1.2s-.5 1.2-1.2 1.2z" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3.1-1.9-3.1-1.9 0-2.1 1.5-2.1 3v5.6H9.3V9h3.4v1.6c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.3zM5.3 7.4c-1.1 0-2.1-.9-2.1-2.1 0-1.1.9-2.1 2.1-2.1 1.1 0 2.1.9 2.1 2.1 0 1.2-.9 2.1-2.1 2.1zm1.8 13.1H3.5V9h3.6v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.8v20.5C0 23.2.8 24 1.8 24h20.5c.9 0 1.8-.8 1.8-1.8V1.8C24 .8 23.2 0 22.2 0z" />
        </svg>
      );

    // --- Messaging ---
    case "WhatsApp":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.3l-.4-.2-3.6.9.9-3.5-.2-.4c-1-1.6-1.5-3.4-1.5-5.3 0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9s2.9 4.3 2.9 6.9c0 5.5-4.5 9.8-9.8 9.8zM20.5 3.5C18.2 1.2 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.7.9 3.7 1.5 5.8 1.5 6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.5-8.4z" />
        </svg>
      );
    case "Telegram":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.9 0C5.4 0 0 5.4 0 12s5.4 12 11.9 12S24 18.6 24 12 18.5 0 11.9 0zm5.9 8.2l-1.8 8.7c-.1.6-.5.8-1.1.5l-3-2.2-1.4 1.4c-.2.2-.3.3-.6.3l.2-3 5.3-4.8c.2-.2-.1-.3-.3-.2L8.9 13l-2.9-.9c-.6-.2-.6-.6.1-.9l11.4-4.4c.5-.2 1 .1.3.4z" />
        </svg>
      );
    case "Discord":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.3 4.4a19.5 19.5 0 00-4.8-1.5c-.2.4-.4.8-.6 1.3a18 18 0 00-5.7 0 12 12 0 00-.6-1.3A19 19 0 003.7 4.4 20.5 20.5 0 00.5 17.7a19.6 19.6 0 006 3 14 14 0 001.2-2 12.7 12.7 0 01-2-.9l.5-.4a14 14 0 0011.9 0l.5.4a13 13 0 01-2 .9c.4.7.7 1.4 1.2 2a19.5 19.5 0 006-3A20.4 20.4 0 0020.3 4.4zM8 14.8c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2.1 1 2 2.3-.8 2.3-2 2.3zm8 0c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3c0 1.3-.8 2.3-2 2.3z" />
        </svg>
      );

    // --- Conferencing ---
    case "Zoom":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12c0 6.6-5.4 12-12 12S0 18.6 0 12 5.4 0 12 0s12 5.4 12 12zm-4.3-2.3l-3.4 2.5V9.5c0-.6-.5-1.1-1.1-1.1H6c-.6 0-1.1.5-1.1 1.1v5c0 .6.5 1.1 1.1 1.1h9.2c.6 0 1.1-.5 1.1-1.1v-2.7l3.4 2.5V9.7z" />
        </svg>
      );
    case "Microsoft Teams":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.6 7.5c1 0 1.9-.8 1.9-1.9s-.8-1.9-1.9-1.9-1.9.8-1.9 1.9.9 1.9 1.9 1.9zM17 5.6c1.2 0 2.1-1 2.1-2.1 0-1.2-1-2.1-2.1-2.1-1.2 0-2.1 1-2.1 2.1 0 1.2 1 2.1 2.1 2.1zM22.3 8.4h-3.5c.3.4.4.9.4 1.4v6.5c0 .5-.1 1-.3 1.4h1.8c1 0 1.7-.8 1.7-1.7V9c0-.4-.1-.6-.1-.6zM17.7 7.1h-5.3c-.8 0-1.4.6-1.4 1.4v7.2c0 .8.6 1.4 1.4 1.4h5.3c.8 0 1.4-.6 1.4-1.4V8.5c0-.8-.6-1.4-1.4-1.4zm-3 8.3c-2 0-3.6-1.6-3.6-3.6h1.2c0 1.3 1.1 2.4 2.4 2.4v1.2zM10 8.4H2.3c-.7 0-1.3.6-1.3 1.3v7c0 .7.6 1.3 1.3 1.3h2.9v3.5l3.5-3.5H10c.7 0 1.3-.6 1.3-1.3v-7c0-.7-.6-1.3-1.3-1.3zm-1 5.9H4.6v-.9H9v.9zm2-2.3H4.6v-.9H11v.9z" />
        </svg>
      );
    case "Skype":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.5 14.4c.1-.8.2-1.6.2-2.4 0-5.5-4.5-10-10-10-.8 0-1.6.1-2.4.2C9.2 1.5 7.9 1 6.5 1 3.5 1 1 3.5 1 6.5c0 1.4.5 2.7 1.2 3.8-.1.6-.2 1.1-.2 1.7 0 5.5 4.5 10 10 10 .6 0 1.1-.1 1.7-.2 1.1.8 2.4 1.2 3.8 1.2 3 0 5.5-2.5 5.5-5.5 0-1.3-.5-2.6-1.5-3.1zM12 18.5c-3.5 0-5.5-1.7-5.5-3.4 0-.9.7-1.5 1.6-1.5 2 0 1.5 2.9 3.9 2.9 1.2 0 1.9-.7 1.9-1.4 0-.4-.2-.9-.9-1.1l-4-1c-3.2-.8-3.8-2.5-3.8-4.1 0-3.3 3.1-4.4 5.6-4.4 2.5 0 5.1 1.4 5.1 3.1 0 .9-.8 1.4-1.7 1.4-1.7 0-1.4-2.4-3.6-2.4-1.3 0-1.8.6-1.8 1.2 0 .7.9 1 1.7 1.1l3 .7c3.2.7 3.8 2.6 3.8 4.3-.1 2.7-2 4.6-5.3 4.6z" />
        </svg>
      );

    // --- Music ---
    case "Spotify":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.7 0 12 0zm5.5 17.3c-.2.3-.6.4-1 .3-2.6-1.6-5.9-2-9.8-1.1-.4.1-.7-.1-.8-.5-.1-.4.1-.7.5-.8 4.2-1 7.8-.5 10.7 1.2.3.2.5.6.4.9zm1.5-3.3c-.3.4-.8.6-1.2.3-3-1.8-7.5-2.4-11-1.3-.5.1-1-.1-1.1-.6-.1-.5.2-1 .6-1.1 4-1.2 9-.6 12.4 1.5.4.2.5.8.3 1.2zm.1-3.4c-3.6-2.1-9.4-2.3-12.8-1.3-.5.2-1.1-.1-1.3-.6-.2-.5.1-1.1.6-1.3C9.6 6.4 16 6.6 20 9c.5.3.7.9.4 1.4-.3.4-.8.5-1.3.2z" />
        </svg>
      );

    // --- Cloud / Productivity ---
    case "Google":
    case "Google Drive":
    case "Google Docs":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.3h5.9a5.1 5.1 0 01-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8.1z" />
          <path d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.1-4.5H2.2v2.8C4 20.4 7.7 23 12 23z" />
          <path d="M5.9 14.2c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V7H2.2A11 11 0 001 12c0 1.8.4 3.5 1.2 5l3.7-2.8z" />
          <path d="M12 5.3c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.5 2.1 15 1 12 1 7.7 1 4 3.6 2.2 7l3.7 2.8C6.7 7.2 9.1 5.3 12 5.3z" />
        </svg>
      );
    case "Microsoft 365":
    case "Outlook":
    case "OneDrive":
    case "Windows Update":
    case "Bing":
    case "Microsoft Edge":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 0h11.4v11.4H0zm12.6 0H24v11.4H12.6zM0 12.6h11.4V24H0zm12.6 0H24V24H12.6z" />
        </svg>
      );
    case "Apple Services":
    case "iCloud":
    case "Apple Music":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.7 12.4c0-2.4 1.9-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.6 2.3 2.8 2.2 1.1 0 1.5-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 1.9-1.1 2.7-2.2.8-1.3 1.2-2.5 1.2-2.5s-2.3-.9-2.3-3.5h.3zM16.1 5c.6-.8 1-1.8 1-2.9 0-.1 0-.3-.1-.4-1 0-2.1.6-2.8 1.5-.6.7-1.1 1.8-1 2.8 1.1.1 2.2-.5 2.9-1z" />
        </svg>
      );
    case "GitHub":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17.1 4.7 18 5 18 5c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0024 12C24 5.4 18.6 0 12 0z" />
        </svg>
      );
    case "Docker":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.1 11.5h2.1v-2h-2.1v2zm-2.4 0h2.1v-2h-2.1v2zm-2.5 0h2.1v-2H8.2v2zm-2.4 0H8v-2H5.8v2zm-2.5 0h2.1v-2H3.3v2zm2.5-2.3H8V7.1H5.8v2.1zm2.4 0h2.1V7.1H8.2v2.1zm2.5 0h2.1V7.1h-2.1v2.1zm0-2.3h2.1V4.8h-2.1v2.1zm10.5 3.5c-.5-.3-1.6-.5-2.5-.3-.2-1.2-.9-2.3-2-3l-.4-.3-.3.4c-.4.6-.6 1.5-.5 2.3.1.5.3 1.1.6 1.5-.3.2-.8.3-1.2.5-.6.2-1.3.3-2 .3H.3l-.1.5c-.1 1.5.1 3.1.8 4.5 1 1.8 2.6 2.7 4.8 2.7.5 0 1 0 1.5-.1 1.9-.3 3.5-1 4.9-2.2 1.1-1 2-2.3 2.5-3.9h.2c1.5 0 2.4-.6 2.9-1.1.4-.3.6-.7.8-1l.1-.3-.3-.2z" />
        </svg>
      );

    // --- Smart Home ---
    case "Google Nest":
    case "Google Home":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.2l7.5 3.8L12 11.7 4.5 8 12 4.2zM4 9.2l7 3.5V19l-7-3.5V9.2zm9 9.8v-6.3l7-3.5v6.3l-7 3.5z" />
        </svg>
      );
    case "Amazon Alexa":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12c2.1 0 4-.5 5.8-1.5.3-.2.3-.5.1-.7l-.5-.5c-.2-.2-.5-.2-.7 0-1.4.8-3 1.3-4.7 1.3-5.5 0-10-4.5-10-10S6.5 2 12 2s10 4.5 10 10c0 1.6-.4 3.1-1 4.4-.3.5-.7 1-1.2 1.2-.3.1-.5 0-.6-.1-.1-.2-.2-.4-.2-.7V7.5c0-.3-.2-.5-.5-.5h-.8c-.2 0-.4.2-.5.4-.8-.5-1.8-.8-2.8-.8-3.1 0-5.6 2.7-5.5 5.9.1 3 2.5 5.4 5.5 5.4 1.4 0 2.7-.5 3.7-1.4.4.9 1.3 1.5 2.3 1.5.8 0 1.5-.3 2.1-.9.8-.8 1.4-1.7 1.8-2.8.7-1.6 1.1-3.5 1.1-5.4C24 5.4 18.6 0 12 0zm2.4 16c-.8.8-1.9 1.2-3 1.2-2.4 0-4.3-2-4.3-4.4 0-2.4 1.9-4.3 4.2-4.3s4.3 1.9 4.3 4.3v3c0 .1-.1.2-.2.2z" />
        </svg>
      );
    case "Nanoleaf":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 19h20L12 2zm0 4l6.5 11h-13L12 6z" />
        </svg>
      );

    // --- Shopping ---
    case "Amazon":
    case "Amazon Prime Video":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.2 14.5c-2.1 1.5-5.1 2.3-7.6 2.3-3.6 0-6.8-1.3-9.3-3.5-.2-.2 0-.4.2-.3 2.6 1.5 5.9 2.5 9.3 2.5 2.3 0 4.8-.5 7.1-1.4.3-.2.6.2.3.4z" />
          <path d="M15.1 13.4c-.3-.3-1.7-.2-2.4-.1-.2 0-.2-.2-.1-.3 1.2-.8 3.1-.6 3.3-.3.2.3-.1 2.3-1.1 3.3-.2.2-.3.1-.3-.1.3-.6.6-2.2.6-2.5z" />
          <path d="M12.7 3.1V1.5c0-.2.2-.4.4-.4h5.8c.2 0 .4.2.4.4v1.4c0 .2-.2.5-.6.9l-3 4.3c1.1 0 2.3.1 3.3.7.2.1.3.3.3.6v1.7c0 .2-.3.5-.5.4-2.2-1.2-5.2-1.3-7.7.1-.2.1-.5-.1-.5-.4V9.6c0-.3 0-.7.2-1l3.5-5h-3c-.2 0-.4-.2-.4-.4l-.2-.1z" />
        </svg>
      );

    // --- Other ---
    case "Cloudflare":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 18l.5-1.8c.2-.6.1-1.2-.2-1.6-.3-.4-.8-.6-1.3-.6l-9.1-.1c-.1 0-.2-.1-.2-.1 0-.1 0-.2.1-.2.2-.2.4-.3.6-.3l9.2-.1c1.3-.1 2.7-1.2 3.2-2.5l.6-1.7c0-.1.1-.2 0-.3C19.2 4.6 15.3 1 10.5 1 6.1 1 2.4 4 1.4 8.1c-.7-.5-1.5-.8-2.4-.7-1.3.2-2.3 1.2-2.5 2.5-.1.4 0 .8.1 1.2C-4 11.4-4.8 12-5 12.6c-.3.8.1 1.6.9 1.9.2.1.4.1.6.1H16c.2 0 .3-.1.4-.3l.1-.3z" transform="translate(5.5 3)" />
        </svg>
      );
    case "AWS":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.8 18.2c-2.4-1.7-3.5-3.6-3.5-3.6 1.7 1.2 3.7 2 5.9 2.2-.3.5-.7 1-1 1.4h-1.4zm10.6 0h-1.2c-.4-.4-.7-.9-1-1.4 2.2-.2 4.2-1 5.9-2.2 0 0-1.1 1.9-3.7 3.6zM12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-1.1 3.3l1.1-1.5 1.1 1.5L12 9 10.9 7.3zm.5 7.7H9.5l-.6-4.3L12 9l3.1 1.7-.6 4.3h-1.9l-.6-2 .6 2z" />
        </svg>
      );

    // NAS
    case "Synology":
    case "TrueNAS":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 5a2 2 0 012-2h16a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm16 3a1 1 0 100-2 1 1 0 000 2zm-2 0a1 1 0 100-2 1 1 0 000 2zM2 13a2 2 0 012-2h16a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4zm16 3a1 1 0 100-2 1 1 0 000 2zm-2 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      );
    case "Ubiquiti":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 17c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7zm0-11c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" />
        </svg>
      );

    default:
      return null;
  }
}

// Category fallback SVG icons
function getCategorySvg(category: string | null, size: number): JSX.Element {
  const s = size;
  const cls = `h-${s} w-${s}`;

  switch (category) {
    case "streaming":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case "social":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "messaging":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "conferencing":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case "music":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
        </svg>
      );
    case "productivity":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "gaming":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "cloud":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    case "shopping":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.5.5-.1 1.4.6 1.4H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      );
    case "smart_home":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      );
    case "developer":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
  }
}

interface AppIconProps {
  name: string;
  category?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: { container: "h-6 w-6", icon: 3, rounded: "rounded-md", text: "text-[10px]" },
  md: { container: "h-8 w-8", icon: 4, rounded: "rounded-lg", text: "text-xs" },
  lg: { container: "h-10 w-10", icon: 5, rounded: "rounded-xl", text: "text-sm" },
};

export function AppIcon({ name, category, size = "md", className = "" }: AppIconProps) {
  const s = SIZE_MAP[size];
  const bg = APP_COLORS[name] || CATEGORY_BG[category || ""] || "bg-gray-500";
  const appSvg = getAppSvg(name, s.icon);
  const icon = appSvg || getCategorySvg(category || null, s.icon);

  return (
    <div
      className={`flex ${s.container} shrink-0 items-center justify-center ${s.rounded} text-white ${bg} ${className}`}
    >
      {icon}
    </div>
  );
}

export function getAppBgColor(name: string, category?: string | null): string {
  return APP_COLORS[name] || CATEGORY_BG[category || ""] || "bg-gray-500";
}
