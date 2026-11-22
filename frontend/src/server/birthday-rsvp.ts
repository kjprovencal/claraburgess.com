export type BirthdayAttendance = "yes" | "no";

export type ParsedBirthdayRsvp = {
  name: string;
  email: string;
  attending: BirthdayAttendance;
  guestCount: number;
  note?: string;
};

export type ParseBirthdayRsvpResult =
  | { ok: true; value: ParsedBirthdayRsvp }
  | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseAttendance(value: string): BirthdayAttendance | null {
  switch (value) {
    case "yes":
    case "no":
      return value;
    default:
      return null;
  }
}

function guestCountFor(
  attending: BirthdayAttendance,
  raw: string,
): number | null {
  switch (attending) {
    case "no":
      return 0;
    case "yes": {
      const trimmed = raw.trim();
      if (trimmed === "") {
        return 1;
      }
      const count = Number(trimmed);
      if (!Number.isInteger(count) || count < 1 || count > 10) {
        return null;
      }
      return count;
    }
    default: {
      const exhaustive: never = attending;
      return exhaustive;
    }
  }
}

export function parseBirthdayRsvp(input: {
  name: string;
  email: string;
  attending: string;
  guestCount: string;
  note: string;
}): ParseBirthdayRsvpResult {
  const name = input.name.trim();
  if (name.length < 1 || name.length > 200) {
    return { ok: false, error: "Check the form and try again." };
  }

  const email = input.email.trim().toLowerCase();
  if (email.length > 320 || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Check the form and try again." };
  }

  const attending = parseAttendance(input.attending);
  if (attending === null) {
    return { ok: false, error: "Check the form and try again." };
  }

  const guestCount = guestCountFor(attending, input.guestCount);
  if (guestCount === null) {
    return { ok: false, error: "Check the form and try again." };
  }

  const note = input.note.trim();
  if (note.length > 2000) {
    return { ok: false, error: "Check the form and try again." };
  }

  return {
    ok: true,
    value: {
      name,
      email,
      attending,
      guestCount,
      ...(note === "" ? {} : { note }),
    },
  };
}

export function readFormText(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}
