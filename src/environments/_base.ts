import { FirebaseConfig } from '../app/firebase-config';

export const baseEnvironment = {
  production: false,
  sidenavOptions: [
    {
      label: 'Table Creator',
      routerLink: 'table-creator',
    }
  ],
  width: 50,
  height: 80,
  colors: ['black', 'red', 'blue', 'green', 'yellow', undefined],
  firebase: FirebaseConfig,
};
