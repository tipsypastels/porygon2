import { clamp } from 'support/number';
import { delete_whitepsace } from 'support/string';

const PATTERN = new RegExp('^[🐪🐫]+$', 'mu');
const RESPONSE = 'yo '; // enshrined in ancient tradition
const RESPONSE_MAX_COUNT = 100;
const CHARS_PER_CAMEL = 2; // unicode emoji = 2 characters

export function camel_response_for_message(message: string) {
  message = delete_whitepsace(message);

  if (PATTERN.exec(message)) {
    const count = clamp(message.length / CHARS_PER_CAMEL, 0, RESPONSE_MAX_COUNT);
    const response = RESPONSE.repeat(count);

    return response;
  }
}
