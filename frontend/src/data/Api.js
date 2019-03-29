const Api = {
    url:'https://authbook.herokuapp.com',
    
    setUrl(url){
        this.url = url;
    },
    
    signup(username, displayName, email, password, passwordCheck){
        return fetch(`${this.url}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
              },
            body: JSON.stringify({
                username: username.toString(),
                email: email.toString(),
                displayName: displayName.toString(),
                password: password.toString(),
                passwordCheck: passwordCheck.toString()
            })
        });
    },
    
    login(username, password){
        return fetch(`${this.url}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
              },
            body: JSON.stringify({
                username: username.toString(),
                password: password.toString()
            })
        });
    },
    
    async fetchUserInfo(){
        const session = localStorage.getItem('session');
        const result = fetch(`${this.url}/auth/userinfo`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'SESSION': session
              }
        });
        if(result.ok){
            const userdata = await result.json();
            localStorage.setItem("displayName", userdata.displayName);
            localStorage.setItem("username", userdata.username);
            localStorage.setItem("email", userdata.email);
            localStorage.setItem("encryptionKeySet", userdata.isSeedKeySet);
            localStorage.setItem("isEmailVerified", userdata.isEmailVerified);
        }
    },
    
    reqPasswordRecovery(email){
        return fetch(`${this.url}/auth/request_recover`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
              },
            body: JSON.stringify({
                email: email.toString()
            })
        });
    },
    
    recoverPassword(username, verificationCode, newPassword, newPasswordCheck){
        return fetch(`${this.url}/auth/recover`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
              },
            body: JSON.stringify({
                username: username.toString(),
                verificationCode: verificationCode.toString(),
                newPassword: newPassword.toString(),
                newPasswordCheck: newPasswordCheck.toString()
            })
        });
    },
    
    changeEmail(newEmail){
        const session = localStorage.getItem('session');
        return fetch(`${this.url}/auth/change_email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'SESSION': session
              },
            body: JSON.stringify({
                email: newEmail.toString()
            })
        });
    },
    
    verifyEmail(verificationCode){
        const session = localStorage.getItem('session');
        return fetch(`${this.url}/auth/verify`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'SESSION': session
              },
            body: JSON.stringify({
                verificationCode: verificationCode.toString()
            })
        });
    },
    
    getAccounts(){
        const session = localStorage.getItem('session');
        return fetch(`${this.url}/seeds/all`, {
            method: 'GET',
            headers: {
                'SESSION': session
            }
        });
    },
    
    addAccount(name, url, username, info, seed, key){
        const session = localStorage.getItem('session');
        return fetch(`${this.url}/seeds/add`, {
            method: 'POST',
            headers: {
                'SESSION': session,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                seedName: name,
                url: url,
                accountUserName: username,
                seedInfo: info,
                seedValue: seed,
                seedKey: key
            })
        });
    },
    
    updateAccount(id, name, url, username, info, seed, key){
        const session = localStorage.getItem('session');
        return fetch(`${this.url}/seeds/edit`, {
            method: 'PUT',
            headers: {
                'SESSION': session,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                seedName: name,
                url: url,
                accountUserName: username,
                seedInfo: info,
                seedValue: seed,
                seedKey: key
            })
        });
    },
    
    deleteAccount(id){
        const session = localStorage.getItem('session');
        return fetch(`${this.url}/seeds/delete`, {
            method: 'DELETE',
            headers: {
                'SESSION': session,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id
            })
        });
    },
    
    setEncryptionKey(key, keyCheck){
        const session = localStorage.getItem('session');
        return fetch(`${this.url}/seeds/set_seedkey`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'SESSION': session
            },
            body: JSON.stringify({
                seedKey: key,
                seedKeyCheck: keyCheck,
            })
        });
    }
};

export default Api;
