import "server-only";
import type { BirthdayParty } from "./birthday-party";

type RsvpFieldName = "name" | "email" | "attending" | "guestCount" | "note";

const RSVP_FIELDS: RsvpFieldName[] = [
  "name",
  "email",
  "attending",
  "guestCount",
  "note",
];

const INPUT_CLASS =
  "appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm";

const LABEL_CLASS =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const BUTTON_CLASS =
  "w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50";

const CARD_CLASS =
  "rounded-xl border border-pink-200 dark:border-gray-700 bg-pink-50 dark:bg-gray-800 p-4";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function detailCard(label: string, value: string): string {
  return `<div class="${CARD_CLASS}"><dt class="text-sm font-semibold text-pink-800 dark:text-pink-400">${escapeHtml(label)}</dt><dd class="mt-1 text-gray-800 dark:text-gray-200">${escapeHtml(value)}</dd></div>`;
}

function textField(
  id: string,
  name: string,
  type: "text" | "email",
  label: string,
  placeholder: string,
  autoComplete: string,
  maxLength: number,
): string {
  return `<div class="mt-4"><label class="${LABEL_CLASS}" for="${id}">${escapeHtml(label)}</label><input id="${id}" name="${name}" type="${type}" required maxlength="${maxLength}" autocomplete="${autoComplete}" placeholder="${escapeHtml(placeholder)}" class="${INPUT_CLASS}" /></div>`;
}

function renderField(name: RsvpFieldName, party: BirthdayParty): string {
  switch (name) {
    case "name":
      return textField(
        "birthday-name",
        "name",
        "text",
        party.fields.name.label,
        party.fields.name.placeholder,
        "name",
        200,
      );
    case "email":
      return textField(
        "birthday-email",
        "email",
        "email",
        party.fields.email.label,
        party.fields.email.placeholder,
        "email",
        320,
      );
    case "attending":
      return `<fieldset class="mt-4"><legend class="${LABEL_CLASS}">${escapeHtml(party.fields.attending.label)}</legend><div class="flex flex-col gap-2"><label class="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300"><input type="radio" name="attending" value="yes" required /> <span>${escapeHtml(party.fields.attending.yes)}</span></label><label class="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300"><input type="radio" name="attending" value="no" /> <span>${escapeHtml(party.fields.attending.no)}</span></label></div></fieldset>`;
    case "guestCount":
      return `<div class="mt-4"><label class="${LABEL_CLASS}" for="birthday-guest-count">${escapeHtml(party.fields.guestCount.label)}</label><input id="birthday-guest-count" name="guestCount" type="number" min="1" max="10" inputmode="numeric" placeholder="${escapeHtml(party.fields.guestCount.placeholder)}" class="${INPUT_CLASS}" /></div>`;
    case "note":
      return `<div class="mt-4"><label class="${LABEL_CLASS}" for="birthday-note">${escapeHtml(party.fields.note.label)}</label><textarea id="birthday-note" name="note" rows="4" maxlength="2000" placeholder="${escapeHtml(party.fields.note.placeholder)}" class="${INPUT_CLASS}"></textarea></div>`;
    default: {
      const exhaustive: never = name;
      return exhaustive;
    }
  }
}

export function renderBirthdayHtml(party: BirthdayParty): string {
  const fields = RSVP_FIELDS.map((name) => renderField(name, party)).join("");
  return `<div><h2 class="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">${escapeHtml(party.title)}</h2><dl class="grid grid-cols-1 md:grid-cols-2 gap-4">${detailCard(party.dateLabel, party.date)}${detailCard(party.timeLabel, party.time)}${detailCard(party.placeLabel, party.place)}<div class="${CARD_CLASS} md:col-span-2"><dt class="text-sm font-semibold text-pink-800 dark:text-pink-400">${escapeHtml(party.bringLabel)}</dt><dd class="mt-1 text-gray-800 dark:text-gray-200">${escapeHtml(party.whatToBring)}</dd></div></dl><h3 class="text-xl font-semibold mt-8 mb-2 text-gray-800 dark:text-gray-200">${escapeHtml(party.rsvpHeading)}</h3><p class="text-gray-600 dark:text-gray-300 mb-4">${escapeHtml(party.rsvpIntro)}</p><form id="birthday-rsvp-form" class="mt-4">${fields}<div class="mt-6"><button type="submit" class="${BUTTON_CLASS}">${escapeHtml(party.submitLabel)}</button></div></form></div>`;
}
