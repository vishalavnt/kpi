import {action, makeAutoObservable} from 'mobx';
import {ANON_USERNAME, ANON_USER_TYPE} from 'js/constants';
import {dataInterface} from 'js/dataInterface';
import type {AccountResponse} from 'js/dataInterface';
import {log} from 'js/utils';
import type {Json} from 'js/components/common/common.interfaces';
import type {ProjectViewsSettings} from 'js/projects/customViewStore';
import { actions } from 'js/actions';
import {
  checkCrossStorageTimeOut,
  checkCrossStorageUser,
  updateCrossStorageTimeOut
} from 'js/ocutils';

class SessionStore {
  currentAccount: AccountResponse | {username: string, user_type: string} = {
    username: ANON_USERNAME,
    user_type: ANON_USER_TYPE
  };
  isAuthStateKnown = false;
  isLoggedIn = false;
  isInitialLoadComplete = false;
  isPending = false;
  isInitialRoute = true;

  constructor() {
    makeAutoObservable(this);
    this.verifyLogin();
    // TODO make this not awful
    setTimeout(() => (this.isInitialRoute = false), 1000);
  }

  private verifyLogin() {
    this.isPending = true;
    dataInterface.getProfile().then(
      action(
        'verifyLoginSuccess',
        (account: AccountResponse | {message: string}) => {
          this.isPending = false;
          this.isInitialLoadComplete = true;
          if ('email' in account) {
            this.currentAccount = account;
            this.isLoggedIn = true;
            const currentUserName = this.currentAccount.username;
            if (currentUserName !== '') {
              const crossStorageUserName = currentUserName.slice(0, currentUserName.lastIndexOf('+'))
              console.log('verifyLogin check');
              checkCrossStorageUser(crossStorageUserName)
                .then(checkCrossStorageTimeOut)
                .then(updateCrossStorageTimeOut)
                .catch(function(err: string) {
                  if (err == 'logout') {
                    console.log('triggerLoggedIn logout');
                    actions.auth.logout();
                  } else if (err == 'user-changed') {
                    console.log('triggerLoggedIn user changed');
                    actions.auth.logout();
                  }
                });
            }
            window.parent.postMessage('fd_loggedin', '*');
          }
          this.isAuthStateKnown = true;
        }
      ),
      action('verifyLoginFailure', (xhr: any) => {
        this.isPending = false;
        log('login not verified', xhr.status, xhr.statusText);
      })
    );
  }

  public refreshAccount() {
    this.isPending = true;
    dataInterface.getProfile().then(
      action(
        'refreshSuccess',
        (account: AccountResponse | {message: string}) => {
          this.isPending = false;
          if ('email' in account) {
            this.currentAccount = account;
          }
        }
      )
    );
  }

  /** Updates one of the `extra_details`. */
  public setDetail(detailName: string, value: Json | ProjectViewsSettings) {
    dataInterface.patchProfile({extra_details: {[detailName]: value}}).then(
      action(
        'setDetailSuccess',
        (account: AccountResponse) => {
          if ('email' in account) {
            this.currentAccount = account;
          }
        }
      )
    );
  }
}

export default new SessionStore();
