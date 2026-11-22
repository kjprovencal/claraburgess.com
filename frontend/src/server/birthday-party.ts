import "server-only";

/**
 * Birthday party details and RSVP form copy.
 *
 * Edit this file when the party information changes.
 * Replace every "REPLACE WITH ..." value.
 *
 * Nothing in this file is sent to the browser until Cloudflare Turnstile
 * accepts the visitor. Do not import it from a page or a client component.
 */
export type BirthdayParty = {
  title: string;
  dateLabel: string;
  date: string;
  timeLabel: string;
  time: string;
  placeLabel: string;
  place: string;
  bringLabel: string;
  whatToBring: string;
  rsvpHeading: string;
  rsvpIntro: string;
  submitLabel: string;
  successMessage: string;
  fields: {
    name: { label: string; placeholder: string };
    email: { label: string; placeholder: string };
    attending: { label: string; yes: string; no: string };
    guestCount: { label: string; placeholder: string };
    note: { label: string; placeholder: string };
  };
};

export const birthdayParty: BirthdayParty = {
  title: "REPLACE WITH PARTY TITLE",
  dateLabel: "REPLACE WITH DATE LABEL",
  date: "REPLACE WITH DATE",
  timeLabel: "REPLACE WITH TIME LABEL",
  time: "REPLACE WITH TIME",
  placeLabel: "REPLACE WITH PLACE LABEL",
  place: "REPLACE WITH PLACE",
  bringLabel: "REPLACE WITH WHAT TO BRING LABEL",
  whatToBring: "REPLACE WITH WHAT TO BRING",
  rsvpHeading: "REPLACE WITH RSVP HEADING",
  rsvpIntro: "REPLACE WITH RSVP INTRO",
  submitLabel: "REPLACE WITH SUBMIT BUTTON TEXT",
  successMessage: "REPLACE WITH SUCCESS MESSAGE",
  fields: {
    name: {
      label: "REPLACE WITH NAME LABEL",
      placeholder: "REPLACE WITH NAME PLACEHOLDER",
    },
    email: {
      label: "REPLACE WITH EMAIL LABEL",
      placeholder: "REPLACE WITH EMAIL PLACEHOLDER",
    },
    attending: {
      label: "REPLACE WITH ATTENDING LABEL",
      yes: "REPLACE WITH YES OPTION",
      no: "REPLACE WITH NO OPTION",
    },
    guestCount: {
      label: "REPLACE WITH GUEST COUNT LABEL",
      placeholder: "REPLACE WITH GUEST COUNT PLACEHOLDER",
    },
    note: {
      label: "REPLACE WITH NOTE LABEL",
      placeholder: "REPLACE WITH NOTE PLACEHOLDER",
    },
  },
};
