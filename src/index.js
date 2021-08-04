/* eslint-disable no-plusplus */
import { ajax } from 'rxjs/ajax';
import { catchError, switchMap } from 'rxjs/operators';
import { of, interval } from 'rxjs';

const mainContainer = document.getElementById('main-container');

function formatDateFromTimestamp(timestamp) {
  const d = new Date(timestamp * 1000);

  const addZero = (x) => ((x < 10) ? `0${x}` : x);

  const DD = addZero(d.getDate());
  const MM = addZero(d.getMonth() + 1);
  const YY = addZero(d.getFullYear() % 100);
  const HH = addZero(d.getHours());
  const mm = addZero(d.getMinutes());

  const dateString = `${HH}:${mm}&nbsp;${DD}.${MM}.${YY}`;
  const completeDate = dateString.replace('&nbsp;', ' ');
  return completeDate;
}

function build(message) {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message-container');

  const email = document.createElement('p');
  email.classList.add('email-data');
  email.textContent = message.from;

  const subject = document.createElement('p');
  subject.classList.add('subject-data');
  const subjectStringLength = message.subject.length;
  // eslint-disable-next-line no-unused-expressions
  subjectStringLength > 15 ? subject.textContent = `${message.subject.slice(0, 16)}...` : subject.textContent = message.subject;

  const date = document.createElement('p');
  date.classList.add('message-date');
  date.textContent = formatDateFromTimestamp(message.received);

  messageContainer.appendChild(email);
  messageContainer.appendChild(subject);
  messageContainer.appendChild(date);

  const firstChildElement = mainContainer.children[0];
  mainContainer.insertBefore(messageContainer, firstChildElement);
}

const sourceObs$ = interval(1000).pipe(switchMap(() => ajax.getJSON('https://rxjsserver.herokuapp.com/messages/unread')), catchError((error) => {
  // eslint-disable-next-line no-console
  console.log('error: ', error);
  return of(error);
}));

const subscription = sourceObs$.subscribe((userResponse) => {
  const { messages } = userResponse;
  for (let i = 0; i < messages.length; i++) {
    build(messages[i]);
  }
});

setTimeout(() => subscription.unsubscribe(), 5000);
