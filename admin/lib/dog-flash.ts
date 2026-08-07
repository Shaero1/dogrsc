const PREFIX = 'dogrsc:';

export type DogFlashMessages = {
  dogCreated?: boolean;
  dogUpdated?: boolean;
  photoErrors?: string;
  createdDogId?: string;
};

export function setDogFlash(messages: DogFlashMessages): void {
  if (typeof sessionStorage === 'undefined') return;

  if (messages.dogCreated) {
    sessionStorage.setItem(`${PREFIX}dogCreated`, '1');
  }
  if (messages.dogUpdated) {
    sessionStorage.setItem(`${PREFIX}dogUpdated`, '1');
  }
  if (messages.photoErrors) {
    sessionStorage.setItem(`${PREFIX}photoErrors`, messages.photoErrors);
  }
  if (messages.createdDogId) {
    sessionStorage.setItem(`${PREFIX}createdDogId`, messages.createdDogId);
  }
}

export function consumeDogFlash(): DogFlashMessages {
  if (typeof sessionStorage === 'undefined') return {};

  const result: DogFlashMessages = {};

  if (sessionStorage.getItem(`${PREFIX}dogCreated`)) {
    result.dogCreated = true;
    sessionStorage.removeItem(`${PREFIX}dogCreated`);
  }

  if (sessionStorage.getItem(`${PREFIX}dogUpdated`)) {
    result.dogUpdated = true;
    sessionStorage.removeItem(`${PREFIX}dogUpdated`);
  }

  const photoErrors = sessionStorage.getItem(`${PREFIX}photoErrors`);
  if (photoErrors) {
    result.photoErrors = photoErrors;
    sessionStorage.removeItem(`${PREFIX}photoErrors`);
  }

  const createdDogId = sessionStorage.getItem(`${PREFIX}createdDogId`);
  if (createdDogId) {
    result.createdDogId = createdDogId;
    sessionStorage.removeItem(`${PREFIX}createdDogId`);
  }

  return result;
}
